import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { AccountCard } from "@/components/AccountCard";
import { SplitDonut } from "@/components/SplitDonut";
import { TransactionRow } from "@/components/TransactionRow";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { AddTransactionLauncher } from "@/components/transactions/AddTransactionLauncher";
import { listAccounts } from "@/lib/db/accounts";
import { listTransactions } from "@/lib/db/transactions";
import { getCurrentProfile } from "@/lib/db/profile";
import { formatCurrency, greeting } from "@/lib/format";

const KIND_COLOR: Record<string, string> = {
  bills: "#5C6B62",
  spending: "#2F7D4F",
  savings: "#C9A227",
};

export default async function HomePage() {
  const [profile, accounts, recent] = await Promise.all([
    getCurrentProfile(),
    listAccounts(),
    listTransactions({ limit: 5 }),
  ]);

  const income = profile?.monthly_income ?? 0;
  const firstName =
    profile?.full_name?.split(" ")[0] ??
    profile?.display_name?.split(" ")[0] ??
    "there";

  const total = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  const slices = accounts
    .filter((a) => ["bills", "spending", "savings"].includes(a.kind))
    .map((a) => ({
      label: a.name,
      value: Number(a.allocation),
      color: KIND_COLOR[a.kind] ?? "#2F7D4F",
    }));

  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]));

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
      <section className="px-4 pb-2 pt-5">
        <div className="text-[13px] text-muted">
          {greeting()}, {firstName}.
        </div>
        <div className="mt-1">
          <div className="text-[12px] uppercase tracking-wide text-muted">
            Total balance
          </div>
          <div className="tabular text-[40px] font-semibold leading-none">
            {formatCurrency(total)}
          </div>
        </div>
      </section>

      <section className="space-y-3 px-4 pt-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            monthlyAllocation={income * Number(account.allocation)}
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
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-transparent p-6 text-center">
            <p className="text-[14px] font-medium text-ink">No activity yet.</p>
            <p className="mt-1 text-[12px] text-muted">
              Add a transaction with the + button, or connect a bank later.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                showAccount={accountNameById.get(t.account_id)}
                href={`/transactions/${t.id}`}
              />
            ))}
          </div>
        )}
      </section>

      <div className="h-8" />
    </>
  );
}
