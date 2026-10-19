import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { runCrmOutbox } from "@/lib/crm/sync";

// The queue must be read at request time, never prerendered or cached.
export const dynamic = "force-dynamic";

/**
 * Scheduled drain of the HubSpot outbox. This is the durable path: the nudge
 * after each request handles the happy case, and this catches everything that
 * was queued while HubSpot was down.
 *
 * Requires `CRON_SECRET`, sent either as a bearer token (the cron container
 * does this) or as `?key=`. Without the secret configured the route is off,
 * so a misconfigured deploy can't expose an unauthenticated worker trigger.
 */
async function drain(req: Request) {
  if (!env.cron.secret) {
    return NextResponse.json({ error: "Cron is not configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const presented =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? url.searchParams.get("key");
  if (presented !== env.cron.secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runCrmOutbox(50);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[crm] cron drain failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Drain failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return drain(req);
}

export async function POST(req: Request) {
  return drain(req);
}
