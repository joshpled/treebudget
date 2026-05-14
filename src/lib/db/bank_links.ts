import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BankLink } from "./types";

export async function listBankLinks(): Promise<BankLink[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bank_links")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listBankLinks error", error);
    return [];
  }
  return (data ?? []) as BankLink[];
}

export async function getBankLinkByItemId(
  itemId: string,
): Promise<BankLink | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bank_links")
    .select("*")
    .eq("plaid_item_id", itemId)
    .maybeSingle();
  if (error) {
    console.error("getBankLinkByItemId error", error);
    return null;
  }
  return (data as BankLink | null) ?? null;
}
