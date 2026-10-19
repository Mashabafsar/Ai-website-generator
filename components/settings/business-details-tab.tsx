"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { BrandImportChoice } from "@/components/questionnaire/brand-import-choice";
import {
  CustomColorFields,
  Field,
  FontSelect,
  OptionalSelect,
  ServiceEditor,
} from "@/components/questionnaire/questionnaire-fields";
import { GenerationLog } from "@/components/app/generation-log";
import { useHoldGenerationLock } from "@/components/app/generation-lock";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { readApiError } from "@/components/settings/read-api-error";
import type { BusinessDetailsSeed } from "@/components/settings/types";
import { notifyCreditsChanged } from "@/lib/credits/notify";
import { GenerationStreamError, streamWebsiteGeneration } from "@/lib/ai/generation-stream";
import {
  ASSET_CONSENT_REQUIRED,
  hasImportedBrand,
  hasImportedTheme,
  needsImportedAssetConsent,
  parseImportedBrand,
} from "@/lib/branding/imported-brand";
import { PACKAGE_LABELS } from "@/lib/quote/pricing";
import { parseUserColor } from "@/lib/theme/parse-color";
import {
  COLOR_CHOICES,
  CUSTOM_COLOR_PREFERENCE,
  TONES,
  VISUAL_STYLES,
  defaultQuestionnaire,
  questionnaireSchema,
  type QuestionnaireAnswers,
} from "@/lib/questionnaire/schema";
import type { GenerationStepId } from "@/lib/ai/generation-steps";

const SAVE_FAILED = "Could not save your business details.";

const SOCIALS = [
  ["socialInstagram", "Instagram", "https://instagram.com/yourbusiness"],
  ["socialLinkedin", "LinkedIn", "https://linkedin.com/company/yourbusiness"],
  ["socialTwitter", "X (Twitter)", "https://x.com/yourbusiness"],
  ["socialFacebook", "Facebook", "https://facebook.com/yourbusiness"],
  ["socialYoutube", "YouTube", "https://youtube.com/@yourbusiness"],
] as const;

export function BusinessDetailsTab({
  business,
  generateCost,
  creditBalance,
}: {
  business: BusinessDetailsSeed;
  generateCost: number;
  creditBalance: number;
}) {
  if (business.state === "empty") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">No project yet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Start a project to add your business details. Answers you type and answers we read
            from an existing website both show up here.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="brand">
              <Link href="/app/templates">Start a project</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/app/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (business.state === "continue") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business details are not ready</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Finish setup so this page can show the questionnaire for your project.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="brand">
              <Link href={business.href}>{business.label}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/app/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <BusinessForm
      projectId={business.projectId}
      answers={business.answers}
      canRegenerate={business.canRegenerate}
      questionnaireHref={business.questionnaireHref}
      previewHref={business.previewHref}
      generateCost={generateCost}
      creditBalance={creditBalance}
    />
  );
}

