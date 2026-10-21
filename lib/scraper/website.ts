import { load } from "cheerio";
import { z } from "zod";
import { env } from "@/lib/env";
import { extractJson } from "@/lib/blueprint/schema";
import { runCursorText } from "@/lib/ai/cursor-runtime";
import { estimateTokens, recordUsage } from "@/lib/ai/usage";
import { fetchGuarded, readCappedText, ScrapeError } from "@/lib/scraper/fetch-guard";
import type { QuestionnaireAnswers } from "@/lib/questionnaire/schema";

export { ScrapeError };
export type { ScrapeErrorCode } from "@/lib/scraper/fetch-guard";

// Website Import — the scraper behind the questionnaire's "Do you have a
// website?" step. Fetches the customer's existing site (hardened against SSRF),
// parses it with cheerio, then maps the text to questionnaire fields with the
// lightweight Cursor model, falling back to rules.

export type JsonLdFacts = {
  name?: string;
  description?: string;
  industry?: string;
  location?: string;
  email?: string;
  phone?: string;
  services: string[];
};

export type ScrapedSite = {
  url: string;
  title: string;
  metaDescription: string;
  ogSiteName: string;
  headings: string[];
  navLabels: string[];
  bodyText: string;
  emails: string[];
  phones: string[];
  footerText: string;
  jsonLd: JsonLdFacts;
  /**
   * Raw HTML kept only in memory for the brand pass. Never persisted or
   * returned to the client — it still contains the page's own markup.
   */
  html: string;
};

const BODY_CAP_BYTES = 2 * 1024 * 1024;
const TEXT_CAP_CHARS = 8000;
const FETCH_TIMEOUT_MS = 10_000;

