"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPlaidClient } from "@/lib/plaid";
import { decryptToken } from "@/lib/crypto";
import { safePlaidError } from "@/lib/plaid/errors";
import { buildDemoBundle } from "@/lib/demo/seed";

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
  redirect("/dashboard");
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

const DEFAULT_ACCOUNTS: Record<
  "bills" | "spending" | "savings",
  { name: string; allocation: number }
> = {
  bills: { name: "Bills", allocation: 0.5 },
  spending: { name: "Spending", allocation: 0.3 },
  savings: { name: "Savings", allocation: 0.2 },
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

  // Reset the three core accounts: default name, zero balance, unlinked,
  // default split.
  for (const kind of ["bills", "spending", "savings"] as const) {
    const { error } = await supabase
      .from("accounts")
      .update({
        name: DEFAULT_ACCOUNTS[kind].name,
        balance: 0,
        plaid_account_id: null,
        bank_link_id: null,
        allocation: DEFAULT_ACCOUNTS[kind].allocation,
      })
      .eq("user_id", user.id)
      .eq("kind", kind);
    if (error) throw error;
  }

  // Restart onboarding. Also clear setup progress + dismissal so a reset
  // means a truly fresh account.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      monthly_income: 6000,
      onboarded_at: null,
      setup_steps: {},
      setup_dismissed_at: null,
    })
    .eq("id", user.id);
  if (profileError) throw profileError;

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

/* ------------------------------------------------------------------ *
 * Transaction edit + delete                                          *
 * ------------------------------------------------------------------ */

const updateTransactionSchema = z.object({
  id: z.string().uuid(),
  merchant: z.string().min(1).max(120),
  category: z.string().min(1).max(40),
  amount: z.number().refine((v) => v !== 0, "Amount must be non-zero"),
  account_id: z.string().uuid(),
  note: z.string().max(500).optional(),
  posted_at: z.string().datetime().optional(),
});

export async function updateTransaction(
  input: z.input<typeof updateTransactionSchema>,
) {
  const parsed = updateTransactionSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: old, error: oldErr } = await supabase
    .from("transactions")
    .select("amount, account_id, split_applied, parent_transaction_id")
    .eq("id", parsed.id)
    .eq("user_id", user.id)
    .single();
  if (oldErr || !old) throw new Error("Transaction not found");
  if (old.split_applied) {
    throw new Error("Undo the split before editing this income.");
  }
  if (old.parent_transaction_id) {
    throw new Error("Can't edit a split-generated transfer directly.");
  }

  // Reverse the old amount on its old account, then apply the new one.
  await adjustAccountBalance(supabase, old.account_id, -Number(old.amount), user.id);
  await adjustAccountBalance(supabase, parsed.account_id, parsed.amount, user.id);

  const { error } = await supabase
    .from("transactions")
    .update({
      merchant: parsed.merchant,
      category: parsed.category,
      amount: parsed.amount,
      account_id: parsed.account_id,
      note: parsed.note ?? null,
      ...(parsed.posted_at ? { posted_at: parsed.posted_at } : {}),
    })
    .eq("id", parsed.id)
    .eq("user_id", user.id);
  if (error) throw error;

  revalidatePath("/", "layout");
}

export async function deleteTransaction(id: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: txn } = await supabase
    .from("transactions")
    .select("amount, account_id, split_applied, parent_transaction_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!txn) throw new Error("Transaction not found");
  if (txn.split_applied) {
    throw new Error("Undo the split before deleting this income.");
  }
  if (txn.parent_transaction_id) {
    throw new Error("Delete by undoing the parent split.");
  }

  await adjustAccountBalance(supabase, txn.account_id, -Number(txn.amount), user.id);
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/", "layout");
}

/* ------------------------------------------------------------------ *
 * Auto-split: tag a positive income transaction → adjust all three   *
 * buckets per the user's allocation. Undo reverses cleanly.          *
 * ------------------------------------------------------------------ */

const splitInputSchema = z.object({ transaction_id: z.string().uuid() });

