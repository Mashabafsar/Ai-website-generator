import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { headBucket } from "@/lib/storage/s3";

export const dynamic = "force-dynamic";

type Check = "ok" | "error" | "disabled";

async function checkDatabase(): Promise<Check> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "ok";
  } catch (err) {
    console.error("[health] database check failed:", err);
    return "error";
  }
}

async function checkStorage(): Promise<Check> {
  if (!env.storage.enabled) return "disabled";
  try {
    await headBucket(env.storage.mediaBucket);
    return "ok";
  } catch (err) {
    console.error("[health] storage check failed:", err);
    return "error";
  }
}

/**
 * Container health check. Only the database decides the status code: images
 * failing to upload is degraded service, not a reason to restart the app.
 */
export async function GET() {
  const [database, storage] = await Promise.all([checkDatabase(), checkStorage()]);
  const ok = database === "ok";
  return NextResponse.json(
    { ok, database, storage },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
