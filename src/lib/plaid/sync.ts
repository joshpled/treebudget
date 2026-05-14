import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlaidClient } from "@/lib/plaid";
import { decryptToken } from "@/lib/crypto";

type AccountSummary = {
  plaid_account_id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  balance: number;
};

/**
 * Fetch + persist accounts for a bank link. Idempotent.
 * Returns the upserted Plaid account summaries.
 */
export async function refreshAccountsForLink(
  supabase: SupabaseClient,
  userId: string,
  bankLinkId: string,
  encryptedToken: string,
): Promise<AccountSummary[]> {
  const accessToken = decryptToken(encryptedToken);
  const plaid = getPlaidClient();
  const res = await plaid.accountsGet({ access_token: accessToken });

  const summaries: AccountSummary[] = res.data.accounts.map((a) => ({
    plaid_account_id: a.account_id,
    name: a.name,
    official_name: a.official_name ?? null,
    type: a.type,
    subtype: a.subtype ?? null,
    balance: Number(a.balances.current ?? a.balances.available ?? 0),
  }));

  // Update balance for any treebudget account already linked to a Plaid id.
  for (const s of summaries) {
    await supabase
      .from("accounts")
      .update({ balance: s.balance })
      .eq("user_id", userId)
      .eq("plaid_account_id", s.plaid_account_id);
  }

  // Stash a snapshot of the institution accounts for the UI mapping step,
  // keyed by bank link, so the user can pick which Plaid account becomes
  // which treebudget bucket. We don't have a dedicated table for this yet;
  // we'll fetch live from Plaid when the UI needs the list.

  return summaries;
}

/**
 * Pull transactions via Plaid /transactions/sync using the stored cursor,
 * upsert into our transactions table (deduped by external_id), and update
 * the cursor on the bank link.
 */
export async function syncTransactionsForLink(
  supabase: SupabaseClient,
  userId: string,
  bankLink: {
    id: string;
    plaid_item_id: string;
    access_token_encrypted: string;
    cursor: string | null;
  },
): Promise<{ added: number; modified: number; removed: number }> {
  const accessToken = decryptToken(bankLink.access_token_encrypted);
  const plaid = getPlaidClient();

  let cursor = bankLink.cursor ?? undefined;
  let added = 0;
  let modified = 0;
  let removed = 0;
  let hasMore = true;
  // Plaid /transactions/sync can return multiple pages — loop until done.
  while (hasMore) {
    const res = await plaid.transactionsSync({
      access_token: accessToken,
      cursor,
      options: { include_personal_finance_category: true },
    });

    // Map plaid account_id -> our treebudget account_id (for users who
    // mapped their bank accounts to budget buckets).
    const plaidIdsThisPage = Array.from(
      new Set([
        ...res.data.added.map((t) => t.account_id),
        ...res.data.modified.map((t) => t.account_id),
      ]),
    );

    let accountMap = new Map<string, string>();
    if (plaidIdsThisPage.length > 0) {
      const { data: linked } = await supabase
        .from("accounts")
        .select("id, plaid_account_id")
        .eq("user_id", userId)
        .in("plaid_account_id", plaidIdsThisPage);
      if (linked) {
        accountMap = new Map(
          linked
            .filter((r) => r.plaid_account_id)
            .map((r) => [r.plaid_account_id as string, r.id as string]),
        );
      }
    }

    if (res.data.added.length > 0) {
      const rows = res.data.added
        .map((t) => {
          const account_id = accountMap.get(t.account_id);
          if (!account_id) return null; // skip txns for unlinked accounts
          // Plaid amount: positive = money OUT. Negate for our convention
          // (positive = inbound, negative = spend).
          const amount = -Number(t.amount);
          const category =
            t.personal_finance_category?.primary
              ?.replace(/_/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase()) ??
            t.category?.[0] ??
            "Other";
          return {
            user_id: userId,
            account_id,
            merchant: t.merchant_name ?? t.name ?? "Unknown",
            category,
            amount,
            note: null,
            posted_at: new Date(t.date).toISOString(),
            external_source: "plaid",
            external_id: t.transaction_id,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      if (rows.length > 0) {
        const { error: insertError } = await supabase
          .from("transactions")
          .upsert(rows, {
            onConflict: "external_source,external_id",
            ignoreDuplicates: true,
          });
        if (insertError) throw insertError;
        added += rows.length;
      }
    }

    if (res.data.modified.length > 0) {
      modified += res.data.modified.length;
      // For MVP we ignore modifications. Could later: re-upsert with
      // updated fields. Plaid frequently updates merchant + categorization.
    }

    if (res.data.removed.length > 0) {
      const ids = res.data.removed.map((r) => r.transaction_id);
      const { error: deleteError } = await supabase
        .from("transactions")
        .delete()
        .eq("external_source", "plaid")
        .in("external_id", ids);
      if (deleteError) throw deleteError;
      removed += ids.length;
    }

    cursor = res.data.next_cursor;
    hasMore = res.data.has_more;
  }

  await supabase
    .from("bank_links")
    .update({ cursor, last_synced_at: new Date().toISOString() })
    .eq("id", bankLink.id);

  return { added, modified, removed };
}
