import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Transaction } from "./types";

export async function listTransactions(opts?: {
  accountId?: string;
  limit?: number;
}): Promise<Transaction[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("transactions")
    .select("*")
    .order("posted_at", { ascending: false });
  if (opts?.accountId) query = query.eq("account_id", opts.accountId);
  if (opts?.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) {
    console.error("listTransactions error", error);
    return [];
  }
  return (data ?? []) as Transaction[];
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getTransaction error", error);
    return null;
  }
  return (data as Transaction | null) ?? null;
}
