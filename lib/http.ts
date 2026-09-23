import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export type ApiError = { error: string; code?: string; details?: unknown };

export function jsonError(message: string, status = 400, code?: string, details?: unknown) {
  return NextResponse.json<ApiError>({ error: message, code, details }, { status });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** Returns the authenticated user, or a 401 response to short-circuit. */
export async function requireUser() {
  const session = await getCurrentSession();
  if (!session?.user) {
    return { user: null, response: jsonError("Please log in to continue.", 401, "UNAUTHORIZED") };
  }
  return { user: session.user, response: null };
}

/** Safe JSON body parse. */
export async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
