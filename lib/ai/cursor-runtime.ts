import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AgentOptions } from "@cursor/sdk";

/**
 * Isolated working directory for Cursor SDK local runs. The product only needs
 * a JSON reply from the model; it must not treat this Next.js repo as the
 * agent's workspace (file tools, settings, git).
 */
const SCRATCH = path.join(tmpdir(), "website-builder-cursor");

/**
 * Options for `Agent.prompt`. Local is explicit, sandbox is off.
 *
 * The SDK's default local sandbox remaps cwd to `/var/task` and then fails
 * with `ENOENT` creating
 * `/home/sbx_user1051/.cursor/projects/var-task/sdk-agent-store/...`.
 * That used to be classified as a permanent misconfiguration, which took
 * Cursor out of the generation chain for the rest of the process.
 */
export function cursorPromptOptions(apiKey: string, model: string): AgentOptions {
  mkdirSync(SCRATCH, { recursive: true });
  return {
    apiKey,
    model: { id: model },
    local: {
      cwd: SCRATCH,
      settingSources: [],
      sandboxOptions: { enabled: false },
    },
  };
}
