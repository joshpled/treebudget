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
export type SyncResult = {
  /** Total transactions Plaid returned across all pages. */
  fetched: number;
  /** Transactions skipped because their Plaid account isn't mapped. */
  skippedUnmapped: number;
  /** Rows inserted into our transactions table. */
  added: number;
  modified: number;
  removed: number;
  /** Plaid account ids seen in the data (for diagnostics). */
  plaidAccountIds: string[];
};

export async function syncTransactionsForLink(
  supabase: SupabaseClient,
  userId: string,
  bankLink: {
    id: string;
    plaid_item_id: string;
    access_token_encrypted: string;
    cursor: string | null;
  },
): Promise<SyncResult> {
  const accessToken = decryptToken(bankLink.access_token_encrypted);
  const plaid = getPlaidClient();

  // Decide the starting cursor. A stored cursor is only trustworthy if this
  // link has actually imported transactions before. The very first sync runs
  // moments after the Plaid item is created — before Plaid finishes its
  // initial extraction — and returns an empty page plus a cursor. Resuming
  // forever from that pre-extraction cursor strands the initial batch. So if
  // we have a cursor but no imported transactions yet, sync from scratch.
  let startCursor = bankLink.cursor ?? undefined;
  if (startCursor) {
    const { data: linkAccounts } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", userId)
      .eq("bank_link_id", bankLink.id);
    const accountIds = (linkAccounts ?? []).map((a) => a.id as string);
    let hasExistingTxns = false;
    if (accountIds.length > 0) {
      const { count } = await supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("external_source", "plaid")
        .in("account_id", accountIds);
      hasExistingTxns = (count ?? 0) > 0;
    }
    if (!hasExistingTxns) startCursor = undefined;
  }

  let cursor = startCursor;
  let fetched = 0;
  let skippedUnmapped = 0;
  let added = 0;
  let modified = 0;
  let removed = 0;
  const seenAccountIds = new Set<string>();
  let hasMore = true;
  // Plaid /transactions/sync can return multiple pages — loop until done.
  while (hasMore) {
    const res = await plaid.transactionsSync({
      access_token: accessToken,
      cursor,
      options: { include_personal_finance_category: true },
    });

    for (const t of res.data.added) seenAccountIds.add(t.account_id);

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
      fetched += res.data.added.length;
      const rows = res.data.added
        .map((t) => {
          const account_id = accountMap.get(t.account_id);
          if (!account_id) {
            skippedUnmapped += 1;
            return null; // skip txns for unlinked accounts
          }
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

  // Persist the cursor only when this sync actually saw data. A link that
  // synced while Plaid was still extracting must not lock in that empty
  // cursor — leaving it null lets the next sync re-pull from the beginning.
  const sawData = fetched > 0 || modified > 0 || removed > 0;
  const update: { last_synced_at: string; cursor?: string } = {
    last_synced_at: new Date().toISOString(),
  };
  if (sawData) update.cursor = cursor;
  await supabase.from("bank_links").update(update).eq("id", bankLink.id);

  return {
    fetched,
    skippedUnmapped,
    added,
    modified,
    removed,
    plaidAccountIds: Array.from(seenAccountIds),
  };
}