function collapse(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

const SCHEMA_INDUSTRY: Record<string, string> = {
  dentist: "Dental clinic",
  dentalclinic: "Dental clinic",
  physician: "Healthcare",
  hospital: "Healthcare",
  medicalclinic: "Healthcare",
  medicalbusiness: "Healthcare",
  restaurant: "Restaurant",
  cafeorcoffeeshop: "Cafe",
  foodestablishment: "Restaurant",
  store: "Retail",
  clothingstore: "Retail",
  electronicsstore: "Retail",
  attorney: "Legal services",
  legalService: "Legal services",
  legalservice: "Legal services",
  realestatesagent: "Real estate",
  realestateagent: "Real estate",
  lodgebusiness: "Hospitality",
  hotel: "Hospitality",
  motelandhotel: "Hospitality",
  beautySalon: "Beauty salon",
  beautysalon: "Beauty salon",
  hairsalon: "Hair salon",
  gym: "Fitness",
  exercisegym: "Fitness",
  sportsactivitylocation: "Fitness",
  automotivesbusiness: "Automotive",
  autobodyShop: "Automotive",
  autorepair: "Automotive",
  localbusiness: "Local business",
  professionalService: "Professional services",
  professionalservice: "Professional services",
};

function schemaTypeKey(type: unknown): string {
  const raw = Array.isArray(type) ? type[0] : type;
  if (typeof raw !== "string") return "";
  return raw.replace(/^https?:\/\/schema\.org\//i, "").replace(/[\s_-]/g, "").toLowerCase();
}

function industryFromSchemaType(type: unknown): string | undefined {
  const key = schemaTypeKey(type);
  if (!key || key === "organization" || key === "website" || key === "webpage" || key === "article") {
    return undefined;
  }
  if (SCHEMA_INDUSTRY[key]) return SCHEMA_INDUSTRY[key];
  const raw = Array.isArray(type) ? type[0] : type;
  if (typeof raw !== "string") return undefined;
  const label = raw.replace(/^https?:\/\/schema\.org\//i, "").replace(/([a-z])([A-Z])/g, "$1 $2");
  return collapse(label).slice(0, 60) || undefined;
}

function readAddress(address: unknown): string | undefined {
  if (typeof address === "string") return collapse(address).slice(0, 80) || undefined;
  if (!address || typeof address !== "object") return undefined;
  const record = address as Record<string, unknown>;
  const parts = [
    record.addressLocality,
    record.addressRegion,
    record.addressCountry,
  ]
    .filter((part): part is string => typeof part === "string" && collapse(part).length > 0)
    .map((part) => collapse(part));
  return parts.length ? Array.from(new Set(parts)).join(", ").slice(0, 80) : undefined;
}

function readOffers(value: unknown): string[] {
  const nodes = Array.isArray(value) ? value : value ? [value] : [];
  const names: string[] = [];
  for (const node of nodes) {
    if (typeof node === "string") {
      const name = collapse(node);
      if (name) names.push(name.slice(0, 60));
      continue;
    }
    if (!node || typeof node !== "object") continue;
    const record = node as Record<string, unknown>;
    const item = record.itemOffered && typeof record.itemOffered === "object"
      ? (record.itemOffered as Record<string, unknown>)
      : record;
    const name = typeof item.name === "string" ? collapse(item.name) : "";
    if (name) names.push(name.slice(0, 60));
  }
  return names;
}

function collectJsonLdNode(node: unknown, into: JsonLdFacts) {
  if (!node || typeof node !== "object") return;
  const record = node as Record<string, unknown>;
  if (Array.isArray(record["@graph"])) {
    for (const entry of record["@graph"]) collectJsonLdNode(entry, into);
  }
  const typeKey = schemaTypeKey(record["@type"]);
  const skip =
    typeKey === "webpage" ||
    typeKey === "website" ||
    typeKey === "article" ||
    typeKey === "breadcrumblist" ||
    typeKey === "sitenavigationelement";
  if (!skip) {
    if (!into.name && typeof record.name === "string") into.name = collapse(record.name).slice(0, 80);
    if (!into.description && typeof record.description === "string") {
      into.description = collapse(record.description).slice(0, 600);
    }
    if (!into.industry) into.industry = industryFromSchemaType(record["@type"]);
    if (!into.location) into.location = readAddress(record.address);
    if (!into.email && typeof record.email === "string") into.email = collapse(record.email);
    if (!into.phone && typeof record.telephone === "string") into.phone = collapse(record.telephone);
    into.services.push(...readOffers(record.makesOffer), ...readOffers(record.hasOfferCatalog));
  }
  if (Array.isArray(record.mainEntity)) {
    for (const entry of record.mainEntity) collectJsonLdNode(entry, into);
  } else if (record.mainEntity) {
    collectJsonLdNode(record.mainEntity, into);
  }
}

export function extractJsonLdFacts(html: string): JsonLdFacts {
  const $ = load(html);
  const facts: JsonLdFacts = { services: [] };
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed: unknown = JSON.parse($(el).text());
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) collectJsonLdNode(node, facts);
    } catch {
      // A malformed JSON-LD block is just one missed hint.
    }
  });
  facts.services = uniqueShort(facts.services, 12);
  return facts;
}

const GENERIC_NAV = new Set([
  "home",
  "about",
  "about us",
  "contact",
  "contact us",
  "blog",
  "news",
  "faq",
  "faqs",
  "privacy",
  "privacy policy",
  "terms",
  "terms of service",
  "login",
  "sign in",
  "sign up",
  "search",
  "menu",
  "cart",
  "shop",
  "store",
  "read more",
  "learn more",
  "get started",
  "subscribe",
  "donate",
  "careers",
  "jobs",
  "main page",
  "talk",
  "contents",
  "in the news",
  "on this day",
  "did you know",
  "did you know ...",
]);

function uniqueShort(values: string[], max: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const next = collapse(value).slice(0, 60);
    const key = next.toLowerCase();
    if (!next || seen.has(key) || GENERIC_NAV.has(key) || next.length < 3) continue;
    seen.add(key);
    out.push(next);
    if (out.length >= max) break;
  }
  return out;
}

