import { env } from "@/lib/env";
import { runGeminiPrompt, isGeminiConfigured } from "@/lib/ai/gemini";
import { withTimeout } from "@/lib/ai/timeout";
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
    return buildMockBlueprint(req);
  }

  async reviseSection({ section, instruction }: { section: WebsiteSection; instruction: string }) {
    return deterministicRevise(section, instruction);
  }
}

/** Cursor-SDK-backed provider (primary). Throws on failure so the chain can fall through. */
export class CursorAiProvider implements AiProvider {
  readonly name = "cursor";

  private async runPrompt(prompt: string, model: string): Promise<string> {
    const { Agent } = await import("@cursor/sdk");
    const result = await Agent.prompt(prompt, {
      apiKey: env.ai.cursorApiKey,
      model: { id: model },
      local: { cwd: process.cwd() },
    });
    if (result.status === "error") {
      throw new Error("Cursor agent run failed");
    }
    return typeof result.result === "string" ? result.result : JSON.stringify(result.result ?? "");
  }

  async generateBlueprint(req: NormalizedRequirements): Promise<WebsiteBlueprint> {
    if (!env.ai.cursorApiKey) throw new Error("CURSOR_API_KEY is not configured");
    return generateBlueprintWithRunner(req, (p, m) => this.runPrompt(p, m), env.ai.heavyModel, "cursor");
  }

  async reviseSection(params: {
    section: WebsiteSection;
    instruction: string;
    brandTone: string;
  }): Promise<SectionContent> {
    if (!env.ai.cursorApiKey) throw new Error("CURSOR_API_KEY is not configured");
    return reviseSectionWithRunner(params, (p, m) => this.runPrompt(p, m), env.ai.lightModel);
  }
}

/** Gemini REST API provider — used when Cursor fails (or when Cursor isn't configured). */
export class GeminiAiProvider implements AiProvider {
  readonly name = "gemini";

  private async runPrompt(prompt: string, _model: string): Promise<string> {
    // Model is controlled by GEMINI_MODEL_NAME; ignore the Cursor model id.
    return runGeminiPrompt(prompt, env.ai.geminiModel);
  }

  async generateBlueprint(req: NormalizedRequirements): Promise<WebsiteBlueprint> {
    if (!isGeminiConfigured()) throw new Error("GEMINI_API_KEY is not configured");
    return generateBlueprintWithRunner(req, (p, m) => this.runPrompt(p, m), env.ai.geminiModel, "gemini");
  }

  async reviseSection(params: {
    section: WebsiteSection;
    instruction: string;
    brandTone: string;
  }): Promise<SectionContent> {
    if (!isGeminiConfigured()) throw new Error("GEMINI_API_KEY is not configured");
    return reviseSectionWithRunner(params, (p, m) => this.runPrompt(p, m), env.ai.geminiModel);
  }
}

/**
 * Fallback chain: Cursor → Gemini → deterministic template.
 * Each step only runs if the previous one throws (or is unavailable).
 */
export class FallbackAiProvider implements AiProvider {
  readonly name = "fallback";
  private cursor = new CursorAiProvider();
  private gemini = new GeminiAiProvider();
  private mock = new MockAiProvider();

  async generateBlueprint(req: NormalizedRequirements): Promise<WebsiteBlueprint> {
    // 1. Cursor (bounded — don't hang forever before Gemini can run)
    if (env.ai.cursorApiKey) {
      try {
        return await withTimeout(
          this.cursor.generateBlueprint(req),
          env.ai.cursorTimeoutMs,
          "Cursor generation"
        );
      } catch (err) {
        console.error("[ai] Cursor generation failed; trying Gemini:", err);
      }
    }

    // 2. Gemini
    if (isGeminiConfigured()) {
      try {
        console.log("[ai] Generating with Gemini…");
        return await this.gemini.generateBlueprint(req);
      } catch (err) {
        console.error("[ai] Gemini generation failed; using template fallback:", err);
      }
    } else if (!env.ai.cursorApiKey) {
      console.warn("[ai] No Cursor or Gemini key configured; using template fallback.");
    }

    // 3. Deterministic template
    console.warn("[ai] Using deterministic template blueprint.");
    return this.mock.generateBlueprint(req);
  }

  async reviseSection(params: {
    section: WebsiteSection;
    instruction: string;
    brandTone: string;
  }): Promise<SectionContent> {
    if (env.ai.cursorApiKey) {
      try {
        return await withTimeout(
          this.cursor.reviseSection(params),
          Math.min(env.ai.cursorTimeoutMs, 20_000),
          "Cursor edit"
        );
      } catch (err) {
        console.error("[ai] Cursor section edit failed; trying Gemini:", err);
      }
    }

    if (isGeminiConfigured()) {
      try {
        return await this.gemini.reviseSection(params);
      } catch (err) {
        console.error("[ai] Gemini section edit failed; using deterministic fallback:", err);
      }
    }

    return this.mock.reviseSection(params);
  }
}

export function getAiProvider(): AiProvider {
  // Explicit mock mode short-circuits the whole chain.
  if (env.ai.useMock) return new MockAiProvider();
  return new FallbackAiProvider();
}
