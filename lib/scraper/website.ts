import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { load } from "cheerio";
import { z } from "zod";
import { env } from "@/lib/env";
import { extractJson } from "@/lib/blueprint/schema";
import { runGeminiPrompt, isGeminiConfigured } from "@/lib/ai/gemini";
import { withTimeout } from "@/lib/ai/timeout";
import type { QuestionnaireAnswers } from "@/lib/questionnaire/schema";

// Website Import — the scraper behind the questionnaire's "Do you have a
// website?" step. Fetches the customer's existing site (hardened against SSRF),
// parses it with cheerio, then maps the text to questionnaire fields with the
// lightweight AI chain (Cursor light model -> Gemini), falling back to rules.

export type ScrapedSite = {
  url: string;
  title: string;
  metaDescription: string;
  headings: string[];
  bodyText: string;
  emails: string[];
  phones: string[];
  footerText: string;
};

export type ScrapeErrorCode =
  | "INVALID_URL"
  | "BLOCKED_HOST"
  | "FETCH_FAILED"
  | "NOT_HTML"
  | "EMPTY_PAGE";

export class ScrapeError extends Error {
  constructor(public code: ScrapeErrorCode, message: string) {
    super(message);
    this.name = "ScrapeError";
  }
}

const BODY_CAP_BYTES = 2 * 1024 * 1024;
const TEXT_CAP_CHARS = 8000;
const FETCH_TIMEOUT_MS = 10_000;
const AI_TIMEOUT_MS = 20_000;

// ---- URL hardening ---------------------------------------------------------

function normalizeUrl(raw: string): URL {
  const trimmed = (raw || "").trim();
  if (!trimmed) throw new ScrapeError("INVALID_URL", "Enter a website URL.");
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new ScrapeError("INVALID_URL", "That doesn't look like a valid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ScrapeError("INVALID_URL", "Only http/https websites can be imported.");
  }
  url.username = "";
  url.password = "";
  url.hash = "";
  return url;
}

function isPrivateIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224 // multicast / reserved
    );
  }
  if (v === 6) {
    const lower = ip.toLowerCase();
    return (
      lower === "::1" ||
      lower === "::" ||
      lower.startsWith("fe80:") || // link-local
      lower.startsWith("fc") || // unique local fc00::/7
      lower.startsWith("fd") ||
      lower.startsWith("::ffff:0:") // v4-mapped handled above once unwrapped
    );
  }
  return false;
}

async function assertPublicHost(url: URL): Promise<void> {
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localhost")
  ) {
    throw new ScrapeError("BLOCKED_HOST", "That address isn't allowed.");
  }
  if (isIP(host)) {
    if (isPrivateIp(host)) throw new ScrapeError("BLOCKED_HOST", "That address isn't allowed.");
    return;
  }
  // DNS-rebinding guard: resolve and re-check the concrete address.
  try {
    const { address } = await lookup(host);
    if (isPrivateIp(address)) {
      throw new ScrapeError("BLOCKED_HOST", "That address isn't allowed.");
    }
  } catch (err) {
    if (err instanceof ScrapeError) throw err;
    throw new ScrapeError("FETCH_FAILED", "Could not resolve that domain.");
  }
}

// ---- Fetch + parse ----------------------------------------------------------

async function readCappedBody(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > BODY_CAP_BYTES) {
      await reader.cancel().catch(() => {});
      out += decoder.decode(value.subarray(0, value.byteLength - (received - BODY_CAP_BYTES)));
      break;
    }
    out += decoder.decode(value, { stream: true });
  }
  return out;
}

