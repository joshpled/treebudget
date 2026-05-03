"use client";

import { useParams } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { useBudgetStore } from "@/lib/store";
import { formatCurrency, formatMonthDay } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { transactions, accounts } = useBudgetStore();
  const txn = transactions.find((t) => t.id === id);
  const account = txn ? accounts.find((a) => a.id === txn.accountId) : undefined;

  if (!txn) {
    return (
      <>
        <TopBar back={{ href: "/transactions", label: "Activity" }} title="Transaction" />
        <div className="px-4 py-12 text-center text-sm text-muted">
          Transaction not found.
        </div>
      </>
    );
  }

  const positive = txn.amount > 0;

  return (
    <>
      <TopBar back={{ href: "/transactions", label: "Activity" }} title="Detail" />
      <section className="px-4 pb-6 pt-6 text-center">
        <div className="text-[13px] uppercase tracking-wide text-muted">
          {txn.category}
        </div>
        <div
          className={cn(
            "tabular mt-1 text-[44px] font-semibold leading-none",
            positive ? "text-primary" : "text-ink",
          )}
        >
          {formatCurrency(txn.amount, { signed: positive })}
        </div>
        <div className="mt-2 text-[15px] font-medium text-ink">
          {txn.merchant}
        </div>
        <div className="mt-1 text-[13px] text-muted">
          {formatMonthDay(txn.date)} · {account?.name ?? "Account"}
        </div>
      </section>

      <section className="mx-4 rounded-2xl border border-border bg-surface shadow-card">
        <Row label="Account" value={account?.name ?? "—"} />
        <Row label="Category" value={txn.category} />
        <Row label="Date" value={new Date(txn.date).toLocaleString()} />
        {txn.note ? <Row label="Note" value={txn.note} /> : null}
      </section>

      <section className="mx-4 mt-4 rounded-2xl border border-border bg-surface shadow-card">
        <button
          type="button"
          className="block w-full px-4 py-3 text-left text-[14px] font-medium text-ink"
        >
          Recategorize
        </button>
        <div className="border-t border-border" />
        <button
          type="button"
          className="block w-full px-4 py-3 text-left text-[14px] font-medium text-danger"
        >
          Hide from budget
        </button>
      </section>
      <div className="h-8" />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-[14px] font-medium text-ink">{value}</span>
    </div>
  );
}
