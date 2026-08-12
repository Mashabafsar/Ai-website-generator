import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTemplateBySlug } from "@/lib/templates/store";
import { buildDemoSite, getTemplateDemo, templateSlugsWithDemo } from "@/lib/templates/demos";
import { SitePreview } from "@/components/editor/site-preview";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return templateSlugsWithDemo().map((slug) => ({ slug }));
}

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
export default async function TemplateDemoPage({ params }: Params) {
  const { slug } = await params;
  const [template, demo] = [await getTemplateBySlug(slug), getTemplateDemo(slug)];
  if (!template || !demo) notFound();

  return <SitePreview site={buildDemoSite(template, demo)} />;
}
