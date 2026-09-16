import { LX } from "./tokens";

const A = "/templates/luxeframe";

export const LX_CSS = `
@font-face { font-family: MatterLight; src: url(${A}/Matter-Light.ttf); font-weight: 300; font-display: swap; }
@font-face { font-family: MatterMedium; src: url(${A}/Matter-Medium.ttf); font-weight: 500; font-display: swap; }
@font-face { font-family: MatterSemiBold; src: url(${A}/Matter-SemiBold.ttf); font-weight: 600; font-display: swap; }

.lx-root {
  --lx-green: ${LX.brand};
  --lx-black: ${LX.bg};
  --lx-ink: ${LX.ink};
  --lx-grey: ${LX.body};
  --lx-line: ${LX.line};
  --lx-card: ${LX.card};
  --lx-soft: ${LX.surface};
  color: var(--lx-ink);
  background: var(--lx-black);
  font-family: MatterLight, Inter, ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
.lx-root a { text-decoration: none; color: inherit; }
.lx-root img { width: 100%; height: 100%; object-fit: cover; display: block; }
.lx-main { display: flex; flex-direction: column; gap: 200px; padding-bottom: 200px; overflow-x: hidden; }
.lx-wrap { padding: 0 40px; }
.lx-font90 { font-size: 90px; text-transform: uppercase; font-family: MatterSemiBold, Inter, sans-serif; line-height: 0.95; }
.lx-font36 { font-size: 36px; line-height: 130%; letter-spacing: 0.03em; }
.lx-font24 { font-size: 24px; line-height: 150%; letter-spacing: 0.01em; font-family: MatterMedium, Inter, sans-serif; font-weight: 400; }
.lx-font20 { font-size: 20px; letter-spacing: 0.02em; }
.lx-font16 { font-size: 16px; letter-spacing: 0.05em; }

.lx-bar {
  width: 100%;
  padding: 40px;
  position: fixed;
  top: 0; left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 80;
  mix-blend-mode: difference;
  color: #fff;
}
.lx-logo { font-size: 22px; text-transform: uppercase; font-family: MatterSemiBold, Inter, sans-serif; letter-spacing: 0.1em; }
.lx-ham { cursor: pointer; display: flex; align-items: center; gap: 15px; background: none; border: 0; color: inherit; font: inherit; }
.lx-ham p { font-size: 18px; letter-spacing: 0.1em; text-transform: uppercase; font-family: MatterMedium, Inter, sans-serif; margin: 0; }
.lx-circle {
  background: #fff; width: 50px; height: 50px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 7px; padding: 10px;
}
.lx-line { width: 100%; height: 1px; background: #121212; }
#lx-nav-toggle { position: absolute; opacity: 0; pointer-events: none; }
#lx-nav-toggle:checked ~ .lx-menu { transform: none; visibility: visible; }
#lx-nav-toggle:checked ~ .lx-bar .lx-line:first-child { transform: translateY(4px) rotate(45deg); }
#lx-nav-toggle:checked ~ .lx-bar .lx-line:last-child { transform: translateY(-4px) rotate(-45deg); }
.lx-menu {
  width: 100%; height: 100%; position: fixed; inset: 0;
  z-index: 70;
  background: ${LX.card}; transform: translateY(-100%); visibility: hidden;
  transition: transform 0.8s cubic-bezier(0.19,1,0.22,1), visibility 0.8s;
  overflow: hidden; color: #fff;
}
.lx-menu-img {
  position: absolute; top: 0; left: 0; bottom: 0; right: 30%;
  overflow: hidden; isolation: isolate; contain: paint;
}
.lx-menu-close {
  position: absolute; inset: 0; z-index: 2; cursor: pointer;
  background: none; border: 0;
}
.lx-menu-img img {
  position: absolute !important; inset: 0 !important;
  width: 100% !important; height: 100% !important;
  max-width: none !important; max-height: none !important;
  object-fit: cover !important; object-position: center;
  transform: none !important; opacity: 1 !important; pointer-events: none;
}
.lx-menu-links {
  position: absolute; top: 0; right: 0; bottom: 0; width: 30%;
  padding: 48px 40px 48px 32px;
  z-index: 3;
  background: ${LX.card};
  display: flex; flex-direction: column; justify-content: center;
  box-sizing: border-box;
}
.lx-menu-top a { font-size: 40px; font-family: MatterSemiBold, Inter, sans-serif; display: block; }
.lx-menu-bottom { display: flex; flex-direction: column; gap: 5px; margin-top: 5vw; }
.lx-under { position: relative; width: fit-content; overflow: hidden; text-transform: uppercase; display: block; }
.lx-under::before {
  content: ""; position: absolute; left: 0; bottom: 0; width: 100%; height: 1px; background: #fff;
  transform: scaleX(0); transform-origin: left; transition: transform 0.8s cubic-bezier(0.19,1,0.22,1);
}
.lx-under:hover::before { transform: scaleX(1); }

.lx-hero { height: 100vh; overflow: hidden; position: relative; }
.lx-hero-text {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 60vw; text-align: center; z-index: 4; color: #fff;
}
.lx-hero-text h1 { font-size: 5.2vw; font-family: MatterSemiBold, Inter, sans-serif; text-transform: uppercase; line-height: 1; margin: 0; }
.lx-scroll { position: absolute; left: 50%; transform: translateX(-50%); bottom: 30px; display: flex; flex-direction: column; align-items: center; gap: 5px; text-transform: uppercase; z-index: 4; }
.lx-arrow { height: 22px; width: 22px; animation: lx-bob 1s linear infinite alternate; }
.lx-arrow img { transform: rotate(-90deg); }
.lx-trail { position: absolute; inset: 0; }
.lx-trail-img {
  width: 220px; aspect-ratio: 1.1; border-radius: 7px; position: absolute; top: 12%; left: 8%;
  overflow: hidden; opacity: 0.85; pointer-events: none; will-change: transform, opacity;
}
.lx-trail-img:nth-child(2) { top: 18%; left: 62%; width: 160px; }
.lx-trail-img:nth-child(3) { top: 58%; left: 18%; width: 170px; }
.lx-trail-img:nth-child(4) { top: 52%; left: 72%; width: 150px; }
.lx-trail-img:nth-child(n+5) { opacity: 0; }

.lx-about { padding-right: 100px; }
.lx-about .lx-wrap { display: flex; justify-content: flex-end; }
.lx-about h3 { max-width: 750px; width: 100%; margin: 0; }

.lx-tag { display: flex; align-items: center; gap: 14px; }
.lx-dot { height: 16px; width: 16px; background: ${LX.brand}; border-radius: 50%; flex-shrink: 0; }
.lx-tag h4 { text-transform: uppercase; margin: -2px 0 0; font-weight: 400; }
.lx-rule { width: 100%; height: 1px; background: ${LX.line}; margin-top: 30px; }

.lx-proj-row { display: flex; align-items: flex-start; gap: 20px; margin-top: 70px; }
.lx-proj-row a { display: block; }
.lx-proj-row p { color: ${LX.body}; margin: 8px 0 0; }
.lx-proj-row h5 { margin: 20px 0 0; }
.lx-shot { overflow: hidden; }
.lx-shot img { transition: transform 0.8s cubic-bezier(0.19,1,0.22,1); }
.lx-proj-row a:hover .lx-shot { transform: scale(0.97); transition: transform 0.8s cubic-bezier(0.19,1,0.22,1); }
.lx-proj-row a:hover .lx-shot img { transform: scale(1.03); }
.lx-r1 > a:nth-child(1) { flex: 55%; }
.lx-r1 > a:nth-child(1) .lx-shot { height: 60vh; }
.lx-r1 > a:nth-child(2) { flex: 45%; }
.lx-r1 > a:nth-child(2) .lx-shot { height: 110vh; }
.lx-r2 > a:nth-child(1) { flex: 40%; }
.lx-r2 > a:nth-child(1) .lx-shot { height: 110vh; }
.lx-r2 > a:nth-child(2) { flex: 35%; }
.lx-r2 > a:nth-child(2) .lx-shot { height: 50vh; }
.lx-r3 > a:nth-child(1) { flex: 45%; }
.lx-r3 > a:nth-child(1) .lx-shot { height: 110vh; }
.lx-r3 > a:nth-child(2) { flex: 55%; }
.lx-r3 > a:nth-child(2) .lx-shot { height: 60vh; }
.lx-r4 > a:nth-child(1) { flex: 45%; }
.lx-r4 > a:nth-child(1) .lx-shot { height: 110vh; }
.lx-r4 > a:nth-child(2) { flex: 55%; }
.lx-r4 > a:nth-child(2) .lx-shot { height: 60vh; }
.lx-r5 > a:nth-child(1) { flex: 25%; }
.lx-r5 > a:nth-child(1) .lx-shot { height: 70vh; }
.lx-r5 > a:nth-child(2) { flex: 35%; }
.lx-r5 > a:nth-child(2) .lx-shot { height: 50vh; }
.lx-r5 > a:nth-child(3) { flex: 40%; }
.lx-r5 > a:nth-child(3) .lx-shot { height: 110vh; }
.lx-r2 > a:nth-child(3) { flex: 25%; }
.lx-r2 > a:nth-child(3) .lx-shot { height: 70vh; }

.lx-services { display: flex; flex-direction: column; align-items: center; }
.lx-svc {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid ${LX.line}; padding: 20px 0; position: relative; overflow: hidden;
  transition: padding 0.8s cubic-bezier(0.19,1,0.22,1);
}
.lx-svc > div { display: flex; align-items: center; gap: 50px; }
.lx-svc::before {
  content: ""; position: absolute; inset: 0; background: ${LX.brand}; z-index: -1;
  transform: scaleY(0); transform-origin: bottom; transition: transform 0.8s cubic-bezier(0.19,1,0.22,1);
}
.lx-svc:hover { color: #121212; padding: 20px 50px; }
.lx-svc:hover::before { transform: scaleY(1); }
.lx-svc:hover .lx-svc-arrow { transform: rotate(-45deg); }
.lx-svc-arrow { transition: transform 0.8s cubic-bezier(0.19,1,0.22,1); font-size: 20px; }

.lx-btn {
  display: inline-block; border: 1px solid ${LX.brand}; width: fit-content; padding: 24px 40px;
  border-radius: 50px; position: relative; overflow: hidden; margin-top: 100px;
}
.lx-btn span {
  position: relative; z-index: 1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
  color: ${LX.brand}; line-height: 120%;
}
.lx-btn::before {
  content: ""; position: absolute; inset: 0; border-radius: 100%; background: ${LX.brand}; z-index: 0;
  transform: translateY(100%); transition: transform 0.8s cubic-bezier(0.19,1,0.22,1), border-radius 0.8s cubic-bezier(0.19,1,0.22,1);
}
.lx-btn:hover span { color: #121212; }
.lx-btn:hover::before { border-radius: 0; transform: none; }
.lx-btn:active { transform: scale(0.97); }

.lx-more { height: 120vh; position: relative; overflow: hidden; }
.lx-more-txt {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  display: flex; flex-direction: column; align-items: center; width: 32vw; text-align: center; z-index: 3;
}
.lx-more-txt h2 { font-size: 2.2vw; margin: 0; }
.lx-more-row { display: grid; grid-template-columns: 1fr 1fr; width: 100%; height: 60vh; gap: 20px; pointer-events: none; }

.lx-clients .lx-wrap { display: flex; flex-direction: column; align-items: flex-end; overflow: hidden; }
.lx-logos { max-width: 1100px; width: 100%; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-top: 70px; }
.lx-logo-cell { background: ${LX.surface}; aspect-ratio: 1 / 0.7; display: grid; place-items: center; }
.lx-logo-cell img { object-fit: contain; width: 50%; height: auto; }
.lx-client-copy { width: 100%; padding-left: 100px; margin-top: 150px; }
.lx-client-copy h3 { max-width: 830px; margin: 0; }
.lx-quotes { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 150px; }
.lx-quote { background: ${LX.surface}; padding: 40px 30px; display: flex; flex-direction: column; }
.lx-quote-mark { font-size: 30px; color: ${LX.brand}; line-height: 1; }
.lx-quote p { color: #9d9d9d; }

.lx-pagehead { padding-top: 200px; text-align: center; }
.lx-pagehead h1 { max-width: 1200px; width: 100%; margin: 0 auto; }
.lx-about-lead { padding-left: 100px; margin-top: 70px; }
.lx-about-lead h2 { max-width: 1080px; margin: 0; }
.lx-about-imgs { display: flex; align-items: flex-start; gap: 20px; width: 100%; margin-top: 70px; }
.lx-about-imgs .lx-shot:nth-child(1) { width: 50%; height: 60vh; }
.lx-about-imgs .lx-shot:nth-child(2) { width: 50%; height: 120vh; }
.lx-about-copy { display: flex; flex-direction: column; align-items: center; margin-top: 70px; }
.lx-about-copy p { max-width: 600px; width: 100%; color: ${LX.body}; }
.lx-benefits h3 { max-width: 860px; }
.lx-ben-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; margin-top: 70px; }
.lx-ben { border-top: 1px solid ${LX.line}; padding-top: 40px; }
.lx-ben p { color: ${LX.body}; }
.lx-marquee { position: relative; width: 100%; height: 150px; overflow: hidden; font-size: 150px; text-transform: uppercase; font-family: MatterSemiBold, Inter, sans-serif; letter-spacing: -1px; line-height: 90%; }
.lx-marquee-track { position: absolute; white-space: nowrap; animation: lx-marquee 80s linear infinite; }
.lx-team { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; row-gap: 50px; margin-top: 70px; }
.lx-team img { height: 50vh; }
.lx-team p { color: ${LX.body}; margin: 4px 0 0; }

.lx-contact { display: flex; align-items: center; gap: 40px; }
.lx-contact-visual { position: relative; width: 60%; height: 110vh; }
.lx-contact-visual img { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 70%; height: auto; }
.lx-contact-visual img:nth-child(1) { opacity: 0.9; z-index: 1; }
.lx-contact-visual img:nth-child(2) { opacity: 0.7; z-index: 2; }
.lx-contact-visual img:nth-child(3) { opacity: 0.5; z-index: 3; }
.lx-contact-visual img:nth-child(4) { opacity: 0.3; z-index: 4; }
.lx-contact-details { width: 40%; display: flex; flex-direction: column; gap: 10px; }
.lx-contact-details h2 { margin: 0; }

.lx-foot { background: ${LX.card}; width: 100%; padding: 100px 0 0; overflow: hidden; }
.lx-foot-inner { display: flex; width: 100%; }
.lx-foot-col { width: 100%; display: flex; }
.lx-foot-col:first-child { flex-direction: column; gap: 8px; }
.lx-foot-links { width: 100%; display: flex; flex-direction: column; gap: 10px; }
.lx-giant { font-size: 21.4vw; letter-spacing: -0.8vw; line-height: 85%; color: #323232; margin: 100px 0 0; font-family: MatterSemiBold, Inter, sans-serif; text-transform: uppercase; }

@keyframes lx-bob { from { transform: translateY(0); } to { transform: translateY(12px); } }
@keyframes lx-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

@media (hover: hover) and (pointer: fine) {
  .lx-ham:active .lx-circle { transform: scale(0.94); }
}
@media (prefers-reduced-motion: reduce) {
  .lx-arrow, .lx-marquee-track { animation: none; }
  .lx-svc::before, .lx-btn::before, .lx-menu { transition: none; }
}

@media (max-width: 1460px) {
  .lx-font90 { font-size: 72px; }
  .lx-font36 { font-size: 30px; }
  .lx-font24 { font-size: 22px; }
  .lx-font20 { font-size: 18px; }
  .lx-font16 { font-size: 14px; }
  .lx-main { gap: 140px; padding-bottom: 140px; }
  .lx-bar { padding: 20px 40px; }
  .lx-logo { font-size: 20px; }
  .lx-about { padding-right: 0; }
  .lx-about h3 { max-width: 630px; }
  .lx-client-copy { padding-left: 0; }
  .lx-menu-top a { font-size: 30px; }
  .lx-pagehead { padding-top: 140px; }
}
@media (max-width: 1040px) {
  .lx-font90 { font-size: 56px; }
  .lx-r1 > a:nth-child(1) .lx-shot, .lx-r3 > a:nth-child(2) .lx-shot, .lx-r4 > a:nth-child(2) .lx-shot { max-height: 400px; }
  .lx-r1 > a:nth-child(2) .lx-shot, .lx-r2 > a:nth-child(1) .lx-shot, .lx-r3 > a:nth-child(1) .lx-shot, .lx-r4 > a:nth-child(1) .lx-shot, .lx-r5 > a:nth-child(3) .lx-shot { max-height: 700px; }
  .lx-more { height: 800px; }
  .lx-more-row { max-height: 400px; }
  .lx-about-lead { padding-left: 0; }
  .lx-menu-img { right: 36%; }
  .lx-menu-links { width: 36%; padding: 24px; }
  .lx-contact-visual { max-height: 800px; }
  .lx-team { grid-template-columns: 1fr 1fr 1fr; }
  .lx-quotes { grid-template-columns: 1fr; }
}
@media (max-width: 780px) {
  .lx-font90 { font-size: 48px; }
  .lx-font36 { font-size: 28px; }
  .lx-main { gap: 100px; padding-bottom: 100px; }
  .lx-wrap { padding: 0 20px; }
  .lx-bar { padding: 20px; }
  .lx-hero-text { width: 80vw; }
  .lx-hero-text h1 { font-size: 7vw; }
  .lx-proj-row { flex-direction: column; gap: 50px; }
  .lx-proj-row > a, .lx-r1 > a, .lx-r2 > a, .lx-r3 > a, .lx-r4 > a, .lx-r5 > a { width: 100%; flex: none !important; }
  .lx-shot, .lx-r1 > a .lx-shot, .lx-r2 > a .lx-shot, .lx-r3 > a .lx-shot, .lx-r4 > a .lx-shot, .lx-r5 > a .lx-shot { height: auto !important; max-height: none !important; }
  .lx-svc > div { gap: 20px; }
  .lx-svc:hover { padding: 20px; }
  .lx-more { height: 560px; }
  .lx-more-txt { width: 70vw; }
  .lx-more-txt h2 { font-size: 5vw; }
  .lx-contact { flex-direction: column; }
  .lx-contact-details, .lx-contact-visual { width: 100%; }
  .lx-about-imgs { flex-direction: column; }
  .lx-about-imgs .lx-shot { width: 100% !important; height: auto !important; }
  .lx-ben-grid { grid-template-columns: 1fr; }
  .lx-foot-inner { flex-direction: column; gap: 50px; }
  .lx-pagehead { padding-top: 100px; }
}
@media (max-width: 600px) {
  .lx-font90 { font-size: 36px; }
  .lx-font36 { font-size: 24px; }
  .lx-hero-text { width: 94vw; }
  .lx-hero-text h1 { font-size: 9vw; }
  .lx-logos { grid-template-columns: 1fr 1fr; }
  .lx-team { grid-template-columns: 1fr 1fr; }
  .lx-menu-img { display: none; }
  .lx-menu-links { width: 100%; left: 0; right: 0; padding: 20px; }
  .lx-menu-top a { font-size: 11vw; }
  .lx-marquee { height: 15vw; font-size: 15vw; }
}
`;
