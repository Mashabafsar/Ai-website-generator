import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Run, RunResult, SDKAgent, SDKUserMessage } from "@cursor/sdk";
import { withTimeout } from "@/lib/ai/timeout";

/**
 * Isolated working directory for Cursor SDK local runs. The product only needs
 * a JSON reply from the model; it must not treat this Next.js repo as the
 * agent's workspace (file tools, settings, git).
 */
const SCRATCH = path.join(tmpdir(), "website-builder-cursor");

let announced = false;

function ensureScratch(): void {
  mkdirSync(SCRATCH, { recursive: true });
}

function runErrorMessage(result: RunResult): string {
  const err = result.error;
  if (err && typeof err.message === "string" && err.message.trim()) return err.message;
  return "";
}

/** Pull the assistant text out of a finished run, or throw with a useful reason. */
export function cursorReplyText(result: RunResult): string {
  if (result.status === "error" || result.status === "cancelled") {
    const extra = runErrorMessage(result);
    const status = result.status === "cancelled" ? "cancelled" : "failed";
    throw new Error(extra ? `Cursor agent run ${status}: ${extra}` : `Cursor agent run ${status}`);
  }
  const raw = result.result;
  if (typeof raw === "string" && raw.trim()) return raw;
  if (raw && typeof raw === "object") {
    const encoded = JSON.stringify(raw);
    if (encoded && encoded !== "{}") return encoded;
  }
  throw new Error("Cursor returned an empty response");
}

/**
 * One Cursor turn in its own cwd + JSONL store.
 *
 * Sharing a single cwd/store made overlapping plan/import/generate calls hit
 * AgentBusyError, which looked like Cursor "not responding." Timing out
 * `Agent.prompt` with Promise.race also left that run wedged. Each call now
 * gets a fresh agent, waits up to `timeoutMs`, and cancels on the way out.
 */
async function runCursorOnce(
  apiKey: string,
  model: string,
  prompt: string | SDKUserMessage,
  timeoutMs: number
): Promise<RunResult> {
  const { Agent, JsonlLocalAgentStore, Cursor, getDefaultSdkStateRoot } = await import(
    "@cursor/sdk"
  );
  ensureScratch();

  try {
    mkdirSync(getDefaultSdkStateRoot(SCRATCH), { recursive: true });
  } catch (err) {
    console.warn("[ai] Could not pre-create Cursor SDK state root:", err);
  }

  const runCwd = path.join(SCRATCH, `run-${randomUUID()}`);
  const storeDir = path.join(runCwd, "store");
  mkdirSync(storeDir, { recursive: true });
  process.env.CURSOR_AGENT_STORE_FILES_DIR = storeDir;

  const store = new JsonlLocalAgentStore(storeDir);
  Cursor.configure({ local: { store } });

  if (!announced) {
    announced = true;
    console.log(`[ai] Cursor local runtime ready (scratch=${SCRATCH}, sandbox=off)`);
  }

  const agent: SDKAgent = await Agent.create({
    apiKey,
    model: { id: model },
    local: {
      cwd: runCwd,
      store,
      settingSources: [],
      sandboxOptions: { enabled: false },
      enableAgentRetries: true,
    },
  });

  let run: Run | undefined;
  try {
    try {
      run = await agent.send(prompt);
    } catch (err) {
      const busy =
        err instanceof Error &&
        (err.name === "AgentBusyError" || /agent is busy|already running/i.test(err.message));
      if (!busy) throw err;
      console.warn("[ai] Cursor agent was busy; forcing a fresh run.");
      run = await agent.send(prompt, { local: { force: true } });
    }

    return await withTimeout(run.wait(), timeoutMs, "Cursor");
  } catch (err) {
    if (run?.supports("cancel")) {
      await run.cancel().catch(() => undefined);
    }
    throw err;
  } finally {
    await agent[Symbol.asyncDispose]().catch(() => undefined);
    try {
      rmSync(runCwd, { recursive: true, force: true });
    } catch {
      // Windows can hold the JSONL store open briefly after dispose.
    }
  }
}

/**
 * One-shot Cursor run. Waits up to `timeoutMs`, retries once on an empty
 * reply (not on timeout), then throws so the caller can fall back.
 */
export async function runCursorPrompt(
  apiKey: string,
  model: string,
  prompt: string,
  timeoutMs = 600_000
): Promise<RunResult> {
  return runCursorOnce(apiKey, model, prompt, timeoutMs);
}

export async function runCursorText(
  apiKey: string,
  model: string,
  prompt: string | SDKUserMessage,
  timeoutMs: number
): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return cursorReplyText(await runCursorOnce(apiKey, model, prompt, timeoutMs));
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      const empty = /empty response/i.test(message);
      if (!empty || attempt === 2) throw err;
      console.warn("[ai] Cursor returned no text; retrying once.");
    }
  }
  throw lastError;
}
