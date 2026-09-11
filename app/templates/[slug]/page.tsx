import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTemplateBySlug } from "@/lib/templates/store";
import { buildDemoSite, getTemplateDemo } from "@/lib/templates/demos";
import { SitePreview } from "@/components/editor/site-preview";

type Params = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

// Rendered on demand: this page reads template metadata from the database, so it
// must not be prerendered at build time (DATABASE_URL isn't available then).
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template) return { title: "Template demo" };
  return {
    title: `${template.name} — template demo`,
    description: `Live demo of the ${template.name} website design. ${template.tagline}`,
  };
}

/**
 * Public, unauthenticated demo of a complete design, used by the library's
 * preview dialog so shoppers can scroll the whole website before committing.
 */
export default async function TemplateDemoPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const { page: pageSlug } = await searchParams;
  const [template, demo] = [await getTemplateBySlug(slug), getTemplateDemo(slug)];
  if (!template || !demo) notFound();

  return <SitePreview site={buildDemoSite(template, demo)} pageSlug={pageSlug} />;
}
