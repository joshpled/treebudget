import { TopBar } from "@/components/TopBar";
import { getTransaction } from "@/lib/db/transactions";
import { getAccount } from "@/lib/db/accounts";
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
  const account = txn ? await getAccount(txn.account_id) : null;

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

  const amount = Number(txn.amount);
  const positive = amount > 0;

  return (
    <>
      <TopBar
        back={{ href: "/transactions", label: "Activity" }}
        title="Detail"
      />
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

      <section className="mx-4 rounded-2xl border border-border bg-surface shadow-card">
        <Row label="Account" value={account?.name ?? "—"} />
        <Row label="Category" value={txn.category} />
        <Row label="Date" value={new Date(txn.posted_at).toLocaleString()} />
        {txn.note ? <Row label="Note" value={txn.note} /> : null}
        {txn.external_source ? (
          <Row label="Source" value={txn.external_source} />
        ) : null}
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
