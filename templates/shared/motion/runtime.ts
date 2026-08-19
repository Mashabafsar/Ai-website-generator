// The single source of template motion. The SAME code powers the React editor
// preview and the exported/deployed static HTML, so the two can never drift:
//   - React preview calls `initTemplateMotion` from a client effect.
//   - Static export inlines `motionStyleTag()` + `motionScriptTag()`, where the
//     script is literally `initTemplateMotion.toString()` executed in the page.
//
// Behavior is opt-out and automatic. Given a root marked `[data-template-motion]`
// it reveals headings/cards on scroll, staggers grid children, counts up stat
// numbers, applies gentle parallax to `[data-parallax]`, animates open FAQs, and
// adds hover/press feedback — all disabled under `prefers-reduced-motion`.

/**
 * IMPORTANT: keep this function fully self-contained (no imports, no closure or
 * module-scope references). It is serialized with `.toString()` for the static
 * export, so anything it needs must be declared inside it.
 */
export function initTemplateMotion(scope?: Document | Element | null): () => void {
  const doc: Document =
    (scope && (scope as Document).querySelectorAll
      ? (scope as Document).ownerDocument || (scope as Document)
      : document) || document;

  const host: Element | Document =
    scope && (scope as Element).querySelectorAll ? (scope as Element) : doc;

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cleanups: Array<() => void> = [];
  const q = (sel: string): Element[] =>
    Array.prototype.slice.call((host as Element).querySelectorAll(sel));

  const inChrome = (el: Element): boolean => !!el.closest("nav") || !!el.closest("[data-motion-skip]");

  // The motion root carries `data-motion-arm`, which hides reveal content from
  // the very first paint (no flash). Releasing it once we've taken per-element
  // control — or immediately under reduced motion — makes the page visible.
  const rootEl: Element | null =
    host && (host as Element).matches && (host as Element).matches("[data-template-motion]")
      ? (host as Element)
      : (host as Element).querySelector
        ? (host as Element).querySelector("[data-template-motion]")
        : doc.body;
  const disarm = () => {
    if (rootEl && rootEl.removeAttribute) rootEl.removeAttribute("data-motion-arm");
  };

  // ---- Reveal + stagger --------------------------------------------------
  const REVEAL_SELECTOR = "h1,h2,h3,p,blockquote,article,figure,img,ul,ol,[data-reveal]";
  const candidates = q(REVEAL_SELECTOR);
  const candidateSet = new Set(candidates);

  const units: Element[] = [];
  candidates.forEach((el) => {
    if (inChrome(el)) return;
    // Parallax elements control their own transform; don't also reveal them.
    if (el.hasAttribute("data-parallax")) return;
    // Only reveal the OUTERMOST candidate so cards animate as one unit.
    let p: Element | null = el.parentElement;
    let nested = false;
    while (p && p !== host) {
      if (candidateSet.has(p)) {
        nested = true;
        break;
      }
      p = p.parentElement;
    }
    if (nested && !el.hasAttribute("data-reveal")) return;
    units.push(el);
  });

  // Stagger index among siblings sharing a parent.
  const seen = new Map<Element, number>();
  units.forEach((el) => {
    const parent = el.parentElement || (host as Element);
    const idx = seen.get(parent) || 0;
    seen.set(parent, idx + 1);
    if (!el.getAttribute("data-reveal")) el.setAttribute("data-reveal", "up");
    (el as HTMLElement).style.setProperty("--motion-index", String(idx));
  });

  // Every unit starts hidden and reveals via IntersectionObserver: elements in
  // the initial viewport animate in on load (staggered), the rest as they scroll
  // into view. The pre-paint `data-motion-arm` guard means no flash. Under
  // reduced motion (or without IO) we simply disarm and leave everything visible.
  if (reduce || typeof IntersectionObserver === "undefined") {
    disarm();
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-motion-ready", "in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    units.forEach((el) => {
      el.setAttribute("data-motion-ready", "out");
      io.observe(el);
    });
    // Now that units own their visibility, release the broad pre-paint guard.
    disarm();

    // Safety net: reveal anything still hidden once the page is scrolled near the
    // bottom, so elements in the final viewport can never stay stuck hidden.
    const revealTail = () => {
      const scrolled = window.innerHeight + window.scrollY;
      const full = doc.documentElement.scrollHeight;
      if (scrolled < full - 4) return;
      units.forEach((el) => {
        if (el.getAttribute("data-motion-ready") !== "in") {
          el.setAttribute("data-motion-ready", "in");
          io.unobserve(el);
        }
      });
    };
    window.addEventListener("scroll", revealTail, { passive: true });
    cleanups.push(() => {
      io.disconnect();
      window.removeEventListener("scroll", revealTail);
    });
  }

  // ---- Counters ----------------------------------------------------------
  // Auto-detects short numeric stat values like "25+", "100K+", "98%", "500+".
  const NUMERIC = /^[+]?\$?\d[\d.,]*\s*[kKmM]?[%+]?$/;
  const counters: Element[] = [];
  q("h1,h2,h3,div,span,p").forEach((el) => {
    if (el.children.length !== 0) return;
    if (el.closest("nav") || el.closest("footer") || el.closest("header")) return;
    const raw = (el.textContent || "").trim();
    if (!raw || raw.length > 7 || !NUMERIC.test(raw)) return;
    if (el.hasAttribute("data-counter-done")) return;
    counters.push(el);
  });

  const runCounter = (el: Element) => {
    const raw = (el.textContent || "").trim();
    const match = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!match) return;
    const prefix = match[1] || "";
    const digits = match[2];
    const suffix = match[3] || "";
    const target = parseFloat(digits.replace(/,/g, ""));
    if (!isFinite(target)) return;
    const decimals = digits.includes(".") ? (digits.split(".")[1] || "").length : 0;
    el.setAttribute("data-counter-done", "1");
    if (reduce) return;
    const durationMs = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = (target * eased).toFixed(decimals);
      el.textContent = prefix + value + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = raw;
    };
    requestAnimationFrame(tick);
  };

  if (counters.length && typeof IntersectionObserver !== "undefined" && !reduce) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
    cleanups.push(() => cio.disconnect());
  }

  // ---- Parallax ----------------------------------------------------------
  const parallaxOn = (host as Element).getAttribute
    ? (host as Element).getAttribute("data-motion-parallax") !== "off"
    : true;
  const parallaxEls = parallaxOn && !reduce ? q("[data-parallax]") : [];
  if (parallaxEls.length) {
    let ticking = false;
    const apply = () => {
      const vh = window.innerHeight || doc.documentElement.clientHeight;
      parallaxEls.forEach((el) => {
        const factorAttr = parseFloat(el.getAttribute("data-parallax") || "");
        const factor = isFinite(factorAttr) && factorAttr ? factorAttr : 0.08;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) * factor * -1;
        // A gentle base scale hides the edges the translate would otherwise expose.
        const clamped = Math.max(-20, Math.min(20, offset));
        (el as HTMLElement).style.transform =
          "translate3d(0," + clamped.toFixed(1) + "px,0) scale(1.08)";
      });
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    });
  }

  return () => cleanups.forEach((fn) => fn());
}

