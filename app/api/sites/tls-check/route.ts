import { NextResponse } from "next/server";
import { DeploymentStatus } from "@/lib/constants";
import { subdomainFromHost } from "@/lib/deployment/s3-sites";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Caddy on-demand TLS ask endpoint.
 * GET /api/sites/tls-check?domain=<host>
 * 200 only when that host is `<subdomain>.<PLATFORM_DOMAIN>` and the subdomain
 * has a Deployment with a release, or status DEPLOYED. 403 for every other host.
 * No shared secret: Caddy calls this on the internal network, and the answer
 * is limited to our platform suffix.
 */
export async function GET(request: Request) {
  const domain = new URL(request.url).searchParams.get("domain");
  const subdomain = subdomainFromHost(domain);
  if (!subdomain) return denied();

  try {
    const row = await prisma.deployment.findFirst({
      where: { subdomain },
      orderBy: { updatedAt: "desc" },
      select: { release: true, status: true },
    });
    if (!row) return denied();
    if (row.release?.trim() || row.status === DeploymentStatus.DEPLOYED) return allowed();
    return denied();
  } catch (err) {
    console.error("[tls-check] lookup failed:", err);
    return denied();
  }
}

function allowed() {
  return new NextResponse(null, { status: 200, headers: { "Cache-Control": "no-store" } });
}

function denied() {
  return new NextResponse(null, { status: 403, headers: { "Cache-Control": "no-store" } });
}
