/**
 * Browser audit of every public template demo:
 * - Does --brand CSS var resolve?
 * - Are there real typeable inputs / forms?
 * - Do CTA backgrounds use the brand color (not stuck default)?
 */

import puppeteer from "puppeteer";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// registry is TS — load slug list via a tiny inline list from filesystem
import fs from "node:fs";
import path from "node:path";

const templatesDir = path.join(process.cwd(), "templates");
const slugs = fs
  .readdirSync(templatesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(templatesDir, d.name, "metadata.ts")))
  .map((d) => d.name)
  .sort();

const BASE = process.env.AUDIT_BASE || "http://localhost:3000";

const chromePath =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const browser = await puppeteer.launch({
  headless: true,
  executablePath: chromePath,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
page.setDefaultTimeout(45000);

const results = [];

for (const slug of slugs) {
  const url = `${BASE}/templates/${slug}`;
  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded" });
    const status = res?.status() ?? 0;
    if (status >= 400) {
      results.push({ slug, ok: false, status, error: `HTTP ${status}` });
      continue;
    }
    await page.waitForSelector("body", { timeout: 15000 });
    // Give React a beat to hydrate
    await new Promise((r) => setTimeout(r, 400));

    const data = await page.evaluate(() => {
      const root =
        document.querySelector("[style*='--brand']") ||
        document.querySelector("[class*='scroll-smooth']") ||
        document.body;
      const cs = getComputedStyle(root);
      const brand = cs.getPropertyValue("--brand").trim();
      const brandStrong = cs.getPropertyValue("--brand-strong").trim();
      const brandSoft = cs.getPropertyValue("--brand-soft").trim();

      const inputs = [...document.querySelectorAll("input:not([type=checkbox]):not([type=hidden]), textarea")];
      const typeable = inputs.filter((el) => {
        const style = getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden" && !el.disabled && !el.readOnly;
      });

      const forms = [...document.querySelectorAll("form")];
      const mailtoLinks = [...document.querySelectorAll('a[href^="mailto:"]')];

      // Sample CTA-looking buttons/links for background color
      const ctas = [
        ...document.querySelectorAll("a, button"),
      ]
        .filter((el) => {
          const t = (el.textContent || "").trim().toLowerCase();
          return /send|contact|book|get in touch|message|start|reserve|request|call|submit/.test(t);
        })
        .slice(0, 6)
        .map((el) => {
          const s = getComputedStyle(el);
          return {
            text: (el.textContent || "").trim().slice(0, 40),
            bg: s.backgroundColor,
            color: s.color,
            border: s.borderColor,
          };
        });

      // Fake fields: decorative bordered spans with no input inside
      const fakeCandidates = [...document.querySelectorAll("span, div")].filter((el) => {
        if (el.querySelector("input, textarea")) return false;
        const cls = el.className?.toString?.() || "";
        return /rounded.*(border|px-6 py-5)/.test(cls) && /placeholder|opacity-50|F1FBE8\/50/i.test(cls + el.textContent);
      }).length;

      return {
        brand,
        brandStrong,
        brandSoft,
        inputCount: typeable.length,
        formCount: forms.length,
        mailtoCount: mailtoLinks.length,
        fakeCandidates,
        ctas,
        title: document.title,
      };
    });

    // Try typing into first input if present
    let typed = null;
    if (data.inputCount > 0) {
      const handle = await page.$("input:not([type=checkbox]):not([type=hidden]), textarea");
      if (handle) {
        await handle.click({ clickCount: 3 });
        await handle.type("AuditTest", { delay: 10 });
        typed = await page.evaluate((el) => el.value, handle);
        await handle.click({ clickCount: 3 });
        await page.keyboard.press("Backspace");
      }
    }

    const issues = [];
    if (!data.brand) issues.push("no --brand CSS variable on root");
    if (data.fakeCandidates > 0 && data.inputCount === 0) issues.push("fake field UI without real inputs");
    if (data.inputCount === 0 && data.formCount === 0 && data.mailtoCount === 0) {
      issues.push("no form inputs and no mailto contact path");
    }
    if (data.inputCount > 0 && typed !== "AuditTest") issues.push("input present but not typeable");

    results.push({
      slug,
      ok: issues.length === 0,
      status,
      brand: data.brand || null,
      inputs: data.inputCount,
      forms: data.formCount,
      mailto: data.mailtoCount,
      typedOk: data.inputCount === 0 ? null : typed === "AuditTest",
      issues,
      sampleCta: data.ctas[0] || null,
    });
    process.stdout.write(issues.length ? "!" : ".");
  } catch (err) {
    results.push({ slug, ok: false, error: err instanceof Error ? err.message : String(err) });
    process.stdout.write("x");
  }
}

await browser.close();
console.log("\n");

const bad = results.filter((r) => !r.ok);
const good = results.filter((r) => r.ok);

console.log(`Checked ${results.length} templates. OK=${good.length} Issues=${bad.length}\n`);

if (bad.length) {
  console.log("=== ISSUES ===");
  for (const r of bad) {
    console.log(`${r.slug}: ${(r.issues || [r.error]).join("; ")}`);
    console.log(
      `  brand=${r.brand} inputs=${r.inputs} forms=${r.forms} mailto=${r.mailto} typedOk=${r.typedOk}`
    );
  }
}

console.log("\n=== FORM SUMMARY ===");
const withForms = results.filter((r) => (r.inputs || 0) > 0);
const mailtoOnly = results.filter((r) => (r.inputs || 0) === 0 && (r.mailto || 0) > 0);
const none = results.filter((r) => (r.inputs || 0) === 0 && (r.mailto || 0) === 0);
console.log(`Real typeable forms/inputs: ${withForms.map((r) => r.slug).join(", ") || "(none)"}`);
console.log(`Mailto-only contact: ${mailtoOnly.length} templates`);
console.log(`No contact path: ${none.map((r) => r.slug).join(", ") || "(none)"}`);

console.log("\n=== BRAND VAR ===");
const noBrand = results.filter((r) => r.ok !== undefined && !r.brand && !r.error);
console.log(noBrand.length ? noBrand.map((r) => r.slug).join(", ") : "All demos expose --brand");

fs.writeFileSync(
  path.join(process.cwd(), "tmp-template-browser-audit.json"),
  JSON.stringify(results, null, 2)
);
console.log("\nWrote tmp-template-browser-audit.json");