export async function fetchAndParseWebsite(rawUrl: string): Promise<ScrapedSite> {
  const { res, finalUrl } = await fetchGuarded(rawUrl, {
    timeoutMs: FETCH_TIMEOUT_MS,
    accept: "text/html,application/xhtml+xml",
  });

  const contentType = res.headers.get("content-type") || "";
  if (!/text\/html|application\/xhtml/i.test(contentType)) {
    await res.body?.cancel().catch(() => {});
    throw new ScrapeError("NOT_HTML", "That address isn't a web page we can read.");
  }

  const html = await readCappedText(res, BODY_CAP_BYTES);
  const $ = load(html);
  const jsonLd = extractJsonLdFacts(html);

  $("script, style, noscript, svg, iframe, form, select").remove();

  const title = collapse($("title").first().text()) || collapse($("h1").first().text());
  const metaDescription =
    collapse($('meta[name="description"]').attr("content") || "") ||
    collapse($('meta[property="og:description"]').attr("content") || "");
  const ogSiteName = collapse($('meta[property="og:site_name"]').attr("content") || "");

  const headings: string[] = [];
  $("h1, h2, h3").each((_, el) => {
    const t = collapse($(el).text());
    if (t && !headings.includes(t)) headings.push(t);
    return headings.length < 24;
  });

  const navLabels: string[] = [];
  $("nav a, header a").each((_, el) => {
    const t = collapse($(el).text());
    if (t && !navLabels.includes(t)) navLabels.push(t);
    return navLabels.length < 20;
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
      "We couldn't find enough text on that page. You can fill in the details yourself."
    );
  }

  if (jsonLd.email) emails.add(jsonLd.email);
  if (jsonLd.phone) phones.add(jsonLd.phone);

  return {
    url: finalUrl.toString(),
    title,
    metaDescription,
    ogSiteName,
    headings,
    navLabels,
    bodyText,
    emails: [...emails].slice(0, 5),
    phones: [...phones].slice(0, 5),
    footerText,
    jsonLd,
    html,
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
  goals: z.string().max(400).optional(),
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
    | "goals"
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
    '  "goals": string (what this website should achieve, <=400 chars),',
    '  "services": string[] (max 12, short names), "contactEmail": string, "contactPhone": string }',
    "",
    "Infer industry, audience, demographics, services, and goals from the page copy when they",
    "are clearly implied. Do not invent emails or phone numbers that are not present.",
    "",
    "Website data:",
    JSON.stringify({
      url: site.url,
      title: site.title,
      metaDescription: site.metaDescription,
      ogSiteName: site.ogSiteName,
      headings: site.headings,
      nav: site.navLabels,
      emails: site.emails,
      phones: site.phones,
      footer: site.footerText,
      jsonLd: site.jsonLd,
      text: site.bodyText,
    }),
  ].join("\n");
}

async function runLightPrompt(prompt: string): Promise<string> {
  if (!env.ai.cursorApiKey) {
    throw new Error("CURSOR_API_KEY is not configured");
  }
  const model = env.ai.lightModel;
  const output = await runCursorText(
    env.ai.cursorApiKey,
    model,
    prompt,
    env.ai.cursorLightTimeoutMs
  );
  const promptTokens = estimateTokens(prompt);
  const completionTokens = estimateTokens(output);
  recordUsage({
    provider: "cursor",
    model,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    estimated: true,
  });
  return output;
}

/**
 * Scraped markup carries stray control characters. They become spaces rather
 * than being dropped, so removing one cannot weld two words together.
 */
function blankControlCharacters(value: string): string {
  let out = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    out += code < 32 || code === 127 ? " " : char;
  }
  return out;
}

function sanitize(value: unknown): unknown {
  if (typeof value === "string") {
    return blankControlCharacters(value).replace(/\s+/g, " ").trim();
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

function compactFields(data: ScrapedFields): ScrapedFields {
  const fields: ScrapedFields = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) continue;
    (fields as Record<string, unknown>)[key] = value;
  }
  return fields;
}

const CHROME_COPY = /view source|view history|move to sidebar|main page talk|hide actions|tools move/i;

function mergeScrapedFields(base: ScrapedFields, overlay: ScrapedFields): ScrapedFields {
  const merged: ScrapedFields = { ...base };
  for (const [key, value] of Object.entries(overlay) as [keyof ScrapedFields, ScrapedFields[keyof ScrapedFields]][]) {
    if (typeof value === "string" && CHROME_COPY.test(value) && merged[key]) continue;
    (merged as Record<string, unknown>)[key as string] = value;
  }
  return compactFields(merged);
}

