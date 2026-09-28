import { findImageCandidates, placeholderImage, type ImageCandidate } from "@/lib/images/provider";
import { assignImportedImages } from "@/lib/agents/imported-images";
import { collectImageSlots, setSlotImage, slotImage, type ImageSlot } from "@/lib/agents/image-slots";
import { assignBest, scorePhoto } from "@/lib/images/placement";
import { describePhotos, pickPhotosForSlots, visionAvailable } from "@/lib/ai/vision";
import { env } from "@/lib/env";
import type { ImportedBrandImage } from "@/lib/branding/imported-brand";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";

/** Below this much time before the deadline, photos are placed without vision. */
const VISION_MIN_REMAINING_MS = 30_000;
/** Kept back from the deadline for assembly and saving after images. */
const VISION_RESERVE_MS = 15_000;
const SEARCH_CONCURRENCY = 6;
/** How far a vision pick outranks anything the text descriptions suggest. */
const VISION_PICK_BONUS = 50;

export type SourceImagesOptions = {
  /**
   * Look at the photos with a vision model before placing them, as long as
   * the work can finish before `deadline` (epoch ms). Without it, placement
   * relies on the providers' own descriptions of each photo.
   */
  vision?: { deadline: number };
};

function visionTimeout(deadline: number | undefined): number | null {
  if (!deadline || !visionAvailable()) return null;
  const remaining = deadline - Date.now();
  if (remaining < VISION_MIN_REMAINING_MS) return null;
  return Math.min(env.images.vision.timeoutMs, remaining - VISION_RESERVE_MS);
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      out[index] = await fn(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/** Text-only fit of one stock candidate, plus the search's own relevance signal. */
function candidateScore(candidate: ImageCandidate, slot: ImageSlot): number {
  const { image } = candidate;
  const fit = scorePhoto(
    { description: image.description || "", orientation: slot.intent.orientation },
    slot.intent
  );
  if (!Number.isFinite(fit)) return fit;
  const specificity = (slot.queries.length - candidate.queryRank) * 1.5;
  return fit + specificity - candidate.position * 0.15;
}

/** Fills in a vision description for customer photos that were imported without one. */
async function analyseImported(
  imported: ImportedBrandImage[],
  ctx: { businessName: string; industry: string },
  deadline: number | undefined
): Promise<void> {
  const pending = imported.filter((img) => !img.analysis);
  const timeout = visionTimeout(deadline);
  if (!pending.length || timeout === null) return;
  try {
    const analyses = await describePhotos(pending.map((img) => img.url), ctx, timeout);
    analyses.forEach((analysis, index) => {
      if (analysis) pending[index].analysis = analysis;
    });
  } catch (err) {
    console.warn("[images] customer photo analysis skipped:", err instanceof Error ? err.message : err);
  }
}

/**
 * Image Sourcing Agent — fills every empty image slot with the photo whose
 * content fits it. Customer photos (when present) take the slots they suit
 * first. Each remaining slot gets a pool of stock candidates; they are ranked
 * by what the provider says each photo shows, then, when time allows, a
 * vision model looks at the leading candidates and picks. Placement is global,
 * so no photo appears twice on the site. Mutates and returns the blueprint;
 * `imported` photos gain an `analysis` when one was made.
 */
export async function sourceImages(
  blueprint: WebsiteBlueprint,
  imported: ImportedBrandImage[] = [],
  options: SourceImagesOptions = {}
): Promise<WebsiteBlueprint> {
  const ctx = { businessName: blueprint.business.name, industry: blueprint.business.industry };
  const deadline = options.vision?.deadline;

  if (imported.length) {
    await analyseImported(imported, ctx, deadline);
    assignImportedImages(blueprint, imported);
  }

  const slots = collectImageSlots(blueprint);
  const empty = slots.filter((slot) => !slotImage(slot));
  if (!empty.length) return blueprint;

  const pools = await mapLimit(empty, SEARCH_CONCURRENCY, (slot) =>
    findImageCandidates({
      queries: slot.queries,
      orientation: slot.intent.orientation,
      altText: slot.altText,
    })
  );

  const scores = pools.map((pool, s) => pool.map((c) => candidateScore(c, empty[s])));

  const timeout = visionTimeout(deadline);
  let usedVision = false;
  if (timeout !== null) {
    const perSlot = Math.max(2, Math.min(3, Math.floor(env.images.vision.maxImages / empty.length)));
    const shortlist = pools.map((pool, s) =>
      pool
        .map((candidate, index) => ({ candidate, index, score: scores[s][index] }))
        .filter((entry) => Number.isFinite(entry.score))
        .sort((a, b) => b.score - a.score)
        .slice(0, perSlot)
    );
    try {
      const picks = await pickPhotosForSlots(
        shortlist.map((entries, s) => ({
          intent: empty[s].intent,
          candidates: entries.map((e) => ({
            url: e.candidate.image.url,
            description: e.candidate.image.description,
          })),
        })),
        ctx,
        timeout
      );
      picks.forEach((pick, s) => {
        if (typeof pick !== "number") return;
        const chosen = shortlist[s][pick];
        if (chosen) scores[s][chosen.index] += VISION_PICK_BONUS;
      });
      usedVision = picks.some((pick) => pick !== undefined);
    } catch (err) {
      console.warn("[images] vision placement skipped:", err instanceof Error ? err.message : err);
    }
  }

  // One candidate list across the site so a photo can only land once.
  const onPage = new Set(slots.map((slot) => slotImage(slot)?.url).filter(Boolean) as string[]);
  const urls: string[] = [];
  const byUrl = new Map<string, number>();
  for (const pool of pools) {
    for (const { image } of pool) {
      if (onPage.has(image.url) || byUrl.has(image.url)) continue;
      byUrl.set(image.url, urls.length);
      urls.push(image.url);
    }
  }
  const scoreOf = empty.map((_, s) => {
    const map = new Map<number, number>();
    pools[s].forEach((c, i) => {
      const u = byUrl.get(c.image.url);
      if (u !== undefined) map.set(u, scores[s][i]);
    });
    return map;
  });

  const placed = assignBest({
    slotCount: empty.length,
    photoCount: urls.length,
    score: (s, p) => scoreOf[s].get(p) ?? Number.NEGATIVE_INFINITY,
    minScore: Number.MIN_SAFE_INTEGER,
    priority: (s) => empty[s].priority,
  });

  const filled = new Set<number>();
  for (const { slot, photo } of placed) {
    const url = urls[photo];
    const candidate = pools[slot].find((c) => c.image.url === url);
    if (!candidate) continue;
    setSlotImage(empty[slot], candidate.image);
    filled.add(slot);
  }

  for (const [s, slot] of empty.entries()) {
    if (filled.has(s)) continue;
    setSlotImage(
      slot,
      placeholderImage({
        keywords: slot.queries[0] ?? [],
        orientation: slot.intent.orientation,
        altText: slot.altText,
      })
    );
  }

  console.log(
    `[images] placed ${filled.size}/${empty.length} stock photos${usedVision ? " with vision review" : ""}`
  );
  return blueprint;
}
