import { A, ABOUT_IMGS, ARROW, CLIENT_LOGOS, CONTACT_IMG, MORE_IMGS, NAV_IMG, PROJECTS, SERVICE_IMGS, TEAM, TRAIL } from "./defaults";

export const luxeframeAssets: string[] = [
  "templates/luxeframe/preview.png",
  "templates/luxeframe/Matter-Light.ttf",
  "templates/luxeframe/Matter-Medium.ttf",
  "templates/luxeframe/Matter-SemiBold.ttf",
  ARROW.replace(/^\//, ""),
  NAV_IMG.replace(/^\//, ""),
  CONTACT_IMG.replace(/^\//, ""),
  ...TRAIL.map((p) => p.replace(/^\//, "")),
  ...PROJECTS.map((p) => p.img.replace(/^\//, "")),
  ...SERVICE_IMGS.map((p) => p.replace(/^\//, "")),
  ...TEAM.map((p) => p.img.replace(/^\//, "")),
  ...CLIENT_LOGOS.map((p) => p.replace(/^\//, "")),
  ...MORE_IMGS.map((p) => p.replace(/^\//, "")),
  ...ABOUT_IMGS.map((p) => p.replace(/^\//, "")),
  A.replace(/^\//, "") + "/favicon.svg",
];
