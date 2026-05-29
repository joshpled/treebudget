import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { getTransaction } from "@/lib/db/transactions";
import { getAccount, listAccounts } from "@/lib/db/accounts";
import { getCurrentProfile } from "@/lib/db/profile";
import { SplitToggle } from "@/components/transactions/SplitToggle";
import { EditTransactionLauncher } from "./EditTransactionLauncher";
import { formatCurrency, formatMonthDay } from "@/lib/format";
import { cn } from "@/lib/cn";

type Params = Promise<{ id: string }>;

export default async function TransactionDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const txn = await getTransaction(id);

  if (!txn) {
    return (
      <>
        <TopBar
          back={{ href: "/transactions", label: "Activity" }}
          title="Transaction"
        />
        <div className="px-4 py-12 text-center text-sm text-muted">
          Transaction not found.
        </div>
      </>
    );
  }

  const [account, allAccounts, parent, profile] = await Promise.all([
    getAccount(txn.account_id),
    listAccounts(),
    txn.parent_transaction_id
      ? getTransaction(txn.parent_transaction_id)
      : Promise.resolve(null),
    getCurrentProfile(),
  ]);

  const amount = Number(txn.amount);
  const positive = amount > 0;
  const isSplitChild = !!txn.parent_transaction_id;
  const isIncome = positive && !isSplitChild;
  const coreAccounts = allAccounts.filter((a) =>
    ["bills", "spending", "savings"].includes(a.kind),
  );

  return (
    <>
      <TopBar
        back={{ href: "/transactions", label: "Activity" }}
        title="Detail"
        right={
          isSplitChild ? null : (
            <EditTransactionLauncher
              transaction={txn}
              accounts={allAccounts}
            />
          )
        }
      />
      <div className="mx-auto w-full max-w-md lg:max-w-2xl lg:px-8">
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
            {formatCurrency(amount, { signed: positive })}
          </div>
          <div className="mt-2 text-[15px] font-medium text-ink">
            {txn.merchant}
          </div>
          <div className="mt-1 text-[13px] text-muted">
            {formatMonthDay(txn.posted_at)} · {account?.name ?? "Account"}
          </div>
        </section>

        {isIncome && coreAccounts.length === 3 && profile?.tier === "paid" ? (
          <SplitToggle
            transactionId={txn.id}
            splitApplied={txn.split_applied}
            incomeAmount={amount}
            sourceAccountId={txn.account_id}
            coreAccounts={coreAccounts}
          />
        ) : null}

        {isSplitChild && parent ? (
          <div className="mx-4 mt-4 rounded-2xl border border-border bg-surface p-4 shadow-card">
            <div className="text-[12px] font-medium uppercase tracking-wide text-muted">
              Part of a split
            </div>
            <div className="mt-1 text-[14px] text-ink">
              Generated automatically from{" "}
              <Link
                href={`/transactions/${parent.id}`}
                className="font-medium text-primary"
              >
                {parent.merchant}
              </Link>
              . Undo the split on that transaction to remove this one.
            </div>
          </div>
        ) : null}

        <section className="mx-4 mt-4 rounded-2xl border border-border bg-surface shadow-card">
          <Row label="Account" value={account?.name ?? "—"} />
          <Row label="Category" value={txn.category} />
          <Row
            label="Date"
            value={new Date(txn.posted_at).toLocaleString()}
          />
          {txn.note ? <Row label="Note" value={txn.note} /> : null}
          {txn.external_source ? (
            <Row label="Source" value={txn.external_source} />
          ) : null}
        </section>

        <div className="h-8" />
      </div>
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
