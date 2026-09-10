// Why an AI call failed. The fallback chain treats every failure the same way —
// try the next provider — but the *reasons* need telling apart: a bad model id
// will fail identically forever, an exhausted quota clears on its own, and a
// malformed response says the provider is healthy and the prompt is not.

export type AiFailureKind =
  /** Bad model id, malformed request — cannot succeed until an operator acts. */
  | "configuration"
  /** Missing or rejected credentials — also an operator problem. */
  | "auth"
  /** Provider budget or free tier used up. Clears when the window resets. */
  | "quota"
  /** Too many requests right now. Clears in seconds. */
  | "rate_limit"
  /** The call was still running when we gave up on it. */
  | "timeout"
  /** The provider answered, but not with output we can use. */
  | "invalid_output"
  /** Network or provider-side outage. */
  | "unavailable"
  | "unknown";

/** The marker written when no model answered and the template built the site. */
export const TEMPLATE_FALLBACK = "template_fallback";

export type AiFailure = {
  provider: string;
  model: string;
  kind: AiFailureKind;
  message: string;
  /** Operator-facing context, e.g. the model ids the provider says are valid. */
  detail?: string;
};

/** Kinds that no retry can clear — only a configuration change will. */
export function isPermanent(kind: AiFailureKind): boolean {
  return kind === "configuration" || kind === "auth";
}

/** Kinds where an immediate second attempt at the same provider is wasted. */
export function isRetryPointless(kind: AiFailureKind): boolean {
  return isPermanent(kind) || kind === "quota" || kind === "rate_limit";
}

export const FAILURE_LABEL: Record<AiFailureKind | typeof TEMPLATE_FALLBACK, string> = {
  configuration: "Misconfigured",
  auth: "Credentials rejected",
  quota: "Quota exhausted",
  rate_limit: "Rate limited",
  timeout: "Timed out",
  invalid_output: "Unusable response",
  unavailable: "Provider unavailable",
  unknown: "Unclassified failure",
  [TEMPLATE_FALLBACK]: "Fell back to template",
};

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return String(err);
}

/**
 * The Cursor SDK reports the ids it will accept in the rejection message, so the
 * list is read back out of the error rather than mirrored in this codebase where
 * it would drift out of date.
 */
export function extractValidModels(message: string): string | undefined {
  const match = /valid models?(?:\s+(?:are|include))?\s*[:\-]?\s*([^\n]+)/i.exec(message);
  const list = match?.[1]?.trim().replace(/[.\s]+$/, "");
  return list ? list.slice(0, 500) : undefined;
}

/** Maps a thrown provider error onto a failure kind. */
export function classifyAiFailure(
  err: unknown,
  context: { provider: string; model: string }
): AiFailure {
  const message = messageOf(err).slice(0, 500);
  const name = err instanceof Error ? err.name : "";
  const detail = extractValidModels(message);

  const failure = (kind: AiFailureKind): AiFailure => ({
    ...context,
    kind,
    message,
    detail,
  });

  // Our own guard clauses, before anything reaches a provider.
  if (/is not configured$/.test(message)) return failure("auth");

  if (/timed out after|ETIMEDOUT|deadline[ _]exceeded/i.test(message)) {
    return failure("timeout");
  }

  // A quota message can arrive dressed as a 429, so budget wording wins over
  // the rate-limit class it shares a status code with.
  if (/exceeded your current quota|RESOURCE_EXHAUSTED|\bquota\b|free tier|billing|out of credits/i.test(message)) {
    return failure("quota");
  }

  // The Cursor SDK wraps a failed mkdir of its agent store as ConfigurationError
  // with isRetryable=false. That is a host/sandbox filesystem problem, not a
  // bad model id — treating it as permanent took Cursor out of the chain.
  if (
    /\bENOENT\b|\bEACCES\b|\bEPERM\b|no such file or directory|mkdir ['"]/i.test(
      message
    )
  ) {
    return failure("unavailable");
  }

  // Error classes the Cursor SDK exports. Checked by name so classification
  // does not pull the SDK into every module that handles a failure.
  switch (name) {
    case "ConfigurationError":
    case "IntegrationNotConnectedError":
      return failure("configuration");
    case "AuthenticationError":
      return failure("auth");
    case "RateLimitError":
      return failure("rate_limit");
    case "NetworkError":
    case "AgentBusyError":
      return failure("unavailable");
  }

  if (/invalid model|unknown model|unsupported model|model .{0,40}(not found|not available|is invalid)|valid models/i.test(message)) {
    return failure("configuration");
  }
  if (/\b(401|403)\b|unauthenticated|permission denied|invalid api key|api[_ ]key/i.test(message)) {
    return failure("auth");
  }
  if (/rate limit|too many requests|\b429\b/i.test(message)) {
    return failure("rate_limit");
  }
  if (/blueprint invalid after repair|invalid edit response|empty response|not valid JSON|unexpected token/i.test(message)) {
    return failure("invalid_output");
  }
  if (/\b5\d\d\b|fetch failed|ECONNRESET|ENOTFOUND|socket hang up|service unavailable|network/i.test(message)) {
    return failure("unavailable");
  }

  // The SDK marks its own non-retryable errors; trust that over guessing.
  const retryable = (err as { isRetryable?: unknown } | null)?.isRetryable;
  if (retryable === false) return failure("configuration");

  return failure("unknown");
}
