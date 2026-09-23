/** The build steps shown while a website is being written. Order matches the pipeline. */
export const GENERATION_STEPS = [
  { id: "answers", label: "Reading your answers" },
  { id: "plan", label: "Planning pages" },
  { id: "copy", label: "Writing the copy" },
  { id: "check", label: "Checking the words" },
  { id: "images", label: "Matching images" },
  { id: "preview", label: "Building the preview" },
] as const;

export type GenerationStepId = (typeof GENERATION_STEPS)[number]["id"];
