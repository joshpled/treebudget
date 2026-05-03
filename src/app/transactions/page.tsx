"use client";

import { useMemo, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { TransactionRow } from "@/components/TransactionRow";
import { useBudgetStore } from "@/lib/store";
import { cn } from "@/lib/cn";

function TransactionsList() {
  const search = useSearchParams();
  const initial = search?.get("account") ?? "all";
  const [filter, setFilter] = useState<string>(initial);
  const { accounts, transactions } = useBudgetStore();

  const filters = useMemo(
    () => [
      { id: "all", label: "All" },
      ...accounts.map((a) => ({ id: a.id, label: a.name })),
    ],
    [accounts],
  );

  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]));
  const filtered =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.accountId === filter);

  const grouped = useMemo(() => {
    const buckets = new Map<string, typeof transactions>();
    for (const t of filtered) {
      const key = new Date(t.date).toISOString().slice(0, 10);
      const arr = buckets.get(key) ?? [];
      arr.push(t);
      buckets.set(key, arr);
    }
    return Array.from(buckets.entries()).sort((a, b) =>
      a[0] < b[0] ? 1 : -1,
    );
  }, [filtered]);

  return (
    <>
      <TopBar />
      <PageHeader
        eyebrow="Activity"
        title="All transactions"
        subtitle={`${filtered.length} this month`}
      />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
        {filters.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-ink",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <div className="px-4 pb-6">
        {grouped.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            No transactions yet.
          </p>
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
                    showAccount={accountNameById.get(t.accountId)}
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

export default function TransactionsPage() {
  return (
    <Suspense fallback={null}>
      <TransactionsList />
    </Suspense>
  );
}