function collapse(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export async function fetchAndParseWebsite(rawUrl: string): Promise<ScrapedSite> {
  const url = normalizeUrl(rawUrl);
  await assertPublicHost(url);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
  } catch {
    throw new ScrapeError("FETCH_FAILED", "We couldn't reach that website.");
  }

  if (!res.ok) {
    throw new ScrapeError("FETCH_FAILED", `That website responded with ${res.status}.`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (!/text\/html|application\/xhtml/i.test(contentType)) {
    throw new ScrapeError("NOT_HTML", "That URL doesn't point to a web page.");
  }
  // Redirects can land on a different host — re-validate the final destination.
  if (res.url) await assertPublicHost(new URL(res.url));

  const html = await readCappedBody(res);
  const $ = load(html);

  $("script, style, noscript, svg, iframe, form, select").remove();

  const title = collapse($("title").first().text()) || collapse($("h1").first().text());
  const metaDescription =
    collapse($('meta[name="description"]').attr("content") || "") ||
    collapse($('meta[property="og:description"]').attr("content") || "");

  const headings: string[] = [];
  $("h1, h2").each((_, el) => {
    const t = collapse($(el).text());
    if (t && !headings.includes(t)) headings.push(t);
    return headings.length < 20;
  });

  const container = $("main").length ? $("main") : $("article").length ? $("article") : $("body");
  const bodyText = collapse(container.text()).slice(0, TEXT_CAP_CHARS);

  const footerText = collapse($("footer").text()).slice(0, 1000);

  const emails = new Set<string>();
  $('a[href^="mailto:"]').each((_, el) => {
    const addr = ($(el).attr("href") || "").replace(/^mailto:/i, "").split("?")[0].trim();
    if (addr) emails.add(addr);
  });
  for (const m of bodyText.matchAll(/[\w.+-]+@[\w-]+\.[\w.]+/g)) emails.add(m[0]);

  const phones = new Set<string>();
  $('a[href^="tel:"]').each((_, el) => {
    const num = ($(el).attr("href") || "").replace(/^tel:/i, "").trim();
    if (num) phones.add(num);
  });
  for (const m of bodyText.matchAll(/(\+?\d[\d\s().-]{7,}\d)/g)) {
    const digits = m[0].replace(/\D/g, "");
    if (digits.length >= 8 && digits.length <= 15) phones.add(m[0].trim());
  }

  if (bodyText.length < 200) {
    throw new ScrapeError(
      "EMPTY_PAGE",
      "That page has almost no readable text (it may need JavaScript to load)."
    );
  }

  return {
    url: (res.url || url).toString(),
    title,
    metaDescription,
    headings,
    bodyText,
    emails: [...emails].slice(0, 5),
    phones: [...phones].slice(0, 5),
    footerText,
  };
}

// ---- AI extraction ----------------------------------------------------------

const scrapeResultSchema = z.object({
  businessName: z.string().max(80).optional(),
  industry: z.string().max(60).optional(),
  description: z.string().max(600).optional(),
  location: z.string().max(80).optional(),
  targetAudience: z.string().max(200).optional(),
  demographics: z.string().max(200).optional(),
  services: z.array(z.string().min(1).max(60)).max(12).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(40).optional(),
});

export type ScrapedFields = Partial<
  Pick<
    QuestionnaireAnswers,
    | "businessName"
    | "industry"
    | "description"
    | "location"
    | "targetAudience"
    | "demographics"
    | "services"
    | "contactEmail"
    | "contactPhone"
  >
>;

function buildExtractPrompt(site: ScrapedSite): string {
  return [
    "You are extracting business facts from a company's existing website to prefill",
    "a questionnaire. Return ONLY valid JSON — no markdown, no commentary.",
    "",
    "Allowed keys (omit any you cannot infer from the text; never invent facts,",
    "emails, or phone numbers that are not present):",
    '{ "businessName": string, "industry": string, "description": string (2-3 sentences, <=600 chars),',
    '  "location": string, "targetAudience": string, "demographics": string,',
    '  "services": string[] (max 12, short names), "contactEmail": string, "contactPhone": string }',
    "",
    "Website data:",
    JSON.stringify({
      url: site.url,
      title: site.title,
      metaDescription: site.metaDescription,
      headings: site.headings,
      emails: site.emails,
      phones: site.phones,
      footer: site.footerText,
      text: site.bodyText,
    }),
  ].join("\n");
}

async function runLightPrompt(prompt: string): Promise<string> {
  if (env.ai.cursorApiKey) {
    try {
      const { Agent } = await import("@cursor/sdk");
      const result = await withTimeout(
        Agent.prompt(prompt, {
          apiKey: env.ai.cursorApiKey,
          model: { id: env.ai.lightModel },
          local: { cwd: process.cwd() },
        }),
        AI_TIMEOUT_MS,
        "Cursor import"
      );
      if (result.status !== "error") {
        return typeof result.result === "string"
          ? result.result
          : JSON.stringify(result.result ?? "");
      }
    } catch (err) {
      console.error("[scrape] Cursor extraction failed; trying Gemini:", err);
    }
  }
  if (isGeminiConfigured()) {
    return runGeminiPrompt(prompt, env.ai.geminiModel);
  }
  throw new Error("No AI provider configured for extraction");
}

function sanitize(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(/[-]/g, "").replace(/\s+/g, " ").trim();
  }
  return value;
}

function sanitizeResult(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = sanitize(v);
    else if (Array.isArray(v)) out[k] = v.map(sanitize).filter((s) => typeof s === "string" && s);
    else out[k] = v;
  }
  return out;
}

function rulesOnlyFallback(site: ScrapedSite): ScrapedFields {
  const fields: ScrapedFields = {};
  if (site.title) {
    fields.businessName = site.title.split(/[|—–-]/)[0]?.trim().slice(0, 80) || undefined;
  }
  if (site.metaDescription) fields.description = site.metaDescription.slice(0, 600);
  if (site.emails[0]) fields.contactEmail = site.emails[0];
  if (site.phones[0]) fields.contactPhone = site.phones[0];
  return fields;
}

/**
 * Maps a scraped site to questionnaire fields with the light AI chain. Falls
 * back to deterministic rules when no provider is configured or the model's
 * JSON can't be validated after one repair attempt.
 */
export async function extractQuestionnaireFields(site: ScrapedSite): Promise<ScrapedFields> {
  const prompt = buildExtractPrompt(site);
  try {
    let raw = await runLightPrompt(prompt);
    let parsed = scrapeResultSchema.safeParse(sanitizeResult(extractJson(raw) ?? {}));

    if (!parsed.success) {
      const repair = [
        "Your previous response was not valid JSON for the requested shape.",
        "Return ONLY corrected JSON with the allowed keys. Issues:",
        ...parsed.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`),
        "",
        "Previous output:",
        raw,
      ].join("\n");
      raw = await runLightPrompt(repair);
      parsed = scrapeResultSchema.safeParse(sanitizeResult(extractJson(raw) ?? {}));
    }

    if (parsed.success) {
      const data = parsed.data;
      const fields: ScrapedFields = {};
      for (const [k, v] of Object.entries(data)) {
        if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) continue;
        (fields as Record<string, unknown>)[k] = v;
      }
      if (Object.keys(fields).length > 0) return fields;
    }
    console.warn("[scrape] AI extraction produced nothing usable; using rules fallback.");
  } catch (err) {
    console.error("[scrape] AI extraction failed; using rules fallback:", err);
  }
  return rulesOnlyFallback(site);
}
