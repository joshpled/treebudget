import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { TransactionRow } from "@/components/TransactionRow";
import { AddTransactionLauncher } from "@/components/transactions/AddTransactionLauncher";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { listAccounts } from "@/lib/db/accounts";
import { listTransactions } from "@/lib/db/transactions";
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

  const [accounts, txns] = await Promise.all([
    listAccounts(),
    listTransactions({ accountId: filterId }),
  ]);

  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]));
  const grouped = groupByDay(txns);

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
      <PageHeader
        eyebrow="Activity"
        title="All transactions"
        subtitle={`${txns.length} total`}
      />
      <TransactionFilterChips
        accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
        selectedId={filterId ?? "all"}
      />
      <div className="px-4 pb-6">
        {grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-transparent p-6 text-center">
            <p className="text-[14px] font-medium text-ink">No transactions.</p>
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
              <div className="divide-y divide-border rounded-2xl border border-border bg-surface px-2 shadow-card">
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
