import { env } from "@/lib/env";
import { estimateTokens, recordUsage } from "@/lib/ai/usage";
import { recordAiFailure } from "@/lib/ai/diagnostics";
import { classifyAiFailure, FAILURE_LABEL, type AiFailure } from "@/lib/ai/failure";
import {
  checkCursorHeavyModel,
  noteProviderFailure,
  providerBlock,
} from "@/lib/ai/provider-health";
import { runCursorText } from "@/lib/ai/cursor-runtime";
import {
  type SectionContent,
  buildMockBlueprint,
  deterministicRevise,
  generateBlueprintWithRunner,
  reviseSectionWithRunner,
} from "@/lib/ai/shared";
import type { NormalizedRequirements } from "@/lib/agents/requirement-analyst";
import type { WebsiteBlueprint, WebsiteSection } from "@/lib/blueprint/types";

export type { SectionContent };

export interface AiProvider {
  readonly name: string;
  generateBlueprint(req: NormalizedRequirements): Promise<WebsiteBlueprint>;
  reviseSection(params: {
    section: WebsiteSection;
    instruction: string;
    brandTone: string;
  }): Promise<SectionContent>;
}

/** Deterministic provider used for local demos and as the last-resort fallback. */
export class MockAiProvider implements AiProvider {
  readonly name = "mock";

  async generateBlueprint(req: NormalizedRequirements): Promise<WebsiteBlueprint> {
    const blueprint = buildMockBlueprint(req);
    const out = JSON.stringify(blueprint);
    recordUsage({
      provider: "mock",
      model: "deterministic-template",
      promptTokens: 0,
      completionTokens: estimateTokens(out),
      totalTokens: estimateTokens(out),
      estimated: true,
    });
    return blueprint;
  }

  async reviseSection({ section, instruction }: { section: WebsiteSection; instruction: string }) {
    const content = deterministicRevise(section, instruction);
    const out = JSON.stringify(content);
    recordUsage({
      provider: "mock",
      model: "deterministic-template",
      promptTokens: 0,
      completionTokens: estimateTokens(out),
      totalTokens: estimateTokens(out),
      estimated: true,
    });
    return content;
  }
}

/** Cursor-SDK-backed provider (primary). Throws on failure so the chain can fall through. */
export class CursorAiProvider implements AiProvider {
  readonly name = "cursor";

  private async runPrompt(prompt: string, model: string, timeoutMs: number): Promise<string> {
    const output = await runCursorText(env.ai.cursorApiKey, model, prompt, timeoutMs);

    const promptTokens = estimateTokens(prompt);
    const completionTokens = estimateTokens(output);
    recordUsage({
      provider: "cursor",
      model,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      estimated: true,
    });

    return output;
  }

  async generateBlueprint(req: NormalizedRequirements): Promise<WebsiteBlueprint> {
    if (!env.ai.cursorApiKey) throw new Error("CURSOR_API_KEY is not configured");
    return generateBlueprintWithRunner(
      req,
      (p, m) => this.runPrompt(p, m, env.ai.cursorTimeoutMs),
      env.ai.heavyModel,
      "cursor"
    );
  }

  async reviseSection(params: {
    section: WebsiteSection;
    instruction: string;
    brandTone: string;
  }): Promise<SectionContent> {
    if (!env.ai.cursorApiKey) throw new Error("CURSOR_API_KEY is not configured");
    return reviseSectionWithRunner(
      params,
      (p, m) => this.runPrompt(p, m, env.ai.cursorLightTimeoutMs),
      env.ai.lightModel
    );
  }
}

/**
 * Fallback chain: Cursor → deterministic template.
 * The template step only runs if Cursor throws or is unavailable. Every give-up
 * records a classified failure so the caller can tell an outage from a
 * misconfiguration.
 */
export class FallbackAiProvider implements AiProvider {
  readonly name = "fallback";
  private cursor = new CursorAiProvider();
  private mock = new MockAiProvider();

  /** Classifies and reports one provider's failure, then lets the chain move on. */
  private absorb(err: unknown, provider: string, model: string, next: string): void {
    const failure = classifyAiFailure(err, { provider, model });
    recordAiFailure(failure);
    noteProviderFailure(failure);
    console.error(
      `[ai] ${provider} ${model} failed — ${FAILURE_LABEL[failure.kind]} (${failure.kind}); ${next}: ${failure.message}`
    );
  }

  /**
   * A provider that already failed permanently this process is skipped rather
   * than called again, but the skip is still reported against this request so
   * the reason for a degraded result never goes missing.
   */
  private blockedFailure(provider: string, model: string): AiFailure | undefined {
    const block = providerBlock(provider, model);
    if (block) recordAiFailure(block);
    return block;
  }

  private missingKey(provider: string, variable: string): void {
    recordAiFailure({
      provider,
      model: "",
      kind: "auth",
      message: `${variable} is not configured`,
    });
  }

  async generateBlueprint(req: NormalizedRequirements): Promise<WebsiteBlueprint> {
    if (!env.ai.cursorApiKey) {
      this.missingKey("cursor", "CURSOR_API_KEY");
    } else if (!this.blockedFailure("cursor", env.ai.heavyModel)) {
      const check = await checkCursorHeavyModel();
      if (!check.ok) {
        recordAiFailure(check.failure);
      } else {
        try {
          console.log("[ai] Generating with Cursor…");
          return await this.cursor.generateBlueprint(req);
        } catch (err) {
          this.absorb(err, "cursor", env.ai.heavyModel, "using template fallback");
        }
      }
    }

    console.warn(
      "[ai] No model produced a blueprint — building from the deterministic template. This generation is not billable."
    );
    return this.mock.generateBlueprint(req);
  }

  async reviseSection(params: {
    section: WebsiteSection;
    instruction: string;
    brandTone: string;
  }): Promise<SectionContent> {
    if (!env.ai.cursorApiKey) {
      this.missingKey("cursor", "CURSOR_API_KEY");
    } else if (!this.blockedFailure("cursor", env.ai.lightModel)) {
      try {
        return await this.cursor.reviseSection(params);
      } catch (err) {
        this.absorb(err, "cursor", env.ai.lightModel, "using deterministic fallback");
      }
    }

    console.warn("[ai] No model answered the edit — applying the deterministic rewrite.");
    return this.mock.reviseSection(params);
  }
}

export function getAiProvider(): AiProvider {
  // Explicit mock mode short-circuits the whole chain.
  if (env.ai.useMock) return new MockAiProvider();
  return new FallbackAiProvider();
}