const INDUSTRY_HINTS: Array<[RegExp, string]> = [
  [/dentist|dental|orthodont|teeth/i, "Dental clinic"],
  [/encyclopedia|wikipedia|wiki/i, "Encyclopedia"],
  [/restaurant|bistro|eatery/i, "Restaurant"],
  [/caf[eé]|coffee shop/i, "Cafe"],
  [/hotel|motel|inn\b|lodg/i, "Hospitality"],
  [/gym|fitness|workout|training/i, "Fitness"],
  [/salon|spa\b|barber/i, "Beauty salon"],
  [/lawyer|attorney|legal/i, "Legal services"],
  [/real estate|realtor|propert/i, "Real estate"],
  [/plumb|hvac|electric|contractor/i, "Home services"],
  [/school|university|academy|education/i, "Education"],
  [/clinic|hospital|medical|health/i, "Healthcare"],
  [/software|saas|app\b|developer/i, "Software"],
  [/shop|store|retail|boutique/i, "Retail"],
];

function inferIndustry(site: ScrapedSite): string | undefined {
  if (site.jsonLd.industry) return site.jsonLd.industry;
  const haystack = [site.title, site.metaDescription, site.bodyText.slice(0, 800)].join(" ");
  for (const [pattern, label] of INDUSTRY_HINTS) {
    if (pattern.test(haystack)) return label;
  }
  return undefined;
}

function inferServices(site: ScrapedSite): string[] {
  const fromLd = uniqueShort(site.jsonLd.services, 12);
  if (fromLd.length) return fromLd;
  const headingOffers = uniqueShort(
    site.headings.filter((heading) => heading.length <= 48 && heading.split(" ").length <= 6),
    8
  );
  if (headingOffers.length) return headingOffers;
  return uniqueShort(site.navLabels, 6);
}

function locationFromFooter(footer: string): string | undefined {
  const match = footer.match(
    /\b([A-Z][a-zA-Z.]+(?:\s+[A-Z][a-zA-Z.]+){0,2},\s*[A-Z]{2}(?:\s+\d{5})?)\b/
  );
  return match?.[1]?.slice(0, 80);
}

/**
 * Deterministic answers from the page itself. Used when the model is down and
 * also to fill any questionnaire field the model left blank.
 */
export function fieldsFromSiteRules(site: ScrapedSite): ScrapedFields {
  const name =
    site.jsonLd.name ||
    site.ogSiteName ||
    site.title.split(/[|—–-]/)[0]?.trim() ||
    undefined;
  const description = (
    site.jsonLd.description ||
    site.metaDescription ||
    site.bodyText.slice(0, 400)
  ).slice(0, 600);
  const industry = inferIndustry(site) || (name ? "Local business" : undefined);
  const location = site.jsonLd.location || locationFromFooter(site.footerText);
  const services = inferServices(site);
  const offering = services[0] || industry || name || "this business";
  const audience = location
    ? `People in ${location} looking for ${offering}`
    : `People looking for ${offering}`;
  const demographics = location
    ? `Local customers and visitors in ${location}`
    : `Customers and visitors interested in ${offering}`;
  const contactVerb = site.emails[0] || site.phones[0] || site.jsonLd.email || site.jsonLd.phone
    ? "get in touch"
    : "learn more";
  const goals = name
    ? `Present ${name} clearly online and help visitors ${contactVerb}.`
    : `Present the business clearly and help visitors ${contactVerb}.`;

  return compactFields({
    businessName: name?.slice(0, 80),
    industry: industry?.slice(0, 60),
    description: description.length >= 10 ? description : undefined,
    location,
    targetAudience: audience.slice(0, 200),
    demographics: demographics.slice(0, 200),
    goals: goals.slice(0, 400),
    services: services.length ? services : industry ? [industry] : name ? [name] : [],
    contactEmail: [site.jsonLd.email, site.emails[0]].find((value) =>
      Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    ),
    contactPhone: site.jsonLd.phone || site.phones[0],
  });
}

/**
 * Maps a scraped site to questionnaire fields with the light AI chain. Falls
 * back to deterministic rules when no provider is configured or the model's
 * JSON can't be validated after one repair attempt. Rule-based answers always
 * fill any field the model omitted, so later wizard steps are not left blank.
 */
export async function extractQuestionnaireFields(site: ScrapedSite): Promise<ScrapedFields> {
  const rules = fieldsFromSiteRules(site);
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
      const fields = compactFields(parsed.data);
      if (Object.keys(fields).length > 0) return mergeScrapedFields(rules, fields);
    }
    console.warn("[scrape] AI extraction produced nothing usable; using rules fallback.");
  } catch (err) {
    console.error("[scrape] AI extraction failed; using rules fallback:", err);
  }
  return rules;
}
