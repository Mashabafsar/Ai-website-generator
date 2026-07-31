"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Plus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import {
  questionnaireSchema,
  defaultQuestionnaire,
  type QuestionnaireAnswers,
  TONES,
  VISUAL_STYLES,
  COLOR_PREFERENCES,
  PAGE_OPTIONS,
  FEATURE_OPTIONS,
} from "@/lib/questionnaire/schema";
import { PackageType } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURE_LABELS: Record<string, string> = {
  contact_form: "Contact form",
  gallery: "Gallery",
  testimonials: "Testimonials",
  faq: "FAQ",
  pricing_table: "Pricing table",
  newsletter: "Newsletter",
};

const STEPS = ["Business", "Offering", "Design", "Structure"] as const;

const STEP_FIELDS: Record<number, (keyof QuestionnaireAnswers)[]> = {
  0: ["businessName", "industry", "description", "location"],
  1: ["targetAudience", "services"],
  2: ["tone", "visualStyle", "colorPreference"],
  3: ["pages", "features", "contactEmail", "contactPhone", "packageType"],
};

export function QuestionnaireWizard({
  projectId,
  initialAnswers,
  alreadyGenerated,
}: {
  projectId: string;
  initialAnswers: QuestionnaireAnswers | null;
  alreadyGenerated: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serviceInput, setServiceInput] = useState("");

  const form = useForm<QuestionnaireAnswers>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: initialAnswers ?? defaultQuestionnaire,
    mode: "onTouched",
  });

  const { control, register, handleSubmit, trigger, watch, setValue, formState } = form;
  const services = watch("services");
  const pages = watch("pages");
  const features = watch("features");

  async function next() {
    const ok = await trigger(STEP_FIELDS[step]);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function addService() {
    const v = serviceInput.trim();
    if (!v) return;
    if (!services.includes(v)) setValue("services", [...services, v], { shouldValidate: true });
    setServiceInput("");
  }

  function toggleArray<T extends string>(key: "pages" | "features", value: T) {
    const current = (key === "pages" ? pages : features) as string[];
    const nextVal = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(key, nextVal as never, { shouldValidate: true });
  }

  async function onSubmit(values: QuestionnaireAnswers) {
    setSubmitting(true);
    try {
      const saveRes = await fetch(`/api/projects/${projectId}/questionnaire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!saveRes.ok) throw new Error("Could not save your answers");

      if (alreadyGenerated) {
        toast.success("Answers saved.");
        router.push(`/app/project/${projectId}/preview`);
        router.refresh();
        return;
      }

      toast.loading("Generating your website…", { id: "gen" });
      const genRes = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await genRes.json();
      toast.dismiss("gen");

      if (!genRes.ok) {
        if (data.code === "INSUFFICIENT_CREDITS") {
          toast.error("Not enough credits — redirecting to top up.");
          router.push("/app/credits");
          return;
        }
        throw new Error(data.error || "Generation failed");
      }

      toast.success("Website generated!");
      router.push(`/app/project/${projectId}/preview`);
      router.refresh();
    } catch (err) {
      toast.dismiss("gen");
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const err = formState.errors;

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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {step === 0 && (
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

            {step === 1 && (
              <>
                <Field label="Target audience" error={err.targetAudience?.message}>
                  <Input placeholder="Families and working professionals" {...register("targetAudience")} />
                </Field>
                <Field label="Services or products" error={err.services?.message as string | undefined}>
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

            {step === 2 && (
              <>
                <SelectField label="Brand tone" name="tone" control={control} options={TONES} />
                <SelectField label="Visual style" name="visualStyle" control={control} options={VISUAL_STYLES} />
                <SelectField
                  label="Color preference"
                  name="colorPreference"
                  control={control}
                  options={COLOR_PREFERENCES}
                />
              </>
            )}

            {step === 3 && (
              <>
                <Field
                  label="Sections"
                  hint="Your site is a single scrollable page — these become sections on it."
                  error={err.pages?.message as string | undefined}
                >
                  <div className="flex flex-wrap gap-2">
                    {PAGE_OPTIONS.map((pageOpt) => (
                      <Chip
                        key={pageOpt}
                        active={pages.includes(pageOpt)}
                        onClick={() => toggleArray("pages", pageOpt)}
                      >
                        {pageOpt}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field label="Features">
                  <div className="flex flex-wrap gap-2">
                    {FEATURE_OPTIONS.map((f) => (
                      <Chip key={f} active={features.includes(f)} onClick={() => toggleArray("features", f)}>
                        {FEATURE_LABELS[f]}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact email" error={err.contactEmail?.message}>
                    <Input type="email" placeholder="hello@business.com" {...register("contactEmail")} />
                  </Field>
                  <Field label="Contact phone" error={err.contactPhone?.message}>
                    <Input placeholder="(555) 123-4567" {...register("contactPhone")} />
                  </Field>
                </div>
                <Field label="Hosting package">
                  <Controller
                    control={control}
                    name="packageType"
                    render={({ field }) => (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <PackageOption
                          active={field.value === PackageType.SELF_HOSTING}
                          onClick={() => field.onChange(PackageType.SELF_HOSTING)}
                          title="Self-hosting"
                          desc="Download the code ZIP and host it yourself."
                        />
                        <PackageOption
                          active={field.value === PackageType.MANAGED_HOSTING}
                          onClick={() => field.onChange(PackageType.MANAGED_HOSTING)}
                          title="Managed hosting"
                          desc="We deploy it to a live subdomain for you."
                        />
                      </div>
                    )}
                  />
                </Field>
              </>
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
                <Button type="submit" variant="brand" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {alreadyGenerated ? "Save answers" : "Generate website"}
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

function SelectField({
  label,
  name,
  control,
  options,
}: {
  label: string;
  name: "tone" | "visualStyle" | "colorPreference";
  control: ReturnType<typeof useForm<QuestionnaireAnswers>>["control"];
  options: readonly string[];
}) {
  return (
    <Field label={label}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <Chip key={opt} active={field.value === opt} onClick={() => field.onChange(opt)}>
                {opt}
              </Chip>
            ))}
          </div>
        )}
      />
    </Field>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-transparent brand-gradient text-white"
          : "border-border bg-background hover:bg-secondary"
      )}
    >
      {children}
    </button>
  );
}

function PackageOption({
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
