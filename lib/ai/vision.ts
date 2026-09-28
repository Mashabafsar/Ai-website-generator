// Vision calls for photo placement: describe what a photo shows, or choose the
// candidate that fits each slot. Photos are shrunk to small JPEG thumbnails
// before they are sent, so a batch of three dozen stays cheap. Every function
// throws on failure; callers fall back to the providers' text descriptions.

import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";
import type { SDKImage } from "@cursor/sdk";
import { env } from "@/lib/env";
import { runCursorText } from "@/lib/ai/cursor-runtime";
import { estimateTokens, recordUsage } from "@/lib/ai/usage";
import { extractJson } from "@/lib/blueprint/schema";
import { PHOTO_KINDS, ROLE_BRIEF, type PhotoKind, type SlotIntent } from "@/lib/images/placement";
import type { ImportedPhotoAnalysis } from "@/lib/branding/imported-brand";

const THUMB_EDGE = 384;
const FETCH_TIMEOUT_MS = 8_000;
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const LOAD_CONCURRENCY = 6;
/** Rough prompt cost of one thumbnail, for the usage ledger. */
const TOKENS_PER_IMAGE = 250;

export type VisionContext = { businessName: string; industry: string };

export function visionAvailable(): boolean {
  return env.images.vision.enabled && Boolean(env.ai.cursorApiKey) && !env.ai.useMock;
}

