"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { AccountCard } from "@/components/AccountCard";
import { SplitDonut } from "@/components/SplitDonut";
import { TransactionRow } from "@/components/TransactionRow";
import { Sparkline } from "@/components/Sparkline";
import { useBudgetStore } from "@/lib/store";
import { formatCurrency, greeting } from "@/lib/format";

const KIND_COLOR: Record<string, string> = {
  bills: "#5C6B62",
  spending: "#2F7D4F",
  savings: "#C9A227",
};

export default function HomePage() {
  const { user, income, accounts, transactions } = useBudgetStore();

  const total = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalHistory = accounts[0].history.map((_, i) =>
    accounts.reduce((sum, a) => sum + (a.history[i] ?? a.balance), 0),
  );

  const slices = accounts
    .filter((a) => ["bills", "spending", "savings"].includes(a.kind))
    .map((a) => ({
      label: a.name,
      value: a.allocation,
      color: KIND_COLOR[a.kind] ?? "#2F7D4F",
    }));

  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]));
  const recent = transactions.slice(0, 5);

  return (
    <>
      <TopBar
        right={
          <Link
            href="/transactions"
            aria-label="Add transaction"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary-ink"
          >
            <Plus size={18} />
          </Link>
        }
      />
      <section className="px-4 pb-2 pt-5">
        <div className="text-[13px] text-muted">
          {greeting()}, {user.name}.
        </div>
        <div className="mt-1 flex items-end justify-between">
          <div>
            <div className="text-[12px] uppercase tracking-wide text-muted">
              Total balance
            </div>
            <div className="tabular text-[40px] font-semibold leading-none">
              {formatCurrency(total)}
            </div>
          </div>
          <div className="text-primary">
            <Sparkline data={totalHistory} width={120} height={36} fill="currentColor" />
          </div>
        </div>
      </section>

      <section className="space-y-3 px-4 pt-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            monthlyAllocation={income * account.allocation}
            href={`/transactions?account=${account.id}`}
          />
        ))}
      </section>

      <section className="mx-4 mt-6 rounded-2xl border border-border bg-surface p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[12px] uppercase tracking-wide text-muted">
              Income split
            </div>
            <div className="text-[15px] font-semibold">
              Each paycheck of {formatCurrency(income / 2, { showCents: false })}
            </div>
          </div>
          <Link
            href="/settings/split"
            className="text-[13px] font-medium text-primary"
          >
            Edit
          </Link>
        </div>
        <SplitDonut
          slices={slices}
          centerLabel="Monthly income"
          centerValue={formatCurrency(income, { showCents: false })}
        />
      </section>

      <section className="mt-6 px-4">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Recent activity</h2>
          <Link
            href="/transactions"
            className="flex items-center gap-1 text-[13px] font-medium text-primary"
          >
            See all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.map((t) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              showAccount={accountNameById.get(t.accountId)}
              href={`/transactions/${t.id}`}
            />
          ))}
        </div>
      </section>

      <div className="h-8" />
    </>
  );
}