function BusinessForm({
  projectId,
  answers,
  canRegenerate,
  questionnaireHref,
  previewHref,
  generateCost,
  creditBalance,
}: {
  projectId: string;
  answers: QuestionnaireAnswers;
  canRegenerate: boolean;
  questionnaireHref: string;
  previewHref: string;
  generateCost: number;
  creditBalance: number;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [confirmDeleteAssets, setConfirmDeleteAssets] = useState(false);
  const [removingAssets, setRemovingAssets] = useState(false);
  const [consentBlocked, setConsentBlocked] = useState(false);
  const [shortOnCredits, setShortOnCredits] = useState(false);
  const [buildStep, setBuildStep] = useState<GenerationStepId | "done" | null>(null);
  const regenLock = useRef(false);
  useHoldGenerationLock(buildStep !== null && buildStep !== "done");

  const form = useForm<QuestionnaireAnswers>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      ...defaultQuestionnaire,
      ...answers,
      templateId: answers.templateId,
      importedThemeChoice:
        answers.importedThemeChoice ||
        (hasImportedTheme(parseImportedBrand(answers.importedBrand)) ? "imported" : ""),
    },
    mode: "onTouched",
  });

  const { register, handleSubmit, watch, setValue, reset, formState } = form;
  const err = formState.errors;
  const services = watch("services") ?? [];
  const importedBrand = parseImportedBrand(watch("importedBrand"));
  const importedThemeChoice = watch("importedThemeChoice");
  const assetConsent = Boolean(watch("importedAssetConsent")?.granted);
  const busy = saving || regenerating || removingAssets || (buildStep !== null && buildStep !== "done");
  const packageLabel = PACKAGE_LABELS[answers.packageType] ?? answers.packageType;

  function noteShortCredits() {
    setShortOnCredits(true);
    toast.error("Not enough credits to regenerate your website.", {
      action: {
        label: "Buy credits",
        onClick: () => router.push("/app/credits"),
      },
    });
  }

  function rejectMissingAssetConsent(values: QuestionnaireAnswers): boolean {
    if (!needsImportedAssetConsent(parseImportedBrand(values.importedBrand), values.importedAssetConsent)) {
      return false;
    }
    setConsentBlocked(true);
    toast.error(ASSET_CONSENT_REQUIRED);
    return true;
  }

  async function saveAnswers(values: QuestionnaireAnswers): Promise<boolean> {
    if (rejectMissingAssetConsent(values)) return false;
    if (values.colorPreference === CUSTOM_COLOR_PREFERENCE && !parseUserColor(values.customPrimary || "")) {
      toast.error("Enter a valid primary color, or pick a preset.");
      return false;
    }
    const payload: QuestionnaireAnswers = {
      ...answers,
      ...values,
      templateId: answers.templateId,
      layout: values.layout?.length ? values.layout : (answers.layout ?? []),
      layoutPlan: values.layoutPlan ?? answers.layoutPlan,
    };
    const res = await fetch(`/api/projects/${projectId}/questionnaire`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const { message } = await readApiError(res, SAVE_FAILED);
      toast.error(message);
      return false;
    }
    reset(payload);
    return true;
  }

  function onInvalid() {
    if (rejectMissingAssetConsent(form.getValues())) return;
    toast.error("Please check your answers and try again.");
  }

  const onSave = handleSubmit(async (values) => {
    setSaving(true);
    try {
      const ok = await saveAnswers(values);
      if (!ok) return;
      toast.success("Business details saved.");
      if (canRegenerate) setConfirmRegen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  }, onInvalid);

  const onAskRegenerate = handleSubmit(async (values) => {
    if (!canRegenerate || busy) return;
    setSaving(true);
    try {
      if (formState.isDirty) {
        const ok = await saveAnswers(values);
        if (!ok) return;
        toast.success("Business details saved.");
      } else if (rejectMissingAssetConsent(values)) {
        return;
      }
      setConfirmRegen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  }, onInvalid);

  async function creditsCoverCost(): Promise<boolean> {
    try {
      const res = await fetch("/api/credits/balance");
      if (!res.ok) return true;
      const data = (await res.json()) as { balance?: unknown };
      if (typeof data.balance === "number" && data.balance < generateCost) {
        noteShortCredits();
        return false;
      }
      setShortOnCredits(false);
      return true;
    } catch (err) {
      console.error("[settings] balance check failed:", err instanceof Error ? err.message : err);
      return true;
    }
  }

  async function regenerate() {
    if (regenLock.current) return;
    regenLock.current = true;
    setConfirmRegen(false);
    setRegenerating(true);
    try {
      if (!(await creditsCoverCost())) return;
      setBuildStep("answers");
      const data = await streamWebsiteGeneration(projectId, setBuildStep, { mode: "regenerate" });
      setBuildStep("done");
      notifyCreditsChanged();
      if (data.fromTemplate) {
        toast.error("Our writing tools are still unavailable. You were not charged.");
      } else {
        toast.success("Your website has been regenerated.");
      }
      router.refresh();
    } catch (err) {
      setBuildStep(null);
      if (err instanceof GenerationStreamError && err.code === "INSUFFICIENT_CREDITS") {
        noteShortCredits();
        return;
      }
      toast.error(err instanceof Error ? err.message : "We couldn't regenerate your website.");
    } finally {
      regenLock.current = false;
      setRegenerating(false);
    }
  }

  async function removeImportedAssets() {
    setRemovingAssets(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/imported-assets`, { method: "DELETE" });
      if (!res.ok) {
        const { message } = await readApiError(res, "Could not delete the imported files.");
        toast.error(message);
        return;
      }
      setValue("importedBrand", undefined, { shouldDirty: true });
      setValue("importedThemeChoice", "", { shouldDirty: true });
      setValue("importedAssetConsent", undefined, { shouldDirty: true });
      setConsentBlocked(false);
      toast.success("Imported files deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the imported files.");
    } finally {
      setRemovingAssets(false);
      setConfirmDeleteAssets(false);
    }
  }

  const servicesError = servicesErrorMessage(err.services);

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        void onSave();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !(event.target instanceof HTMLTextAreaElement)) {
          event.preventDefault();
        }
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-xl text-sm text-muted-foreground">
          These are the answers we use to write your website, whether you typed them or we read
          them from your current site.
        </p>
        <div className="inline-flex items-center gap-3 rounded-xl border bg-card px-5 py-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <div className="font-display text-2xl font-bold leading-none">
              {creditBalance.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">available credits</div>
          </div>
        </div>
      </div>

      {buildStep ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Regenerating your website</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This usually takes a minute. Please stay on this page — the side menu is paused
              until your website is ready.
            </p>
            <GenerationLog activeId={buildStep} />
          </CardContent>
        </Card>
      ) : null}

      <fieldset disabled={busy} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current site</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="Do you have an existing website?">
              <Select
                value={watch("hasWebsite") || undefined}
                onValueChange={(next) =>
                  setValue("hasWebsite", next === "yes" ? "yes" : "no", { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes, I have a website</SelectItem>
                  <SelectItem value="no">No, this is a new website</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Existing website URL" error={err.existingWebsiteUrl?.message}>
              <Input
                type="url"
                placeholder="https://yourbusiness.com"
                {...register("existingWebsiteUrl")}
              />
            </Field>
            {importedBrand && hasImportedBrand(importedBrand) ? (
              <BrandImportChoice
                brand={importedBrand}
                value={importedThemeChoice === "custom" ? "custom" : "imported"}
                onChange={(next) =>
                  setValue("importedThemeChoice", next, { shouldDirty: true, shouldValidate: true })
                }
                assetConsent={assetConsent}
                onAssetConsentChange={(granted) => {
                  if (granted) setConsentBlocked(false);
                  setValue("importedAssetConsent", granted ? { granted: true } : undefined, {
                    shouldDirty: true,
                  });
                }}
                consentError={consentBlocked ? ASSET_CONSENT_REQUIRED : undefined}
                onRemoveAssets={() => setConfirmDeleteAssets(true)}
                removingAssets={removingAssets}
              />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Business</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
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
            <ServiceEditor
              services={services}
              error={servicesError}
              onChange={(next) => setValue("services", next, { shouldValidate: true, shouldDirty: true })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Look</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {importedThemeChoice === "imported" ? (
              <p className="text-sm text-muted-foreground">
                You chose to keep the look from your existing website. Tone and visual style still
                tune the writing; colors and font come from the import.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Optional. Your chosen design still owns the layout. These picks only tune the
                writing voice, colors, and font.
              </p>
            )}
            <OptionalSelect
              label="Tone"
              error={err.tone?.message}
              value={watch("tone")}
              onChange={(value) => setValue("tone", value, { shouldValidate: true, shouldDirty: true })}
              options={TONES}
            />
            {importedThemeChoice !== "imported" ? (
              <>
                <OptionalSelect
                  label="Colors"
                  error={err.colorPreference?.message}
                  value={watch("colorPreference")}
                  onChange={(value) => {
                    setValue("colorPreference", value, { shouldValidate: true, shouldDirty: true });
                    if (value !== CUSTOM_COLOR_PREFERENCE) {
                      setValue("customPrimary", "", { shouldDirty: true });
                      setValue("customSecondary", "", { shouldDirty: true });
                      setValue("customAccent", "", { shouldDirty: true });
                    }
                  }}
                  options={COLOR_CHOICES}
                />
                {watch("colorPreference") === CUSTOM_COLOR_PREFERENCE ? (
                  <CustomColorFields
                    primary={watch("customPrimary") || ""}
                    secondary={watch("customSecondary") || ""}
                    accent={watch("customAccent") || ""}
                    onChange={(field, hex) =>
                      setValue(field, hex, { shouldDirty: true, shouldValidate: true })
                    }
                  />
                ) : null}
                <FontSelect
                  value={watch("fontFamily")}
                  onChange={(value) => setValue("fontFamily", value, { shouldValidate: true, shouldDirty: true })}
                />
              </>
            ) : null}
            <OptionalSelect
              label="Visual style"
              error={err.visualStyle?.message}
              value={watch("visualStyle")}
              onChange={(value) => setValue("visualStyle", value, { shouldValidate: true, shouldDirty: true })}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact email" error={err.contactEmail?.message}>
                <Input type="email" placeholder="hello@business.com" {...register("contactEmail")} />
              </Field>
              <Field label="Contact phone" error={err.contactPhone?.message}>
                <Input placeholder="(555) 123-4567" {...register("contactPhone")} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOCIALS.map(([name, label, placeholder]) => (
                <Field key={name} label={label}>
                  <Input type="url" placeholder={placeholder} {...register(name)} />
                </Field>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Package on file: {packageLabel}.</p>
          </CardContent>
        </Card>
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="button" variant="brand" onClick={() => void onSave()} disabled={busy}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save business details
        </Button>
        {canRegenerate ? (
          <Button type="button" variant="outline" onClick={() => void onAskRegenerate()} disabled={busy}>
            {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Regenerate website ({generateCost} credits)
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href={questionnaireHref}>Continue setup</Link>
          </Button>
        )}
        {canRegenerate ? (
          <Button asChild variant="ghost">
            <Link href={previewHref}>Open preview</Link>
          </Button>
        ) : null}
      </div>

      {canRegenerate ? (
        <p className="text-sm text-muted-foreground">
          Regenerating uses {generateCost} credits and rebuilds the site from these answers. You
          have {creditBalance.toLocaleString()} credits available.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Save your details here. The first write still happens from the questionnaire, and it
          uses {generateCost} credits.
        </p>
      )}

      {shortOnCredits ? (
        <p className="text-sm text-destructive">
          Not enough credits to regenerate.{" "}
          <Link href="/app/credits" className="font-medium underline">
            Buy credits
          </Link>
        </p>
      ) : null}

      <ConfirmDialog
        open={confirmRegen}
        onOpenChange={setConfirmRegen}
        title="Regenerate website?"
        description={`This uses ${generateCost} credits and rebuilds your website from the business details saved here. Stay on this page until it finishes.`}
        confirmLabel={`Regenerate website (${generateCost} credits)`}
        onConfirm={() => void regenerate()}
      />
      <ConfirmDialog
        open={confirmDeleteAssets}
        onOpenChange={setConfirmDeleteAssets}
        title="Delete the imported files?"
        description="The logo and photos we downloaded will be removed. The answers already filled in stay, and the site will use stock photos instead."
        confirmLabel="Delete files"
        destructive
        pending={removingAssets}
        onConfirm={() => void removeImportedAssets()}
      />
    </form>
  );
}

function servicesErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  if ("message" in error && typeof error.message === "string") return error.message;
  if (!("root" in error) || !error.root || typeof error.root !== "object") return undefined;
  if ("message" in error.root && typeof error.root.message === "string") return error.root.message;
  return undefined;
}