async function sourceBytes(url: string): Promise<Buffer | null> {
  if (url.startsWith("/uploads/") && !url.includes("..")) {
    try {
      return await readFile(path.join(process.cwd(), "public", url));
    } catch {
      return null;
    }
  }
  if (!/^https:\/\//i.test(url)) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) return null;
    if (Number(res.headers.get("content-length") || 0) > MAX_SOURCE_BYTES) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    return bytes.length > MAX_SOURCE_BYTES ? null : bytes;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function thumbnail(url: string): Promise<SDKImage | null> {
  const bytes = await sourceBytes(url);
  if (!bytes) return null;
  try {
    const { data, info } = await sharp(bytes)
      .rotate()
      .resize(THUMB_EDGE, THUMB_EDGE, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer({ resolveWithObject: true });
    return {
      data: data.toString("base64"),
      mimeType: "image/jpeg",
      dimension: { width: info.width, height: info.height },
    };
  } catch {
    return null;
  }
}

async function loadThumbnails(urls: string[]): Promise<(SDKImage | null)[]> {
  const out: (SDKImage | null)[] = new Array(urls.length).fill(null);
  let next = 0;
  const worker = async () => {
    while (next < urls.length) {
      const index = next++;
      out[index] = await thumbnail(urls[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(LOAD_CONCURRENCY, urls.length) }, worker));
  return out;
}

async function runVision(text: string, images: SDKImage[], timeoutMs: number): Promise<unknown> {
  const model = env.images.vision.model;
  const reply = await runCursorText(env.ai.cursorApiKey, model, { text, images }, timeoutMs);
  const promptTokens = estimateTokens(text) + images.length * TOKENS_PER_IMAGE;
  const completionTokens = estimateTokens(reply);
  recordUsage({
    provider: "cursor",
    model,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    estimated: true,
  });
  const json = extractJson(reply);
  if (!json) throw new Error("Vision reply was not JSON");
  return json;
}

const KIND_LIST = PHOTO_KINDS.join(", ");

const KIND_GUIDE = [
  "Kinds:",
  "- people: one or more people doing something (staff at work, customers, a team)",
  "- portrait: a posed close-up of one person",
  "- place: an interior, exterior, venue or landscape with no clear main person",
  "- work: a service or craft being performed, or finished work",
  "- product: an object or product shot",
  "- food: food or drink",
  "- detail: a close-up of tools, materials or textures",
  "- graphic: a logo, screenshot, illustration, banner or anything mostly text",
  "- other: none of the above",
].join("\n");

const describedSchema = z.object({
  photos: z.array(
    z.object({
      image: z.coerce.number().int(),
      description: z.string().catch(""),
      tags: z.array(z.string()).catch([]),
      kind: z.string().catch("other"),
      quality: z.string().catch("good"),
    })
  ),
});

/**
 * Describes each photo in plain terms. The result lines up with `urls`; a
 * photo that could not be loaded or was skipped by the model is `null`.
 */
export async function describePhotos(
  urls: string[],
  ctx: VisionContext,
  timeoutMs: number
): Promise<(ImportedPhotoAnalysis | null)[]> {
  const result: (ImportedPhotoAnalysis | null)[] = urls.map(() => null);
  const capped = urls.slice(0, env.images.vision.maxImages);
  const thumbs = await loadThumbnails(capped);

  const sent: number[] = [];
  const images: SDKImage[] = [];
  thumbs.forEach((thumb, index) => {
    if (!thumb) return;
    sent.push(index);
    images.push(thumb);
  });
  if (!images.length) return result;

  const text = [
    `These ${images.length} photos come from the website of "${ctx.businessName}" (${ctx.industry}).`,
    "They are attached in order: the first attachment is image 1, the next image 2, and so on.",
    "Look at each photo and describe literally what is visible, so it can be placed in the right part of a new website.",
    "",
    KIND_GUIDE,
    "",
    "For every image return:",
    "- description: at most 20 words, concrete (who or what, doing what, where). No marketing language.",
    "- tags: up to 8 lowercase nouns for the main subjects",
    `- kind: one of ${KIND_LIST}`,
    '- quality: "poor" if blurry, tiny, badly cropped, watermarked or mostly text; otherwise "good"',
    "",
    'Return ONLY JSON: {"photos":[{"image":1,"description":"...","tags":["..."],"kind":"...","quality":"good"}]}',
  ].join("\n");

  const parsed = describedSchema.safeParse(await runVision(text, images, timeoutMs));
  if (!parsed.success) throw new Error("Vision reply did not match the photo schema");

  for (const photo of parsed.data.photos) {
    const original = sent[photo.image - 1];
    if (original === undefined) continue;
    const kind = (PHOTO_KINDS as readonly string[]).includes(photo.kind)
      ? (photo.kind as PhotoKind)
      : "other";
    result[original] = {
      description: photo.description.trim().slice(0, 200),
      tags: photo.tags
        .map((t) => t.trim().toLowerCase().slice(0, 40))
        .filter(Boolean)
        .slice(0, 10),
      kind,
      quality: photo.quality === "poor" ? "poor" : "good",
    };
  }
  return result;
}

export type SlotCandidates = {
  intent: SlotIntent;
  candidates: { url: string; description?: string }[];
};

const pickedSchema = z.object({
  slots: z.record(z.union([z.coerce.number().int(), z.null()]).catch(null)),
});

/**
 * Looks at each slot's candidates and returns, per slot, the index of the
 * candidate that fits best, `null` when the model judged none of them usable,
 * or `undefined` when the slot was not answered (or its photos didn't load).
 */
export async function pickPhotosForSlots(
  slots: SlotCandidates[],
  ctx: VisionContext,
  timeoutMs: number
): Promise<(number | null | undefined)[]> {
  const result: (number | null | undefined)[] = slots.map(() => undefined);

  const urls: string[] = [];
  const owner: { slot: number; candidate: number }[] = [];
  for (const [slot, entry] of slots.entries()) {
    for (const [candidate, photo] of entry.candidates.entries()) {
      if (urls.length >= env.images.vision.maxImages) break;
      urls.push(photo.url);
      owner.push({ slot, candidate });
    }
  }
  if (!urls.length) return result;

  const thumbs = await loadThumbnails(urls);
  const images: SDKImage[] = [];
  const imageOwner: { slot: number; candidate: number }[] = [];
  thumbs.forEach((thumb, index) => {
    if (!thumb) return;
    images.push(thumb);
    imageOwner.push(owner[index]);
  });
  if (!images.length) return result;

  const lines: string[] = [];
  for (const [slot, entry] of slots.entries()) {
    const numbers = imageOwner
      .map((o, i) => (o.slot === slot ? i + 1 : 0))
      .filter((n) => n > 0);
    if (!numbers.length) continue;
    const { role, subject, context, orientation } = entry.intent;
    const about = subject ? `"${subject.slice(0, 120)}"` : "(no specific subject)";
    const detail = context ? ` Context: ${context.slice(0, 160)}` : "";
    lines.push(
      `S${slot + 1}: ${ROLE_BRIEF[role]}, ${orientation}. Must show: ${about}.${detail} Candidates: images ${numbers.join(", ")}.`
    );
  }

  const text = [
    `You are choosing photos for the website of "${ctx.businessName}" (${ctx.industry}).`,
    `${images.length} candidate photos are attached in order: the first attachment is image 1, the next image 2, and so on.`,
    "For each slot below, look at its candidates and choose the one whose content best matches what the slot must show.",
    "",
    "Rules:",
    "- Judge what is actually visible, not what the photo might symbolise.",
    "- A service, product or project slot needs that specific thing, not a generic office or a random person.",
    "- About and testimonial slots need real-looking people or the business's place; product slots need the product.",
    "- Never choose a photo with visible text, logos, watermarks or an obviously different industry.",
    "- Use each image number at most once across all slots.",
    "- If no candidate fits a slot, answer null for it.",
    "",
    "Slots:",
    ...lines,
    "",
    'Return ONLY JSON: {"slots":{"S1":3,"S2":null}} where each number is an image number from that slot\'s candidates.',
  ].join("\n");

  const parsed = pickedSchema.safeParse(await runVision(text, images, timeoutMs));
  if (!parsed.success) throw new Error("Vision reply did not match the slot schema");

  for (const [key, value] of Object.entries(parsed.data.slots)) {
    const slot = Number(key.replace(/^S/i, "")) - 1;
    if (!Number.isInteger(slot) || slot < 0 || slot >= slots.length) continue;
    if (value === null) {
      result[slot] = null;
      continue;
    }
    const pick = imageOwner[value - 1];
    if (pick && pick.slot === slot) result[slot] = pick.candidate;
  }
  return result;
}
