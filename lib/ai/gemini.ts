import { env } from "@/lib/env";
import { estimateTokens, recordUsage } from "@/lib/ai/usage";

type GeminiPart = { text?: string };
type GeminiCandidate = { content?: { parts?: GeminiPart[] } };
type GeminiUsage = {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
};
type GeminiResponse = {
  candidates?: GeminiCandidate[];
  usageMetadata?: GeminiUsage;
  error?: { message?: string; status?: string };
};

async function callGemini(prompt: string, model: string, jsonMode: boolean): Promise<string> {
  const apiKey = env.ai.geminiApiKey;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const generationConfig: Record<string, unknown> = { temperature: 0.4 };
  if (jsonMode) generationConfig.responseMimeType = "application/json";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    }),
  });

  const data = (await res.json()) as GeminiResponse;
  if (!res.ok) {
    throw new Error(data.error?.message || `Gemini request failed (${res.status})`);
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!text) throw new Error("Gemini returned an empty response");

  const usage = data.usageMetadata;
  if (usage && (usage.promptTokenCount || usage.candidatesTokenCount || usage.totalTokenCount)) {
    const promptTokens = usage.promptTokenCount ?? 0;
    const completionTokens = usage.candidatesTokenCount ?? 0;
    recordUsage({
      provider: "gemini",
      model,
      promptTokens,
      completionTokens,
      totalTokens: usage.totalTokenCount ?? promptTokens + completionTokens,
      estimated: false,
    });
  } else {
    // Some models/keys omit usageMetadata — fall back to a length estimate.
    const promptTokens = estimateTokens(prompt);
    const completionTokens = estimateTokens(text);
    recordUsage({
      provider: "gemini",
      model,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      estimated: true,
    });
  }

  return text;
}

/**
 * Call Gemini generateContent via the public REST API. Prefers JSON mode, then
 * retries without it if the model rejects responseMimeType.
 */
export async function runGeminiPrompt(prompt: string, model = env.ai.geminiModel): Promise<string> {
  try {
    return await callGemini(prompt, model, true);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Some models/keys reject responseMimeType — retry as plain text.
    if (/mime|json|unsupported|invalid/i.test(msg)) {
      return callGemini(prompt, model, false);
    }
    throw err;
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(env.ai.geminiApiKey);
}
