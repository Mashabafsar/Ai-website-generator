import puppeteer from "puppeteer";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browser = await puppeteer.launch({
  headless: true,
  executablePath: chromePath,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();

const checks = [
  ["rebo", "contact"],
  ["sports", "contact"],
  ["luxeframe", "contact"],
  ["luxeframe", "home"],
  ["mainfile", "contact"],
  ["whiter", "contact"],
  ["sarahfolio", "contact"],
  ["forgetech", "home"],
  ["forgelime", "home"],
  ["craftedspaces", "home"],
  ["techvantage", "home"],
];

for (const [slug, pg] of checks) {
  const url = `http://localhost:3000/templates/${slug}?page=${pg}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 500));
  const d = await page.evaluate(() => {
    const root = document.querySelector("[style*='--brand']") || document.body;
    const brand = getComputedStyle(root).getPropertyValue("--brand").trim();
    const inputs = [...document.querySelectorAll("input:not([type=checkbox]):not([type=hidden]), textarea")];
    let typed = null;
    if (inputs[0]) {
      inputs[0].focus();
      inputs[0].value = "AuditTest";
      inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      typed = inputs[0].value;
    }
    return {
      brand,
      inputs: inputs.length,
      forms: document.querySelectorAll("form").length,
      mailto: document.querySelectorAll('a[href^="mailto:"]').length,
      typed,
    };
  });
  console.log(JSON.stringify({ slug, page: pg, ...d }));
}

await browser.close();
