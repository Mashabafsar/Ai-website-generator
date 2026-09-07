import { env } from "@/lib/env";
import { withTimeout } from "@/lib/ai/timeout";
import { classifyAiFailure, isPermanent, type AiFailure } from "@/lib/ai/failure";

// Whether a provider is worth calling at all right now, and — for the failures
// only an operator can fix — making sure that answer is impossible to miss.

/**
 * Provider/model pairs taken out of the chain for the life of the process.
 * A rejected credential is keyed on the provider alone, because it dooms every
 * model behind it; a rejected model id only dooms that one id.
 */
const blocked = new Map<string, AiFailure>();

/** Configuration failures already shouted about, keyed by provider:model:kind. */
const announced = new Set<string>();

/**
 * A permanent failure repeats identically on every request, so the offending
 * provider/model is dropped from the chain until the process restarts with fixed
 * configuration. Anything transient stays in — retrying it is the point.
 */
export function noteProviderFailure(failure: AiFailure): void {
  if (!isPermanent(failure.kind)) return;
  const key = failure.kind === "auth" || !failure.model
    ? failure.provider
    : `${failure.provider}:${failure.model}`;
  blocked.set(key, failure);
  announceMisconfiguration(failure);
}

export function providerBlock(provider: string, model?: string): AiFailure | undefined {
  return blocked.get(provider) ?? (model ? blocked.get(`${provider}:${model}`) : undefined);
}

export function listProviderBlocks(): AiFailure[] {
  return [...blocked.values()];
}

/** Test seam: forget everything learned about provider health this process. */
export function resetProviderHealth(): void {
  blocked.clear();
  announced.clear();
  cursorModelCheck = null;
}

/**
 * A misconfigured model id used to cost one silent per-request failure and
 * nothing else. Logged once per distinct problem, at a volume that survives a
 * busy dev log, with whatever the provider said about acceptable values.
 */
export function announceMisconfiguration(failure: AiFailure): void {
  const key = `${failure.provider}:${failure.model}:${failure.kind}`;
  if (announced.has(key)) return;
  announced.add(key);

  const lines = [
    "",
    "==============================================================",
    ` AI PROVIDER MISCONFIGURED — ${failure.provider.toUpperCase()} IS OUT OF THE CHAIN`,
    "==============================================================",
    ` model:    ${failure.model || "(none)"}`,
    ` problem:  ${failure.kind}`,
    ` provider says: ${failure.message}`,
    ...(failure.detail ? [` accepted values: ${failure.detail}`] : []),
    "",
    " Every generation will fall through to the next provider until this is",
    " fixed. Check HEAVY_MODEL_NAME / LIGHT_MODEL_NAME and the API key.",
    "==============================================================",
    "",
  ];
  console.error(lines.join("\n"));
}

function truncateList(values: string[], limit = 300): string {
  const joined = values.join(", ");
  return joined.length <= limit ? joined : `${joined.slice(0, limit).replace(/,[^,]*$/, "")}, …`;
}

type ModelCheck = { ok: true } | { ok: false; failure: AiFailure };

let cursorModelCheck: Promise<ModelCheck> | null = null;

/**
 * Cursor rejects an unlisted model id at agent creation, which the chain would
 * absorb as an ordinary per-request failure. Comparing the configured id against
 * the account's own catalogue first turns that into a named misconfiguration
 * before a customer's generation pays for it. A catalogue lookup that itself
 * fails is not evidence against the model, so the call goes ahead.
 */
export async function checkCursorHeavyModel(): Promise<ModelCheck> {
  cursorModelCheck ??= runCursorModelCheck(env.ai.heavyModel);
  return cursorModelCheck;
}

async function runCursorModelCheck(model: string): Promise<ModelCheck> {
  try {
    const { Cursor } = await import("@cursor/sdk");
    const models = await withTimeout(
      Cursor.models.list({ apiKey: env.ai.cursorApiKey }),
      10_000,
      "Cursor model catalogue"
    );
    if (!models.length) return { ok: true };

    const accepted = new Set(models.flatMap((m) => [m.id, ...(m.aliases ?? [])]));
    if (accepted.has(model)) return { ok: true };

    // Aliases repeat heavily across entries, so only the canonical ids are
    // reported — enough to fix the setting without filling the admin table.
    const canonical = [...new Set(models.map((m) => m.id))];
    const failure: AiFailure = {
      provider: "cursor",
      model,
      kind: "configuration",
      message: `HEAVY_MODEL_NAME "${model}" is not a model this API key can use.`,
      detail: truncateList(canonical),
    };
    noteProviderFailure(failure);
    return { ok: false, failure };
  } catch (err) {
    const failure = classifyAiFailure(err, { provider: "cursor", model });
    // Credentials the catalogue rejects will not work for a generation either.
    if (failure.kind === "auth") {
      noteProviderFailure(failure);
      return { ok: false, failure };
    }
    console.warn(
      `[ai] Could not verify the Cursor model catalogue (${failure.kind}); trying "${model}" anyway.`
    );
    return { ok: true };
  }
}
