function readEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.local.example).",
    );
  }
  return { url, anonKey };
}

export function getSupabaseEnv() {
  return readEnv();
}

/**
 * The service-role key bypasses Row Level Security entirely. It must only
 * be read in trusted server-to-server contexts (e.g. the Plaid webhook),
 * never sent to the client, and every query must be manually scoped to the
 * correct user_id.
 */
export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set (see .env.local.example).",
    );
  }
  return key;
}
