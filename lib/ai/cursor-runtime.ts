import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AgentOptions, LocalAgentStore, RunResult } from "@cursor/sdk";

/**
 * Isolated working directory for Cursor SDK local runs. The product only needs
 * a JSON reply from the model; it must not treat this Next.js repo as the
 * agent's workspace (file tools, settings, git).
 */
const SCRATCH = path.join(tmpdir(), "website-builder-cursor");
const STORE_DIR = path.join(SCRATCH, "agent-store");

let store: LocalAgentStore | undefined;
let announced = false;

function ensureDirs(): void {
  mkdirSync(SCRATCH, { recursive: true });
  mkdirSync(STORE_DIR, { recursive: true });
}

/**
 * Options for `Agent.prompt`.
 *
 * The SDK's default persistence is SQLite under
 * `~/.cursor/projects/<cwd-slug>/sdk-agent-store`. On this host that resolved
 * to `/home/sbx_user1051/...` and `mkdir` failed with ENOENT, so every
 * generation fell through to Gemini. A file-backed JSONL store on a directory
 * we create ourselves skips that path entirely. Sandbox stays off so the
 * executor does not remap cwd into a Linux jail we cannot write.
 */
export async function cursorPromptOptions(apiKey: string, model: string): Promise<AgentOptions> {
  const { JsonlLocalAgentStore, Cursor, getDefaultSdkStateRoot } = await import("@cursor/sdk");
  ensureDirs();

  try {
    mkdirSync(getDefaultSdkStateRoot(SCRATCH), { recursive: true });
  } catch (err) {
    console.warn("[ai] Could not pre-create Cursor SDK state root:", err);
  }

  // Always pin this — a leftover sandbox path in the process env would
  // otherwise win and send mkdir back under /home/sbx_user1051.
  process.env.CURSOR_AGENT_STORE_FILES_DIR = STORE_DIR;

  store ??= new JsonlLocalAgentStore(STORE_DIR);
  Cursor.configure({ local: { store } });

  if (!announced) {
    announced = true;
    console.log(
      `[ai] Cursor local runtime ready (cwd=${SCRATCH}, store=${STORE_DIR}, sandbox=off)`
    );
  }

  return {
    apiKey,
    model: { id: model },
    local: {
      cwd: SCRATCH,
      store,
      settingSources: [],
      sandboxOptions: { enabled: false },
    },
  };
}

/** One-shot Cursor run using the shared local runtime. */
export async function runCursorPrompt(
  apiKey: string,
  model: string,
  prompt: string
): Promise<RunResult> {
  const { Agent } = await import("@cursor/sdk");
  return Agent.prompt(prompt, await cursorPromptOptions(apiKey, model));
}