// ---- CSS ----------------------------------------------------------------
// Injected once per document. Scoped to `[data-template-motion]` so it can never
// leak into the app shell around a preview.
export const MOTION_CSS = `
[data-template-motion]{
  --motion-fast:140ms;
  --motion-base:220ms;
  --motion-reveal:600ms;
  --motion-slow:900ms;
  --motion-ease:cubic-bezier(0.22,1,0.36,1);
}
/* Pre-paint guard: hide reveal content before the runtime tags it, so there is
   no shown -> hidden flash. The runtime removes [data-motion-arm] once it takes
   per-element control (and immediately under reduced motion). */
[data-template-motion][data-motion-arm] :is(h1,h2,h3,p,blockquote,article,figure,img,ul,ol):not(nav *):not([data-parallax]){
  opacity:0;
}
[data-template-motion][data-motion-active] [data-reveal][data-motion-ready="out"]{
  opacity:0;
  will-change:transform,opacity;
}
[data-template-motion] [data-reveal="up"][data-motion-ready="out"]{transform:translate3d(0,26px,0);}
[data-template-motion] [data-reveal="left"][data-motion-ready="out"]{transform:translate3d(28px,0,0);}
[data-template-motion] [data-reveal="right"][data-motion-ready="out"]{transform:translate3d(-28px,0,0);}
[data-template-motion] [data-reveal="scale"][data-motion-ready="out"]{transform:scale(0.94);}
[data-template-motion] [data-reveal][data-motion-ready="in"]{
  opacity:1;
  transform:none;
  transition:opacity var(--motion-reveal) var(--motion-ease),
             transform var(--motion-reveal) var(--motion-ease);
  transition-delay:calc(var(--motion-index,0) * var(--motion-step,80ms));
}
[data-template-motion][data-motion-intensity="expressive"]{--motion-step:90ms;}
[data-template-motion][data-motion-intensity="restrained"]{--motion-step:60ms;}
[data-template-motion] [data-parallax]{will-change:transform;}
[data-template-motion] details[open] > :not(summary){
  animation:motion-faq var(--motion-base) var(--motion-ease);
}
@keyframes motion-faq{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;}}
@media (hover:hover) and (pointer:fine){
  [data-template-motion] a[href],[data-template-motion] button{
    transition:transform var(--motion-fast) var(--motion-ease),
               opacity var(--motion-fast) var(--motion-ease),
               box-shadow var(--motion-fast) var(--motion-ease),
               background-color var(--motion-fast) var(--motion-ease),
               color var(--motion-fast) var(--motion-ease),
               border-color var(--motion-fast) var(--motion-ease);
  }
}
[data-template-motion] a[href]:not(nav a):active,
[data-template-motion] button:active{transform:scale(0.97);}
@media (prefers-reduced-motion: reduce){
  [data-template-motion][data-motion-arm] :is(h1,h2,h3,p,blockquote,article,figure,img,ul,ol){opacity:1 !important;}
  [data-template-motion] [data-reveal]{opacity:1 !important;transform:none !important;transition:none !important;}
  [data-template-motion] [data-parallax]{transform:none !important;}
  [data-template-motion] details[open] > :not(summary){animation:none !important;}
  [data-template-motion] a[href]:active,[data-template-motion] button:active{transform:none !important;}
}`.trim();

