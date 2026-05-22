"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPlaidClient } from "@/lib/plaid";
import { decryptToken } from "@/lib/crypto";
import { safePlaidError } from "@/lib/plaid/errors";

const splitSchema = z
  .object({
    income: z.number().min(0).max(1_000_000),
    bills: z.number().int().min(0).max(100),
    spending: z.number().int().min(0).max(100),
    savings: z.number().int().min(0).max(100),
  })
  .refine((v) => v.bills + v.spending + v.savings === 100, {
    message: "Allocations must total 100%",
  });

export type SaveSplitInput = z.input<typeof splitSchema>;

export async function saveIncomeAndSplit(input: SaveSplitInput) {
  const parsed = splitSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ monthly_income: parsed.income })
    .eq("id", user.id);
  if (profileError) throw profileError;

  const updates: Array<{ kind: "bills" | "spending" | "savings"; allocation: number }> =
    [
      { kind: "bills", allocation: parsed.bills / 100 },
      { kind: "spending", allocation: parsed.spending / 100 },
      { kind: "savings", allocation: parsed.savings / 100 },
    ];

  for (const u of updates) {
    const { error } = await supabase
      .from("accounts")
      .update({ allocation: u.allocation })
      .eq("user_id", user.id)
      .eq("kind", u.kind);
    if (error) throw error;
  }

  revalidatePath("/", "layout");
}

export async function completeOnboarding(input: SaveSplitInput) {
  await saveIncomeAndSplit(input);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw error;
  revalidatePath("/", "layout");
  redirect("/");
}

const transactionSchema = z.object({
  account_id: z.string().uuid(),
  merchant: z.string().min(1).max(120),
  category: z.string().min(1).max(40),
  amount: z.number().refine((v) => v !== 0, "Amount must be non-zero"),
  posted_at: z.string().datetime().optional(),
  note: z.string().max(500).optional(),
});

export type AddTransactionInput = z.input<typeof transactionSchema>;

export async function addTransaction(input: AddTransactionInput) {
  const parsed = transactionSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const postedAt = parsed.posted_at ?? new Date().toISOString();

  const { error: insertError } = await supabase.from("transactions").insert({
    user_id: user.id,
    account_id: parsed.account_id,
    merchant: parsed.merchant,
    category: parsed.category,
    amount: parsed.amount,
    note: parsed.note ?? null,
    posted_at: postedAt,
    external_source: "manual",
  });
  if (insertError) throw insertError;

  // Apply the amount to the account balance.
  const { data: account, error: accErr } = await supabase
    .from("accounts")
    .select("balance")
    .eq("id", parsed.account_id)
    .single();
  if (accErr) throw accErr;

  const newBalance =
    Math.round((Number(account.balance) + parsed.amount) * 100) / 100;
  const { error: updErr } = await supabase
    .from("accounts")
    .update({ balance: newBalance })
    .eq("id", parsed.account_id);
  if (updErr) throw updErr;

  revalidatePath("/", "layout");
}

const DEFAULT_ALLOCATION: Record<"bills" | "spending" | "savings", number> = {
  bills: 0.5,
  spending: 0.3,
  savings: 0.2,
};

/**
 * Wipe the signed-in user's data back to a fresh state: removes Plaid items,
 * deletes all transactions / goals / bank links, zeroes the three core
 * accounts and unlinks them, and restarts onboarding. The auth user and
 * login session are kept. Every operation is scoped to the user's own rows.
 */
export async function resetAccount() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  // Best-effort: tell Plaid to release each linked item so we stop being
  // billed / counted for it. Local cleanup proceeds regardless.
  const { data: links } = await supabase
    .from("bank_links")
    .select("access_token_encrypted")
    .eq("user_id", user.id);
  for (const link of links ?? []) {
    try {
      const plaid = getPlaidClient();
      await plaid.itemRemove({
        access_token: decryptToken(link.access_token_encrypted),
      });
    } catch (err) {
      console.error("resetAccount itemRemove failed:", safePlaidError(err));
    }
  }

  // Delete owned rows. RLS also scopes these, but the explicit filter keeps
  // intent obvious.
  await supabase.from("transactions").delete().eq("user_id", user.id);
  await supabase.from("goals").delete().eq("user_id", user.id);
  await supabase.from("bank_links").delete().eq("user_id", user.id);

  // Reset the three core accounts: zero balance, unlinked, default split.
  for (const kind of ["bills", "spending", "savings"] as const) {
    const { error } = await supabase
      .from("accounts")
      .update({
        balance: 0,
        plaid_account_id: null,
        bank_link_id: null,
        allocation: DEFAULT_ALLOCATION[kind],
      })
      .eq("user_id", user.id)
      .eq("kind", kind);
    if (error) throw error;
  }

  // Restart onboarding.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ monthly_income: 6000, onboarded_at: null })
    .eq("id", user.id);
  if (profileError) throw profileError;

  revalidatePath("/", "layout");
  redirect("/onboarding");
}
