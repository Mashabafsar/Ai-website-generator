"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Plus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import {
  questionnaireSchema,
  defaultQuestionnaire,
  TONES,
  COLOR_CHOICES,
  CUSTOM_COLOR_PREFERENCE,
  VISUAL_STYLES,
  type QuestionnaireAnswers,
} from "@/lib/questionnaire/schema";
import { ColorField } from "@/components/theme/color-field";
import { parseUserColor } from "@/lib/theme/parse-color";
import { BrandImportChoice } from "@/components/questionnaire/brand-import-choice";
import { SitePlanPreview } from "@/components/questionnaire/site-plan-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { hasImportedBrand, hasImportedTheme, parseImportedBrand } from "@/lib/branding/imported-brand";
import { FONT_CATALOG_HREF, THEME_FONTS } from "@/templates/shared/fonts";
import { notifyCreditsChanged } from "@/lib/credits/notify";
import { GenerationLog } from "@/components/app/generation-log";
import { GenerationStreamError, streamWebsiteGeneration } from "@/lib/ai/generation-stream";
import type { GenerationStepId } from "@/lib/ai/generation-steps";
import { isMultiPageTemplate } from "@/lib/agents/site-layout";
import type { SitePlanView } from "@/lib/agents/website-planner";
import type { TemplatePageDef } from "@/lib/templates/types";

const STEPS_BASE = ["Current site", "Business", "Customers", "Look", "Contact", "Review"] as const;

const STEP_FIELDS: Record<number, (keyof QuestionnaireAnswers)[]> = {
  0: ["hasWebsite", "existingWebsiteUrl"],
  1: ["businessName", "industry", "description", "location"],
  2: ["targetAudience", "demographics", "goals", "services"],
  3: ["tone", "colorPreference", "customPrimary", "customSecondary", "customAccent", "visualStyle", "brandingNotes", "fontFamily"],
  4: ["contactEmail", "contactPhone"],
  5: [],
};

// Fields the website import can prefill — mapped onto the form one at a time.
const IMPORTABLE_FIELDS = [
  "businessName",
  "industry",
  "description",
  "location",
  "targetAudience",
  "demographics",
  "goals",
  "services",
  "contactEmail",
  "contactPhone",
] as const;

const IMPORT_FIELD_LABELS: Record<(typeof IMPORTABLE_FIELDS)[number], string> = {
  businessName: "Business name",
  industry: "Industry",
  description: "Description",
  location: "Location",
  targetAudience: "Target audience",
  demographics: "Demographics",
  goals: "Website goals",
  services: "Services",
  contactEmail: "Contact email",
  contactPhone: "Contact phone",
};

function labelsFromAnswers(answers: QuestionnaireAnswers | null | undefined): string[] {
  if (!answers) return [];
  const filled: string[] = [];
  for (const key of IMPORTABLE_FIELDS) {
    const value = answers[key];
    if (typeof value === "string" && value.trim()) filled.push(IMPORT_FIELD_LABELS[key]);
    else if (key === "services" && Array.isArray(value) && value.length) {
      filled.push(IMPORT_FIELD_LABELS.services);
    }
  }
  return filled;
}

const DESIGN_DEFAULT = "__design_default__";

function resumeStep(answers: QuestionnaireAnswers | null): number {
  if (!answers?.hasWebsite) return 0;
  const name = answers.businessName?.trim() ?? "";
  const industry = answers.industry?.trim() ?? "";
  const description = answers.description?.trim() ?? "";
  if (name.length < 2 || industry.length < 2 || description.length < 10) return 1;
  const audience = answers.targetAudience?.trim() ?? "";
  const demographics = answers.demographics?.trim() ?? "";
  const goals = answers.goals?.trim() ?? "";
  const services = answers.services ?? [];
  if (audience.length < 3 || demographics.length < 3 || goals.length < 5 || services.length < 1) {
    return 2;
  }
  return 5;
}

