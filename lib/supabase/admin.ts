import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let adminClient: SupabaseClient | null = null;

function assertSupabaseEnv(): void {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY."
    );
  }
}

/**
 * Server-side Supabase client for Storage admin operations.
 * Never import this into client components.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  assertSupabaseEnv();
  if (adminClient) return adminClient;

  adminClient = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}
