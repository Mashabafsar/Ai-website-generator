/**
 * Inject TemplateContactForm into every bespoke template that lacks a real form.
 * Idempotent — safe to re-run.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = "templates";
const SKIP = new Set(["shared", "forgelime", "rebo", "mainfile", "whiter", "sarahfolio"]);

const SITE_IMPORT = `import { TemplateContactForm } from "../shared/contact-form";`;
const EXPORT_IMPORT = `import { contactFormHtml, contactFormScript } from "../shared/contact-form-html";`;

function ensureImport(src, importLine) {
  if (src.includes(importLine)) return src;
  const lines = src.split("\n");
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) lastImport = i;
    else if (lastImport >= 0 && lines[i].trim() === "" && i > lastImport) break;
  }
  if (lastImport < 0) return `${importLine}\n${src}`;
  lines.splice(lastImport + 1, 0, importLine);
  return lines.join("\n");
}

function hasSiteFormUsage(src, slug) {
  if (fs.existsSync(path.join(ROOT, slug, "contact-form.tsx"))) return true;
  if (src.includes("<TemplateContactForm")) return true;
  if (src.includes("<form") && /name=["'](name|email|message|question)["']/.test(src)) return true;
  return false;
}

function injectSite(slug, src) {
  if (hasSiteFormUsage(src, slug)) {
    return { src, changed: false, how: "has-form" };
  }

  let next = ensureImport(src, SITE_IMPORT);
  let how = "";

  const emailLink =
    /(\{contactEmail \? <a className="mt-4 inline-block(?: underline)?" href=\{`mailto:\$\{contactEmail\}`\}>\{contactEmail\}<\/a> : null\})/;
  if (emailLink.test(next) && !next.includes("<TemplateContactForm")) {
    next = next.replace(emailLink, `$1\n          <TemplateContactForm contactEmail={contactEmail} />`);
    how = "email-link";
  }

  if (slug === "luxeframe" && !next.includes("<TemplateContactForm")) {
    const marker = `            <div style={{ marginTop: 100 }}>
              <Heading label="Socials" />`;
    if (next.includes(marker)) {
      next = next.replace(
        marker,
        `            <TemplateContactForm
              contactEmail={mail}
              className="mt-10 max-w-xl space-y-4 text-left"
              buttonStyle={{ backgroundColor: "var(--brand, #C8FF3D)", color: "#111" }}
            />
${marker}`
      );
      how = "luxeframe";
    }
  }

  if (slug === "sports" && !next.includes("<TemplateContactForm")) {
    const marker = `      {/* Footer */}
      <footer id="sp-contact"`;
    if (next.includes(marker)) {
      next = next.replace(
        marker,
        `      <section className="px-4 py-16 lg:px-[3.75rem]" data-template-contact-section="1">
        <div className="mx-auto max-w-[82.5rem]">
          <h2 className="text-3xl font-semibold uppercase tracking-tight" style={{ fontFamily: "var(--sp-display)" }}>Contact</h2>
          <TemplateContactForm
            contactEmail={contactEmail}
            buttonStyle={{ backgroundColor: "var(--brand)", color: "#111" }}
          />
        </div>
      </section>

${marker}`
      );
      how = "sports";
    }
  }

  if (!next.includes("<TemplateContactForm")) {
    // Match the last footer that has an id= (skip blockquote footers)
    const re = /\n(\s*)<footer\b([^>]*\bid=["'][^"']+["'][^>]*)>/g;
    let match;
    let last = null;
    while ((match = re.exec(next)) !== null) last = match;
    if (last) {
      const indent = last[1];
      const block = `${indent}<section className="px-6 py-16" data-template-contact-section="1">
${indent}  <div className="mx-auto max-w-6xl">
${indent}    <h2 className="text-2xl font-semibold">Contact</h2>
${indent}    <TemplateContactForm contactEmail={contactEmail} />
${indent}  </div>
${indent}</section>
`;
      next = next.slice(0, last.index) + "\n" + block + indent + "<footer" + last[2] + ">" + next.slice(last.index + last[0].length);
      how = "before-footer";
    }
  }

  if (!next.includes("<TemplateContactForm")) {
    // Last resort: last <footer in file
    const re = /\n(\s*)<footer\b([^>]*)>/g;
    let match;
    let last = null;
    while ((match = re.exec(next)) !== null) last = match;
    if (last) {
      const indent = last[1];
      const block = `${indent}<section className="px-6 py-16" data-template-contact-section="1">
