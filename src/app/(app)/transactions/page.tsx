import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { TransactionRow } from "@/components/TransactionRow";
import { AddTransactionLauncher } from "@/components/transactions/AddTransactionLauncher";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { listAccounts } from "@/lib/db/accounts";
import { listTransactions } from "@/lib/db/transactions";
import { getCurrentProfile } from "@/lib/db/profile";
import { FREE_TRANSACTION_LIMIT } from "@/lib/tier";
import type { Transaction } from "@/lib/types";
import { TransactionFilterChips } from "./TransactionFilterChips";

type SearchParams = Promise<{ account?: string }>;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filterId = params.account;

  const [accounts, txns, allTxns, profile] = await Promise.all([
    listAccounts(),
    listTransactions({ accountId: filterId }),
    listTransactions(),
    getCurrentProfile(),
  ]);

  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]));
  const grouped = groupByDay(txns);
  const totalTxnCount = allTxns.length;
  const isFree = profile?.tier === "free";
  const atLimit = isFree && totalTxnCount >= FREE_TRANSACTION_LIMIT;
  const nearLimit = isFree && !atLimit && totalTxnCount >= FREE_TRANSACTION_LIMIT - 5;

  return (
    <>
      <TopBar
        right={
          <>
            <AddTransactionLauncher accounts={accounts} />
            <UserAvatar />
          </>
        }
      />
      <div className="mx-auto w-full max-w-md lg:max-w-5xl lg:px-8">
        <PageHeader
          eyebrow="Activity"
          title="All transactions"
          subtitle={`${txns.length} total`}
        />
        <TransactionFilterChips
          accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
          selectedId={filterId ?? "all"}
        />
        {atLimit ? (
          <div className="mx-4 mb-3 rounded-2xl border border-danger/40 bg-danger/5 px-4 py-3 text-[13px] text-danger lg:mx-0">
            Transaction limit reached ({FREE_TRANSACTION_LIMIT}/{FREE_TRANSACTION_LIMIT}).{" "}
            <Link href="/pricing" className="font-semibold underline">
              Upgrade
            </Link>{" "}
            to add more.
          </div>
        ) : nearLimit ? (
          <div className="mx-4 mb-3 rounded-2xl border border-primary/30 bg-primary-soft/40 px-4 py-3 text-[13px] text-primary-ink lg:mx-0">
            {totalTxnCount}/{FREE_TRANSACTION_LIMIT} transactions used.{" "}
            <Link href="/pricing" className="font-semibold underline">
              Upgrade
            </Link>{" "}
            for unlimited.
          </div>
        ) : null}
        <div className="px-4 pb-6 lg:px-0">
          {grouped.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-transparent p-6 text-center">
              <p className="text-[14px] font-medium text-ink">
                No transactions.
              </p>
              <p className="mt-1 text-[12px] text-muted">
                Tap + to add your first one.
              </p>
            </div>
          ) : (
            grouped.map(([date, items]) => (
              <div key={date} className="mb-4">
                <div className="px-1 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="divide-y divide-border rounded-2xl border border-border bg-surface px-2 shadow-card lg:px-3">
                  {items.map((t) => (
                    <TransactionRow
                      key={t.id}
                      transaction={t}
                      showAccount={accountNameById.get(t.account_id)}
                      href={`/transactions/${t.id}`}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function groupByDay(txns: Transaction[]): Array<[string, Transaction[]]> {
  const buckets = new Map<string, Transaction[]>();
  for (const t of txns) {
    const key = new Date(t.posted_at).toISOString().slice(0, 10);
    const arr = buckets.get(key) ?? [];
    arr.push(t);
    buckets.set(key, arr);
  }
  return Array.from(buckets.entries()).sort((a, b) =>
    a[0] < b[0] ? 1 : -1,
  );
}