export function QuestionnaireWizard({
  projectId,
  templateId,
  templatePages,
  initialAnswers,
  alreadyGenerated,
  generateCost,
  importCost,
}: {
  projectId: string;
  /** The locked design. Layout stays fixed; optional style fields only tune voice and colors. */
  templateId: string;
  templatePages: TemplatePageDef[];
  initialAnswers: QuestionnaireAnswers | null;
  alreadyGenerated: boolean;
  generateCost: number;
  importCost: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState(() => resumeStep(initialAnswers));
  const STEPS = STEPS_BASE;
  const [submitting, setSubmitting] = useState(false);
  const [buildStep, setBuildStep] = useState<GenerationStepId | "done" | null>(null);
  const [planning, setPlanning] = useState(false);
  const [sitePlan, setSitePlan] = useState<SitePlanView | null>(
    () => initialAnswers?.layoutPlan ?? null
  );
  const [serviceInput, setServiceInput] = useState("");
  const [importing, setImporting] = useState(false);
  const [removingAssets, setRemovingAssets] = useState(false);
  const [importedSummary, setImportedSummary] = useState<string[]>(() =>
    labelsFromAnswers(initialAnswers)
  );

  const form = useForm<QuestionnaireAnswers>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      ...defaultQuestionnaire,
      ...(initialAnswers ?? {}),
      templateId,
      importedThemeChoice:
        initialAnswers?.importedThemeChoice ||
        (hasImportedTheme(parseImportedBrand(initialAnswers?.importedBrand)) ? "imported" : ""),
    },
    mode: "onTouched",
  });

  const { register, handleSubmit, trigger, watch, setValue, formState } = form;
  const services = watch("services");
  const industry = watch("industry");
  const description = watch("description");
  const targetAudience = watch("targetAudience");
  const demographics = watch("demographics");
  const goals = watch("goals");
  const brandingNotes = watch("brandingNotes");
  const businessName = watch("businessName");
  const location = watch("location");

  useEffect(() => {
    if (step !== 5) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setPlanning(true);
      try {
        const res = await fetch(`/api/projects/${projectId}/site-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName,
            industry,
            description,
            location,
            targetAudience,
            demographics,
            goals,
            services,
            brandingNotes,
          }),
        });
        const data = (await res.json()) as {
          layout?: QuestionnaireAnswers["layout"];
          view?: SitePlanView;
        };
        if (cancelled) return;
        if (!res.ok || !data.view) {
          toast.error("We couldn't plan the site just now — we'll still choose pages when you generate.");
          return;
        }
        setSitePlan(data.view);
        setValue("layout", data.layout ?? [], { shouldDirty: true });
        setValue("layoutPlan", data.view, { shouldDirty: true });
      } catch {
        if (!cancelled) {
          toast.error("We couldn't plan the site just now — we'll still choose pages when you generate.");
        }
      } finally {
        if (!cancelled) setPlanning(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    step,
    projectId,
    businessName,
    industry,
    description,
    location,
    targetAudience,
    demographics,
    goals,
    brandingNotes,
    JSON.stringify(services),
    setValue,
  ]);

  function customColorsReady() {
    if (watch("colorPreference") !== CUSTOM_COLOR_PREFERENCE) return true;
    return Boolean(parseUserColor(watch("customPrimary") || ""));
  }

  async function next() {
    const ok = await trigger(STEP_FIELDS[step]);
    if (!ok) return;
    if (step === 3 && !customColorsReady()) {
      toast.error("Enter a valid primary color, or pick a preset.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  // Step 0 — pull business details from the customer's existing website and
  // prefill the form. Never blocks: a failed import just means typing manually.
  async function importFromWebsite() {
    const url = (watch("existingWebsiteUrl") || "").trim();
    if (!url) {
      toast.error("Enter your website URL first.");
      return;
    }
    setImporting(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, projectId }),
      });
      let data: {
        ok?: boolean;
        error?: string;
        code?: string;
        fields?: Record<string, unknown>;
        brand?: unknown;
      } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        throw new Error("We couldn't read that website. Please try again.");
      }
      notifyCreditsChanged();
      router.refresh();
      if (res.status === 402 || data?.code === "INSUFFICIENT_CREDITS") {
        toast.error(`Importing a website costs ${importCost} credits — opening the credits page.`);
        router.push("/app/credits");
        return;
      }
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "We couldn't read that website.");
      }
      const fields = (data.fields ?? {}) as Record<string, unknown>;
      const filled: string[] = [];
      for (const key of IMPORTABLE_FIELDS) {
        const value = fields[key];
        if (key === "services") {
          const list = Array.isArray(value)
            ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
            : [];
          setValue("services", list, { shouldDirty: true, shouldValidate: true });
          if (list.length) filled.push(IMPORT_FIELD_LABELS.services);
          continue;
        }
        const text = typeof value === "string" ? value.trim() : "";
        setValue(key, text, { shouldDirty: true, shouldValidate: true });
        if (text) filled.push(IMPORT_FIELD_LABELS[key]);
      }
      setImportedSummary(filled);
      const brand = parseImportedBrand(data.brand);
      if (brand) {
        setValue("importedBrand", brand, { shouldDirty: true });
        setValue(
          "importedThemeChoice",
          brand.colors || brand.fontFamily ? "imported" : "custom",
          { shouldDirty: true }
        );
        setValue("importedAssetConsent", undefined, { shouldDirty: true });
      }
      if (filled.length === 0 && !brand) {
        toast.info("We read the site but couldn't pull out details — you can fill them in next.");
      } else if (brand) {
        toast.success(
          filled.length
            ? "Imported answers and branding — review the look, then continue."
            : "Imported — choose whether to keep this look, then continue."
        );
      } else {
        toast.success("Details imported — review the next steps.");
        setStep(1);
      }
    } catch (err) {
      const message =
        err instanceof TypeError && /failed to fetch/i.test(err.message)
          ? "Import didn't finish — please try again."
          : err instanceof Error
            ? err.message
            : "We couldn't read that website.";
      toast.error(message);
    } finally {
      setImporting(false);
    }
  }

  const importedBrand = parseImportedBrand(watch("importedBrand"));
  const importedThemeChoice = watch("importedThemeChoice");
  const assetConsent = Boolean(watch("importedAssetConsent")?.granted);

  async function removeImportedAssets() {
    setRemovingAssets(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/imported-assets`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete the imported files.");
      if (importedBrand) {
        setValue(
          "importedBrand",
          { ...importedBrand, logoUrl: undefined, images: [] },
          { shouldDirty: true }
        );
      }
      setValue("importedAssetConsent", undefined, { shouldDirty: true });
      toast.success("Imported files deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the imported files.");
    } finally {
      setRemovingAssets(false);
    }
  }

  function addService() {
    const v = serviceInput.trim();
    if (!v) return;
    if (!services.includes(v)) setValue("services", [...services, v], { shouldValidate: true });
    setServiceInput("");
  }

  async function onSubmit(values: QuestionnaireAnswers) {
    if (values.colorPreference === CUSTOM_COLOR_PREFERENCE && !parseUserColor(values.customPrimary || "")) {
      toast.error("Enter a valid primary color, or pick a preset.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        templateId,
        layout: values.layout ?? [],
      };
      const saveRes = await fetch(`/api/projects/${projectId}/questionnaire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!saveRes.ok) throw new Error("Could not save your answers");

      if (alreadyGenerated) {
        toast.success("Answers saved.");
        router.push(`/app/project/${projectId}/preview`);
        router.refresh();
        return;
      }

      setBuildStep("answers");
      const data = await streamWebsiteGeneration(projectId, setBuildStep);
      setBuildStep("done");

      notifyCreditsChanged();
      if (data.fromTemplate) {
        toast.error(
          "This website is using starter content. We couldn't reach the tools that write your copy, so you were not charged. You can try writing it again from the preview."
        );
      } else {
        toast.success("Website generated!");
      }
      router.push(`/app/project/${projectId}/preview`);
      router.refresh();
    } catch (err) {
      setBuildStep(null);
      if (err instanceof GenerationStreamError && err.code === "INSUFFICIENT_CREDITS") {
        toast.error("Not enough credits — opening the credits page.");
        router.push("/app/credits");
        return;
      }
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const err = formState.errors;

  if (buildStep) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <p className="font-medium">Creating your website</p>
              <p className="text-sm text-muted-foreground">This usually takes a minute. You can stay on this page.</p>
            </div>
            <GenerationLog activeId={buildStep} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardContent className="p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            // Never let Enter implicitly submit the form (which would start
            // generation early). Generation only runs from the explicit button on
            // the last step. Textareas keep their normal multi-line behavior.
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !(e.target instanceof HTMLTextAreaElement)
              ) {
                e.preventDefault();
              }
            }}
            className="space-y-5"
          >
            <input type="hidden" {...register("templateId")} value={templateId} readOnly />

            {step === 0 && (
              <>
                <input type="hidden" {...register("hasWebsite")} />
                <Field label="Do you have an existing website?">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <WebsiteChoice
                      active={watch("hasWebsite") === "yes"}
                      onClick={() => setValue("hasWebsite", "yes", { shouldDirty: true })}
                      title="Yes, import it"
                      desc="We'll pull your business details from your current site."
                    />
                    <WebsiteChoice
                      active={watch("hasWebsite") === "no"}
                      onClick={() => {
                        setValue("hasWebsite", "no", { shouldDirty: true });
                        setValue("existingWebsiteUrl", "");
                        setValue("importedBrand", undefined, { shouldDirty: true });
                        setValue("importedThemeChoice", "", { shouldDirty: true });
                        setValue("importedAssetConsent", undefined, { shouldDirty: true });
                        setImportedSummary([]);
                        // No website means nothing to import — jump straight in.
                        setStep(1);
                      }}
                      title="No, start fresh"
                      desc="Answer a few questions and we'll write everything for you."
                    />
                  </div>
                </Field>

                {watch("hasWebsite") === "yes" && (
                  <Field
                    label="Your website URL"
                    error={err.existingWebsiteUrl?.message}
                    hint={`We'll read your current website and fill in these answers — you can change anything after. Importing costs ${importCost} credits (returned if we can't read the site).`}
                  >
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        placeholder="https://yourbusiness.com"
                        {...register("existingWebsiteUrl")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={importFromWebsite}
                        disabled={importing}
                      >
                        {importing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        Import ({importCost} credits)
                      </Button>
                    </div>
                  </Field>
                )}

                {watch("hasWebsite") === "yes" && importedSummary.length > 0 && (
                  <div className="rounded-xl border bg-muted/30 p-3">
                    <p className="text-sm font-medium">Answers filled from your site</p>
                    <p className="mt-1 text-sm text-muted-foreground">{importedSummary.join(" · ")}</p>
                  </div>
                )}

                {watch("hasWebsite") === "yes" && importedBrand && hasImportedBrand(importedBrand) && (
                  <BrandImportChoice
                    brand={importedBrand}
                    value={importedThemeChoice === "custom" ? "custom" : "imported"}
                    onChange={(next) =>
                      setValue("importedThemeChoice", next, { shouldDirty: true, shouldValidate: true })
                    }
                    assetConsent={assetConsent}
                    onAssetConsentChange={(granted) =>
                      setValue(
                        "importedAssetConsent",
                        granted ? { granted: true } : undefined,
                        { shouldDirty: true }
                      )
                    }
                    onRemoveAssets={removeImportedAssets}
                    removingAssets={removingAssets}
                  />
                )}
              </>
            )}

            {step === 1 && (
              <>
                <Field label="Business name" error={err.businessName?.message}>
                  <Input placeholder="Bright Smile Dental" {...register("businessName")} />
                </Field>
                <Field label="Industry" error={err.industry?.message}>
                  <Input placeholder="Dental Clinic" {...register("industry")} />
                </Field>
                <Field label="Describe your business" error={err.description?.message}>
                  <Textarea
                    rows={4}
                    placeholder="Family dentist offering cleaning, whitening, and checkups."
                    {...register("description")}
                  />
                </Field>
                <Field label="Location (optional)" error={err.location?.message}>
                  <Input placeholder="Dallas, Texas" {...register("location")} />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Everyday words are perfect. We use this to choose the right pages
                  for your visitors — you won&apos;t have to pick them yourself.
                </p>
                <Field
                  label="Who is this website for?"
                  error={err.targetAudience?.message}
                  hint="The people who should find you online."
                >
                  <Input
                    placeholder="Families and working professionals nearby"
                    {...register("targetAudience")}
                  />
                </Field>
                <Field
                  label="Who do you help most?"
                  error={err.demographics?.message}
                  hint="Ages, families, local businesses — whatever you know."
                >
                  <Input
                    placeholder="Local families, homeowners, ages 30–55"
                    {...register("demographics")}
                  />
                </Field>
                <Field
                  label="What should this website do?"
                  error={err.goals?.message}
                  hint="For example: get more calls, look professional, explain your work."
                >
                  <Textarea
                    rows={3}
                    placeholder="Book more appointments and look trustworthy to first-time visitors."
                    {...register("goals")}
                  />
                </Field>
                <Field
                  label="What do you offer?"
                  error={err.services?.message as string | undefined}
                  hint="Add each service or product, one at a time."
                >
                  <div className="flex gap-2">
                    <Input
                      value={serviceInput}
                      onChange={(e) => setServiceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addService();
                        }
                      }}
                      placeholder="e.g. Teeth Whitening"
                    />
                    <Button type="button" variant="outline" onClick={addService}>
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </div>
                  {services.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {services.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() =>
                              setValue(
                                "services",
                                services.filter((x) => x !== s),
                                { shouldValidate: true }
                              )
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </Field>
              </>
            )}

            {step === 3 && (
              <>
                {importedThemeChoice === "imported" ? (
                  <p className="text-sm text-muted-foreground">
                    You chose to keep the look from your existing website. Tone and
                    visual style still tune the writing; colors and font come from the import.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Optional. Your chosen design still owns the layout. These picks only
                    tune the writing voice, colors, and font.
                  </p>
                )}
                <OptionalSelect
                  label="Tone"
                  error={err.tone?.message}
                  value={watch("tone")}
                  onChange={(v) => setValue("tone", v, { shouldValidate: true })}
                  options={TONES}
                />
                {importedThemeChoice !== "imported" && (
                  <>
                    <OptionalSelect
                      label="Colors"
                      error={err.colorPreference?.message}
                      value={watch("colorPreference")}
                      onChange={(v) => {
                        setValue("colorPreference", v, { shouldValidate: true });
                        if (v !== CUSTOM_COLOR_PREFERENCE) {
                          setValue("customPrimary", "", { shouldDirty: true });
                          setValue("customSecondary", "", { shouldDirty: true });
                          setValue("customAccent", "", { shouldDirty: true });
                        }
                      }}
                      options={COLOR_CHOICES}
                    />
                    {watch("colorPreference") === CUSTOM_COLOR_PREFERENCE && (
                      <div className="space-y-3 rounded-xl border bg-muted/30 p-3">
                        <p className="text-sm text-muted-foreground">
                          Type a color code if you have one, or pick a color above.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <ColorField
                            label="Primary"
                            value={watch("customPrimary") || ""}
                            allowEmpty
                            onChange={(hex) =>
                              setValue("customPrimary", hex, { shouldDirty: true, shouldValidate: true })
                            }
                          />
                          <ColorField
                            label="Secondary"
                            value={watch("customSecondary") || ""}
                            allowEmpty
                            onChange={(hex) =>
                              setValue("customSecondary", hex, { shouldDirty: true, shouldValidate: true })
                            }
                          />
                          <ColorField
                            label="Accent (optional)"
                            value={watch("customAccent") || ""}
                            allowEmpty
                            className="sm:col-span-2"
                            onChange={(hex) =>
                              setValue("customAccent", hex, { shouldDirty: true, shouldValidate: true })
                            }
                          />
                        </div>
                        {watch("customPrimary") && !parseUserColor(watch("customPrimary") || "") ? (
                          <p className="text-sm text-destructive">Enter a valid primary color.</p>
                        ) : null}
                      </div>
                    )}
                    <FontSelect
                      value={watch("fontFamily")}
                      onChange={(v) => setValue("fontFamily", v, { shouldValidate: true })}
                    />
                  </>
                )}
                <OptionalSelect
                  label="Visual style"
                  error={err.visualStyle?.message}
                  value={watch("visualStyle")}
                  onChange={(v) => setValue("visualStyle", v, { shouldValidate: true })}
                  options={VISUAL_STYLES}
                />
                <Field
                  label="Branding notes (optional)"
                  error={err.brandingNotes?.message}
                  hint="Brand words, logo notes, or anything the copy should mention."
                >
                  <Textarea
                    rows={3}
                    placeholder="Warm, clinical, never salesy. Keep the word Bright Smile in headlines."
                    {...register("brandingNotes")}
                  />
                </Field>
              </>
            )}

            {step === 4 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact email" error={err.contactEmail?.message}>
                    <Input
                      type="email"
                      placeholder="hello@business.com"
                      {...register("contactEmail")}
                    />
                  </Field>
                  <Field label="Contact phone" error={err.contactPhone?.message}>
                    <Input placeholder="(555) 123-4567" {...register("contactPhone")} />
                  </Field>
                </div>
                <p className="text-sm text-muted-foreground">
                  After we write your site, you&apos;ll see the price and choose whether to
                  download the files or have us put the site online.
                </p>
              </>
            )}

            {step === 5 && (
              <SitePlanPreview
                plan={sitePlan}
                loading={planning}
                multiPage={isMultiPageTemplate(templatePages)}
              />
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || submitting}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>

              {step < STEPS.length - 1 ? (
                <Button type="button" variant="brand" onClick={next}>
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                // Explicit click only — generation must be a deliberate action,
                // never an accidental Enter keypress while filling the form.
                <Button
                  type="button"
                  variant="brand"
                  disabled={submitting || planning}
                  onClick={handleSubmit(onSubmit)}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {alreadyGenerated
                    ? "Save answers"
                    : `Write your website (${generateCost} credits)`}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function OptionalSelect<T extends string>({
  label,
  error,
  value,
  onChange,
  options,
}: {
  label: string;
  error?: string;
  value?: string;
  onChange: (value: T | "") => void;
  options: readonly T[];
}) {
  return (
    <Field label={`${label} (optional)`} error={error}>
      <Select
        value={value || DESIGN_DEFAULT}
        onValueChange={(next) => onChange(next === DESIGN_DEFAULT ? "" : (next as T))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Use this design’s look" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DESIGN_DEFAULT}>Use this design’s look</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function FontSelect({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const selected = THEME_FONTS.find((f) => f.id === value) ?? null;
  return (
    <Field label="Font (optional)">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={FONT_CATALOG_HREF} />
      <Select
        value={value || DESIGN_DEFAULT}
        onValueChange={(next) => onChange(next === DESIGN_DEFAULT ? "" : next)}
      >
        <SelectTrigger>
          <span style={selected ? { fontFamily: selected.stack } : undefined}>
            {selected ? selected.name : "Use this design’s font"}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DESIGN_DEFAULT}>Use this design’s font</SelectItem>
          {THEME_FONTS.map((font) => (
            <SelectItem key={font.id} value={font.id}>
              <span style={{ fontFamily: font.stack }}>{font.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function WebsiteChoice({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-4 text-left transition-colors",
        active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "hover:bg-secondary"
      )}
    >
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
    </button>
  );
}