export async function applyIncomeSplit(input: { transaction_id: string }) {
  const { transaction_id } = splitInputSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: txn, error: txnErr } = await supabase
    .from("transactions")
    .select(
      "id, amount, account_id, merchant, posted_at, split_applied, parent_transaction_id",
    )
    .eq("id", transaction_id)
    .eq("user_id", user.id)
    .single();
  if (txnErr || !txn) throw new Error("Transaction not found");
  if (Number(txn.amount) <= 0) {
    throw new Error("Only positive (income) transactions can be split.");
  }
  if (txn.split_applied) throw new Error("Already split.");
  if (txn.parent_transaction_id) {
    throw new Error("Can't split a split-generated transfer.");
  }

  const { data: accounts, error: accErr } = await supabase
    .from("accounts")
    .select("id, kind, allocation, balance")
    .eq("user_id", user.id)
    .in("kind", ["bills", "spending", "savings"]);
  if (accErr || !accounts || accounts.length !== 3) {
    throw new Error("Core accounts missing.");
  }

  const source = accounts.find((a) => a.id === txn.account_id);
  if (!source) {
    throw new Error("Income must land on one of the three core accounts.");
  }

  const amount = Number(txn.amount);
  // Round each destination's share to cents; let the source absorb residue.
  const dests = accounts.filter((a) => a.id !== source.id);
  const destShares = dests.map((a) => ({
    account: a,
    share: Math.round(amount * Number(a.allocation) * 100) / 100,
  }));
  const totalOutflow =
    Math.round(destShares.reduce((s, d) => s + d.share, 0) * 100) / 100;

  if (totalOutflow <= 0) {
    // Nothing to split — flag and exit.
    await supabase
      .from("transactions")
      .update({ split_applied: true })
      .eq("id", txn.id);
    revalidatePath("/", "layout");
    return;
  }

  // Build transfer rows: one consolidated debit on the source + one credit
  // per destination account.
  const rows: Array<{
    user_id: string;
    account_id: string;
    merchant: string;
    category: string;
    amount: number;
    note: string;
    posted_at: string;
    external_source: string;
    parent_transaction_id: string;
  }> = [
    {
      user_id: user.id,
      account_id: source.id,
      merchant: "Auto-split",
      category: "Transfer",
      amount: -totalOutflow,
      note: `Split of ${txn.merchant}`,
      posted_at: txn.posted_at,
      external_source: "split",
      parent_transaction_id: txn.id,
    },
    ...destShares.map((d) => ({
      user_id: user.id,
      account_id: d.account.id,
      merchant: "Auto-split",
      category: "Transfer",
      amount: d.share,
      note: `From ${txn.merchant}`,
      posted_at: txn.posted_at,
      external_source: "split",
      parent_transaction_id: txn.id,
    })),
  ];

  const { error: insertErr } = await supabase
    .from("transactions")
    .insert(rows);
  if (insertErr) throw insertErr;

  // Adjust balances. Use in-memory map to avoid re-reading per row.
  const balances = new Map(accounts.map((a) => [a.id, Number(a.balance)]));
  for (const r of rows) {
    balances.set(r.account_id, (balances.get(r.account_id) ?? 0) + r.amount);
  }
  for (const [accountId, newBalance] of balances) {
    await supabase
      .from("accounts")
      .update({ balance: Math.round(newBalance * 100) / 100 })
      .eq("id", accountId);
  }

  await supabase
    .from("transactions")
    .update({ split_applied: true })
    .eq("id", txn.id);

  revalidatePath("/", "layout");
}

export async function undoIncomeSplit(input: { transaction_id: string }) {
  const { transaction_id } = splitInputSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: parent } = await supabase
    .from("transactions")
    .select("id, split_applied")
    .eq("id", transaction_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!parent || !parent.split_applied) throw new Error("Not split.");

  const { data: children } = await supabase
    .from("transactions")
    .select("id, account_id, amount")
    .eq("parent_transaction_id", parent.id)
    .eq("user_id", user.id);

  if (children && children.length > 0) {
    // Aggregate balance reversals per account.
    const deltas = new Map<string, number>();
    for (const c of children) {
      deltas.set(
        c.account_id,
        (deltas.get(c.account_id) ?? 0) - Number(c.amount),
      );
    }
    for (const [accountId, delta] of deltas) {
      await adjustAccountBalance(supabase, accountId, delta, user.id);
    }
    await supabase
      .from("transactions")
      .delete()
      .eq("parent_transaction_id", parent.id);
  }

  await supabase
    .from("transactions")
    .update({ split_applied: false })
    .eq("id", parent.id);

  revalidatePath("/", "layout");
}

