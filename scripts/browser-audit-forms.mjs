/**
 * Confirm every template demo exposes a working contact form
 * (data-template-contact-form, or a form with name/email/message fields).
 */
import puppeteer from "puppeteer";
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

const MULTI = {
  luxeframe: "?page=contact",
  rebo: "?page=contact",
  mainfile: "?page=contact",
  whiter: "?page=contact",
  sarahfolio: "?page=contact",
};

const browser = await puppeteer.launch({
  headless: true,
  executablePath: chromePath,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
page.setDefaultTimeout(45000);

const missing = [];
const ok = [];

for (const slug of slugs) {
  const qs = MULTI[slug] || "";
  const url = `${BASE}/templates/${slug}${qs}`;
  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded" });
    if ((res?.status() ?? 0) >= 400) {
      missing.push({ slug, reason: `HTTP ${res.status()}` });
      continue;
    }
    await page.waitForSelector("body", { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 500));

    const info = await page.evaluate(() => {
      const shared = document.querySelectorAll("[data-template-contact-form='1']");
      const forms = [...document.querySelectorAll("form")];
      const working = forms.filter((f) => {
        const names = [...f.querySelectorAll("input, textarea")].map((el) => el.getAttribute("name") || "");
        return names.some((n) => /^(name|email|message|question)$/i.test(n));
      });
      const typeable = [...document.querySelectorAll("input:not([type=checkbox]):not([type=hidden]), textarea")].filter(
        (el) => {
          const s = getComputedStyle(el);
          return s.display !== "none" && s.visibility !== "hidden" && !el.disabled;
        }
      );
      return {
        shared: shared.length,
        workingForms: working.length,
        typeable: typeable.length,
        mailtoAction: forms.some((f) => (f.getAttribute("action") || "").startsWith("mailto:")),
      };
    });

    if (info.shared > 0 || info.workingForms > 0 || info.mailtoAction) {
      ok.push({ slug, ...info });
    } else {
      missing.push({ slug, reason: JSON.stringify(info) });
    }
  } catch (e) {
    missing.push({ slug, reason: String(e.message || e) });
  }
}

await browser.close();

console.log(`OK: ${ok.length}/${slugs.length}`);
if (missing.length) {
  console.log("MISSING:");
  for (const m of missing) console.log(" -", m.slug, m.reason);
  process.exitCode = 1;
} else {
  console.log("Every template demo has a working contact form.");
}
