import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Account } from "./types";

export async function listAccounts(): Promise<Account[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("archived", false)
    .order("position", { ascending: true });
  if (error) {
    console.error("listAccounts error", error);
    return [];
  }
  return (data ?? []) as Account[];
}

export async function getAccount(id: string): Promise<Account | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getAccount error", error);
    return null;
  }
  return (data as Account | null) ?? null;
}
