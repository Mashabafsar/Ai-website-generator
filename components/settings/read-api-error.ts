/** Read `{ error, code }` from a failed JSON response without throwing away the cause. */
export async function readApiError(
  res: Response,
  fallback: string
): Promise<{ message: string; code?: string }> {
  try {
    const data = (await res.json()) as { error?: unknown; code?: unknown };
    const message = typeof data.error === "string" && data.error.trim() ? data.error : fallback;
    const code = typeof data.code === "string" ? data.code : undefined;
    return { message, code };
  } catch (err) {
    console.error("[settings] could not read API error:", err instanceof Error ? err.message : err);
    return { message: fallback };
  }
}
