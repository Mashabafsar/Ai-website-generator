// The template module contract. A bespoke design is described by three
// boundary-safe pieces so client and server never import each other's code:
//
//   - metadata (this file's `TemplateModuleMeta`): slug, renderer, motion,
//     slot map, demo content, and asset manifest. Safe to import anywhere.
//   - preview (templates/preview-registry.tsx): the React renderer + motion,
//     client-safe.
//   - export (templates/export-registry.ts): the static-HTML renderer,
//     server-only.
//
// Adding a template means adding one folder + one metadata entry; the registries
// pick it up from there.

import type { ComponentType } from "react";
import type {
  AssembledSite,
  SiteContact,
  WebsiteBlueprint,
} from "@/lib/blueprint/types";
import type { MotionProfile } from "./shared/motion/profile";

/** Props every bespoke React renderer accepts. */
export type TemplatePreviewProps = {
  /** Live editor content (before anything is persisted). */
  blueprint?: WebsiteBlueprint | null;
  /** Persisted, assembled content (preview + public demo). */
  site?: AssembledSite | null;
  /** Overrides contact details while editing. */
  contact?: SiteContact | null;
};

export type TemplatePreview = ComponentType<TemplatePreviewProps>;

/** Renders a persisted site to a single static HTML document. */
export type TemplateHtmlRenderer = (site: AssembledSite) => string;

/** Sample content shown on the public `/templates/[slug]` live demo. */
export type TemplateDemoData = {
  buildBlueprint: () => WebsiteBlueprint;
  contact: SiteContact;
};

/**
 * Documents which locked section slot feeds each visual region of a design.
 * `type` is the blueprint section type; `occurrence` disambiguates designs that
 * reuse a type (e.g. several `features` bands).
 */
export type TemplateSlotRegion = {
  region: string;
  type: string;
  occurrence: number;
};

/**
 * Boundary-safe template metadata. Holds no React components and no Node-only
 * export code, so it is importable from client, server, and scripts alike.
 */
export type TemplateModuleMeta = {
  slug: string;
  renderer: string;
  motion: MotionProfile;
  slots: TemplateSlotRegion[];
  demo: TemplateDemoData;
  /** Public-relative asset paths the design ships with (bundled into exports). */
  assets: string[];
};
