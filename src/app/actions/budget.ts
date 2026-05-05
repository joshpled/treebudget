"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
