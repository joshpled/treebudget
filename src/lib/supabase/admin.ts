import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv, getSupabaseServiceRoleKey } from "./env";

/**
 * Service-role Supabase client. Bypasses Row Level Security — use ONLY in
 * trusted server-to-server code (the Plaid webhook), and always scope every
 * query/write by the correct user_id explicitly, since RLS will not.
 *
 * Never import this from a Client Component or anything that ships to the
 * browser.
 */
export function createSupabaseAdminClient() {
  const { url } = getSupabaseEnv();
  const serviceKey = getSupabaseServiceRoleKey();
  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