/** If JavaScript never runs, the pre-paint guard must not hide content forever. */
export const MOTION_NOSCRIPT_CSS =
  `[data-template-motion][data-motion-arm] :is(h1,h2,h3,p,blockquote,article,figure,img,ul,ol){opacity:1 !important;}`;

/** `<style>` block for the static export document head. */
export function motionStyleTag(): string {
  return `<style data-template-motion-css>\n${MOTION_CSS}\n</style>`;
}

/**
 * `<script>` block for the static export. Ships the exact same runtime the React
 * preview uses, so exported sites animate identically to the editor preview.
 */
export function motionScriptTag(): string {
  return [
    `<script>`,
    `(function(){var run=${initTemplateMotion.toString()};`,
    `function boot(){try{run(document);}catch(e){}}`,
    `if(document.readyState!=="loading"){boot();}`,
    `else{document.addEventListener("DOMContentLoaded",boot);}`,
    `})();`,
    `</script>`,
  ].join("");
}

/**
 * Injects the motion CSS + runtime into a complete static HTML document and
 * marks the body as a motion root. Applied centrally to every bespoke export so
 * individual templates never wire motion by hand.
 */
export function withMotion(html: string): string {
  let out = html;

  const head = `${motionStyleTag()}\n<noscript><style>${MOTION_NOSCRIPT_CSS}</style></noscript>`;
  if (out.includes("</head>")) {
    out = out.replace("</head>", `${head}\n</head>`);
  } else {
    out = `${head}\n${out}`;
  }

  // Mark the first <body ...> as the motion root (idempotent). `data-motion-arm`
  // hides reveal content from first paint; the runtime releases it on boot.
  out = out.replace(/<body\b([^>]*)>/i, (full, attrs: string) => {
    if (/data-template-motion/.test(attrs)) return full;
    return `<body${attrs} data-template-motion data-motion-active data-motion-arm data-motion-intensity="expressive" data-motion-parallax="on">`;
  });

  if (out.includes("</body>")) {
    out = out.replace("</body>", `${motionScriptTag()}\n</body>`);
  } else {
    out = `${out}\n${motionScriptTag()}`;
  }

  return out;
}
