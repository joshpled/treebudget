import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, Sparkles, Plus } from "lucide-react";
import { UpgradedBanner } from "@/components/UpgradedBanner";
import { TopBar } from "@/components/TopBar";
import { AccountCard } from "@/components/AccountCard";
import { SplitDonut } from "@/components/SplitDonut";
import { TransactionRow } from "@/components/TransactionRow";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { AddTransactionLauncher } from "@/components/transactions/AddTransactionLauncher";
import { SetupProgressCard } from "@/components/setup/SetupProgressCard";
import { listAccounts } from "@/lib/db/accounts";
import { listTransactions } from "@/lib/db/transactions";
import { getCurrentProfile } from "@/lib/db/profile";
import { SETUP_STEPS } from "@/lib/setup/content";
import { computeBalanceHistory } from "@/lib/balanceHistory";
import { formatCurrency, greeting } from "@/lib/format";

const KIND_COLOR: Record<string, string> = {
  bills: "#5C6B62",
  spending: "#2F7D4F",
  savings: "#C9A227",
};

export default async function HomePage() {
  const [profile, accounts, recent, allTxns] = await Promise.all([
    getCurrentProfile(),
    listAccounts(),
    listTransactions({ limit: 5 }),
    // Fetch a 60-day window to derive per-account sparkline history without
    // a second round-trip per card.
    listTransactions({ limit: 500 }),
  ]);
  const historyByAccount = new Map<string, number[]>();
  for (const a of accounts) {
    historyByAccount.set(a.id, computeBalanceHistory(a, allTxns, 30));
  }

  const income = profile?.monthly_income ?? 0;
  const firstName =
    profile?.full_name?.split(" ")[0] ??
    profile?.display_name?.split(" ")[0] ??
    "there";

  const setupSteps = profile?.setup_steps ?? {};
  const setupDone = SETUP_STEPS.filter((s) => !!setupSteps[s.id]).length;
  const setupAllDone = setupDone >= SETUP_STEPS.length;
  const showSetupCard =
    !!profile && !profile.setup_dismissed_at && !setupAllDone;

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
      <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8">
        <Suspense>
          <UpgradedBanner />
        </Suspense>

        <section className="px-4 pb-2 pt-5 lg:px-0 lg:pt-8">
          <div className="text-[13px] text-muted">
            {greeting()}, {firstName}.
          </div>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[12px] uppercase tracking-wide text-muted">
                Total balance
              </div>
              <div className="tabular text-[40px] font-semibold leading-none lg:text-[48px]">
                {formatCurrency(total)}
              </div>
            </div>
            <div className="hidden text-right text-[12px] text-muted lg:block">
              <div>Monthly income</div>
              <div className="tabular text-[18px] font-semibold text-ink">
                {formatCurrency(income, { showCents: false })}
              </div>
            </div>
          </div>
        </section>

        {showSetupCard ? (
          <div className="lg:px-0">
            <SetupProgressCard
              doneCount={setupDone}
              total={SETUP_STEPS.length}
            />
          </div>
        ) : null}

        <section className="grid gap-3 px-4 pt-4 lg:grid-cols-3 lg:px-0 lg:pt-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              monthlyAllocation={income * Number(account.allocation)}
              history={historyByAccount.get(account.id) ?? []}
              href={`/transactions?account=${account.id}`}
            />
          ))}
        </section>

        {allTxns.length === 0 ? (
          <section className="mx-4 mt-6 rounded-2xl border border-dashed border-border bg-transparent p-6 text-center lg:mx-0">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
              <Sparkles size={18} />
            </div>
            <p className="mt-3 text-[15px] font-semibold text-ink">
              Get started in 30 seconds
            </p>
            <p className="mt-1 text-[13px] text-muted">
              Add your first transaction or connect a bank to pull in real
              activity.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <AddTransactionLauncher accounts={accounts} />
              <Link
                href="/settings/accounts"
                className="rounded-full border border-border bg-bg px-4 py-2 text-[13px] font-medium text-ink"
              >
                <Plus size={14} className="-mt-0.5 mr-1 inline" />
                Connect a bank
              </Link>
            </div>
          </section>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-5 lg:gap-6">
          <section className="mx-4 rounded-2xl border border-border bg-surface p-4 shadow-card lg:mx-0 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[12px] uppercase tracking-wide text-muted">
                  Income split
                </div>
                <div className="text-[15px] font-semibold">
                  Each paycheck of{" "}
                  {formatCurrency(income / 2, { showCents: false })}
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

          <section className="px-4 lg:col-span-3 lg:px-0">
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
                <p className="text-[14px] font-medium text-ink">
                  No activity yet.
                </p>
                <p className="mt-1 text-[12px] text-muted">
                  Add a transaction with the + button, or connect a bank later.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border lg:rounded-2xl lg:border lg:border-border lg:bg-surface lg:px-3 lg:shadow-card">
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
        </div>



        <div className="h-8 lg:h-12" />
      </div>
    </>
  );
}
