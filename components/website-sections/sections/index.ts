import type { ComponentType } from "react";
import type { SectionProps } from "../helpers";

import { HeroCentered } from "./hero-centered";
import { HeroSplitWithImage } from "./hero-split-with-image";
import { HeroBackgroundImage } from "./hero-background-image";
import { AboutWithImage } from "./about-with-image";
import { AboutSimple } from "./about-simple";
import { ServicesGrid } from "./services-grid";
import { ServicesCards } from "./services-cards";
import { FeaturesGrid } from "./features-grid";
import { FeaturesStats } from "./features-stats";
import { PortfolioCaseStudies } from "./portfolio-case-studies";
import { ProcessSteps } from "./process-steps";
import { TestimonialsGrid } from "./testimonials-grid";
import { FaqAccordion } from "./faq-accordion";
import { PricingTiers } from "./pricing-tiers";
import { ContactSplit } from "./contact-split";
import { ContactSimple } from "./contact-simple";
import { CtaBanner } from "./cta-banner";
import { FooterSimple } from "./footer-simple";

const ProductsGrid = ServicesGrid;

export const SECTION_COMPONENTS: Record<string, ComponentType<SectionProps>> = {
  HeroSplitWithImage,
  HeroCentered,
  HeroBackgroundImage,
  AboutWithImage,
  AboutSimple,
  ServicesGrid,
  ServicesCards,
  ProductsGrid,
  FeaturesGrid,
  FeaturesStats,
  PortfolioCaseStudies,
  ProcessSteps,
  TestimonialsGrid,
  FaqAccordion,
  PricingTiers,
  ContactSplit,
  ContactSimple,
  CtaBanner,
  FooterSimple,
};