${indent}  <div className="mx-auto max-w-6xl">
${indent}    <h2 className="text-2xl font-semibold">Contact</h2>
${indent}    <TemplateContactForm contactEmail={contactEmail} />
${indent}  </div>
${indent}</section>
`;
      next = next.slice(0, last.index) + "\n" + block + indent + "<footer" + last[2] + ">" + next.slice(last.index + last[0].length);
      how = "before-any-footer";
    }
  }

  return { src: next, changed: next !== src, how: how || "noop" };
}

function injectExport(slug, src) {
  if (src.includes("contactFormHtml({")) return { src, changed: false, how: "already" };
  if (src.includes("<form") && /name=["'](name|email|message|question)["']/.test(src)) {
    return { src, changed: false, how: "has-form" };
  }

  let next = ensureImport(src, EXPORT_IMPORT);
  let how = "";

  // Compact contact section (real newlines inside template literal)
  if (!next.includes("contactFormHtml({")) {
    const replaced = next.replace(
      /(<p class="mt-3"[^>]*>\$\{esc\(text\(contact\.content, "subheading", ""\)\)\}<\/p>)\r?\n(  <\/div>\r?\n<\/section>)/,
      `$1\n    \${contactFormHtml({ contactEmail })}\n$2`
    );
    if (replaced !== next) {
      next = replaced;
      how = "contact-section";
    }
  }

  // Body templates that join sections with literal \n escapes: </section>\n<footer
  if (!next.includes("contactFormHtml({")) {
    const escapedFooter = /<\/section>\\n<footer\b([^>]*)>/;
    if (escapedFooter.test(next)) {
      next = next.replace(
        escapedFooter,
        `</section>\\n<section class="px-6 py-16" data-template-contact-section="1">
  <div class="mx-auto max-w-6xl">
    <h2 class="text-2xl font-semibold">Contact</h2>
    \${contactFormHtml({ contactEmail })}
  </div>
</section>\\n<footer$1>`
      );
      how = "escaped-footer";
    }
  }

  // Real-newline footer in export template
  if (!next.includes("contactFormHtml({")) {
    const re = /\n(<footer\b[^>]*\bid=["'][^"']+["'][^>]*>)/g;
    let match;
    let last = null;
    while ((match = re.exec(next)) !== null) last = match;
    if (last) {
      const block = `<section class="px-6 py-16" data-template-contact-section="1">
  <div class="mx-auto max-w-6xl">
    <h2 class="text-2xl font-semibold">Contact</h2>
    \${contactFormHtml({ contactEmail })}
  </div>
</section>
`;
      next = next.slice(0, last.index) + "\n" + block + last[1] + next.slice(last.index + last[0].length);
      how = "before-footer";
    }
  }

  if (next.includes("contactFormHtml({") && !next.includes("contactFormScript()")) {
    if (next.includes("</body>")) {
      next = next.replace("</body>", "${contactFormScript()}\n</body>");
    } else {
      next = next.replace(/(<\/html>`)/, "${contactFormScript()}\n$1");
    }
  }

  // Drop unused import if we somehow still have no form
  if (!next.includes("contactFormHtml({") && next.includes(EXPORT_IMPORT)) {
    next = next.replace(EXPORT_IMPORT + "\n", "").replace(EXPORT_IMPORT, "");
  }

  return { src: next, changed: next !== src, how: how || "noop" };
}

const results = [];

for (const ent of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!ent.isDirectory() || SKIP.has(ent.name)) continue;
  const slug = ent.name;
  const sitePath = path.join(ROOT, slug, "site.tsx");
  const exportPath = path.join(ROOT, slug, "export.ts");
  if (!fs.existsSync(sitePath)) continue;

  const siteSrc = fs.readFileSync(sitePath, "utf8");
  const siteResult = injectSite(slug, siteSrc);
  if (siteResult.changed) fs.writeFileSync(sitePath, siteResult.src);

  let exportResult = { changed: false, how: "no-export" };
  if (fs.existsSync(exportPath)) {
    const exportSrc = fs.readFileSync(exportPath, "utf8");
    exportResult = injectExport(slug, exportSrc);
    if (exportResult.changed) fs.writeFileSync(exportPath, exportResult.src);
  }

  results.push({
    slug,
    site: siteResult.how + (siteResult.changed ? "*" : ""),
    exp: exportResult.how + (exportResult.changed ? "*" : ""),
  });
}

for (const r of results) {
  console.log(`${r.slug.padEnd(16)} site=${r.site.padEnd(20)} export=${r.exp}`);
}

const siteOk = results.filter((r) => !r.site.startsWith("noop")).length;
const expOk = results.filter((r) => !r.exp.startsWith("noop") && r.exp !== "no-export").length;
console.log(`Sites with form path: ${siteOk}/${results.length}; exports: ${expOk}`);
console.log(
  "Still noop sites:",
  results.filter((r) => r.site.startsWith("noop")).map((r) => r.slug).join(", ") || "none"
);
console.log(
  "Still noop exports:",
  results.filter((r) => r.exp.startsWith("noop")).map((r) => r.slug).join(", ") || "none"
);