async function adjustAccountBalance(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  accountId: string,
  delta: number,
  userId: string,
) {
  const { data: account } = await supabase
    .from("accounts")
    .select("balance")
    .eq("id", accountId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!account) return;
  const next = Math.round((Number(account.balance) + delta) * 100) / 100;
  await supabase
    .from("accounts")
    .update({ balance: next })
    .eq("id", accountId)
    .eq("user_id", userId);
}

/**
 * Replace the signed-in user's data with a realistic-looking demo set:
 * ~80 transactions across the three buckets, four bi-weekly paychecks with
 * manual transfers, and a few savings goals. Useful for showing the app
 * off on a fresh account. Like resetAccount, it removes Plaid items and
 * keeps the auth user / login intact.
 */
export async function loadDemoData() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  // Best-effort Plaid unlink — demo accounts shouldn't keep a bank attached.
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
      console.error("loadDemoData itemRemove failed:", safePlaidError(err));
    }
  }

  // Wipe owned rows before seeding.
  await supabase.from("transactions").delete().eq("user_id", user.id);
  await supabase.from("goals").delete().eq("user_id", user.id);
  await supabase.from("bank_links").delete().eq("user_id", user.id);

  // Reset the three core accounts to default names / allocations.
  for (const kind of ["bills", "spending", "savings"] as const) {
    const { error } = await supabase
      .from("accounts")
      .update({
        name: DEFAULT_ACCOUNTS[kind].name,
        balance: 0,
        plaid_account_id: null,
        bank_link_id: null,
        allocation: DEFAULT_ACCOUNTS[kind].allocation,
      })
      .eq("user_id", user.id)
      .eq("kind", kind);
    if (error) throw error;
  }

  // Look up the three account ids now that they're reset.
  const { data: accountRows, error: accountsError } = await supabase
    .from("accounts")
    .select("id, kind")
    .eq("user_id", user.id)
    .in("kind", ["bills", "spending", "savings"]);
  if (accountsError) throw accountsError;
  const byKind = new Map<string, string>(
    (accountRows ?? []).map((a) => [a.kind as string, a.id as string]),
  );
  const billsId = byKind.get("bills");
  const spendingId = byKind.get("spending");
  const savingsId = byKind.get("savings");
  if (!billsId || !spendingId || !savingsId) {
    throw new Error("Core accounts missing — sign up may not have seeded.");
  }

  const { transactions, goals, balances } = buildDemoBundle(user.id, {
    bills: billsId,
    spending: spendingId,
    savings: savingsId,
  });

  // Chunk inserts to keep the request payloads reasonable.
  const CHUNK = 50;
  for (let i = 0; i < transactions.length; i += CHUNK) {
    const { error } = await supabase
      .from("transactions")
      .insert(transactions.slice(i, i + CHUNK));
    if (error) throw error;
  }
  if (goals.length > 0) {
    const { error } = await supabase.from("goals").insert(goals);
    if (error) throw error;
  }

  // Set realistic ending balances.
  for (const [kind, id] of [
    ["bills", billsId],
    ["spending", spendingId],
    ["savings", savingsId],
  ] as const) {
    await supabase
      .from("accounts")
      .update({ balance: balances[kind] })
      .eq("id", id);
  }

  // Mark onboarded so they land on Home (and an income figure to match).
  // Clear setup progress + dismissal too — demo accounts should feel fresh.
  await supabase
    .from("profiles")
    .update({
      monthly_income: 5000,
      onboarded_at: new Date().toISOString(),
      setup_steps: {},
      setup_dismissed_at: null,
    })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
