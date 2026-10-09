import fs from "node:fs";
import path from "node:path";

const root = "templates";
const skip = new Set(["shared"]);
const bad = [];

for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
  if (!ent.isDirectory() || skip.has(ent.name)) continue;
  const slug = ent.name;
  const sitePath = path.join(root, slug, "site.tsx");
  const exportPath = path.join(root, slug, "export.ts");
  if (!fs.existsSync(sitePath)) continue;

  const site = fs.readFileSync(sitePath, "utf8");
  const own = fs.existsSync(path.join(root, slug, "contact-form.tsx"));
  const siteOk =
    own ||
    site.includes("<TemplateContactForm") ||
    (site.includes("<form") &&
      (/name=["'](name|email|message|question)["']/.test(site) ||
        /action=\{`mailto:|action={`mailto:|onSubmit=/.test(site)));

  let exportOk = !fs.existsSync(exportPath);
  if (fs.existsSync(exportPath)) {
    const exp = fs.readFileSync(exportPath, "utf8");
    exportOk =
      exp.includes("contactFormHtml({") ||
      (exp.includes("<form") &&
        (/name=["'](name|email|message|question)["']/.test(exp) ||
          /action="mailto:|onsubmit=/.test(exp)));
    if (exp.includes("contactFormScript()") && !exp.includes("contactFormHtml({") && !exportOk) {
      bad.push(`${slug}: export has script but no form html`);
    }
  }

  if (!siteOk) bad.push(`${slug}: site missing form`);
  if (!exportOk) bad.push(`${slug}: export missing form`);

  // Multi-root return smell: section then footer as siblings without fragment
  if (/<\/section>\s*\n\s*<footer/.test(site) && /data-template-contact-section/.test(site)) {
    // Check if they're inside a parent - hard; flag SiteFooter-style adjacent returns
  }
  if (
    /return \(\s*\n\s*<section className="px-6 py-16" data-template-contact-section[\s\S]{0,400}<footer/.test(
      site
    )
  ) {
    bad.push(`${slug}: possible invalid multi-root return`);
  }
}

if (bad.length === 0) {
  console.log("All templates have a working form in site + export.");
} else {
  console.log("ISSUES:");
  for (const b of bad) console.log(" -", b);
  process.exitCode = 1;
}
