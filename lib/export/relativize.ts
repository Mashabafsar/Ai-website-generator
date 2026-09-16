/**
 * Static exports are opened as a folder, a ZIP, a GitHub Pages subpath, or
 * `clients/<slug>/` in the sites repo — never as the website-builder origin.
 * Root-absolute URLs (`/templates/...`, `/about/`) 404 in all of those places.
 * Rewrite them to paths relative to the HTML file that references them.
 */

const LOCAL_DIR = /^(?:templates|uploads)\//;
const PAGE_PATH = /^[a-z0-9-]+\/?$/i;

function depthOf(filePath: string): number {
  const parts = filePath.replaceAll("\\", "/").split("/").filter(Boolean);
  return Math.max(0, parts.length - 1);
}

function prefixFor(depth: number): string {
  return depth > 0 ? "../".repeat(depth) : "";
}

/** Turn a same-origin `/...` URL into a path relative to an exported HTML file. */
export function relativizeRootUrl(url: string, filePath: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return url;

  const hashIndex = trimmed.indexOf("#");
  const hash = hashIndex >= 0 ? trimmed.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
  const qIndex = withoutHash.indexOf("?");
  const query = qIndex >= 0 ? withoutHash.slice(qIndex) : "";
  let pathname = (qIndex >= 0 ? withoutHash.slice(0, qIndex) : withoutHash).replace(/^\//, "");

  const prefix = prefixFor(depthOf(filePath));

  if (!pathname) {
    return `${prefix}index.html${query}${hash}`;
  }

  if (!LOCAL_DIR.test(pathname) && !/\.[a-z0-9]+$/i.test(pathname.replace(/\/$/, "")) && PAGE_PATH.test(pathname)) {
    pathname = `${pathname.replace(/\/$/, "")}/index.html`;
  }

  return `${prefix}${pathname}${query}${hash}`;
}

/**
 * Rewrite `src`/`href`/`url()` root-absolute local paths in one exported document.
 */
export function relativizeHtml(html: string, filePath: string): string {
  let out = html.replace(/\b(src|href)=(["'])(\/[^"']*)\2/gi, (full, attr: string, quote: string, url: string) => {
    if (url.startsWith("//")) return full;
    return `${attr}=${quote}${relativizeRootUrl(url, filePath)}${quote}`;
  });

  out = out.replace(/url\(\s*(['"]?)(\/[^'")]+)\1\s*\)/gi, (full, quote: string, url: string) => {
    if (url.startsWith("//")) return full;
    return `url(${quote}${relativizeRootUrl(url, filePath)}${quote})`;
  });

  return out;
}

/** Public-folder asset paths (`templates/...`, `uploads/...`) referenced in HTML or JSON. */
export function collectBundledAssetPaths(text: string): string[] {
  const found = new Set<string>();
  const re = /(?:\.\.\/)*((?:templates|uploads)\/[^\s"'\\?)]+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    const rel = match[1].replace(/[?#].*$/, "").replace(/\\/g, "/");
    if (rel.includes("..")) continue;
    found.add(rel);
  }
  return [...found];
}
