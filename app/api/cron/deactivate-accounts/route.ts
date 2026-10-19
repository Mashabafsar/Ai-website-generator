import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { deactivateEligibleAccounts } from "@/lib/accounts/deactivation";

export const dynamic = "force-dynamic";

/**
 * Daily lockout of accounts older than 14 days that never bought a website
 * package or a credit pack. Website buyers, credit buyers, and admins are safe.
 */
async function run(req: Request) {
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
    const result = await deactivateEligibleAccounts();
    return NextResponse.json({ ok: true, ...result, accounts: undefined, count: result.deactivated });
  } catch (err) {
    console.error("[accounts] deactivation cron failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Deactivation failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}
