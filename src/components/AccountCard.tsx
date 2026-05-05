import Link from "next/link";
import { ChevronRight, CreditCard, Sprout } from "lucide-react";
import type { Account } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Sparkline } from "./Sparkline";

type Props = {
  account: Account;
  monthlyAllocation?: number;
  history?: number[];
  href?: string;
};

const ACCENT_BY_KIND: Record<Account["kind"], string> = {
  bills: "text-ink",
  spending: "text-primary",
  savings: "text-primary",
  investment: "text-accent",
  other: "text-ink",
};

export function AccountCard({
  account,
  monthlyAllocation,
  history = [],
  href,
}: Props) {
  const hint =
    account.kind === "spending"
      ? "Your card. Spend freely up to this balance."
      : account.kind === "bills"
        ? "Bills are paid from here."
        : account.kind === "savings"
          ? "Set aside automatically each paycheck."
          : undefined;

  const className = cn(
    "group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card",
    href && "transition-transform active:scale-[0.99]",
  );

  const body = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium uppercase tracking-wide text-muted">
              {account.name}
            </span>
            {account.is_card ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary-ink">
                <CreditCard size={12} strokeWidth={2} />
                Card
              </span>
            ) : null}
            {account.kind === "savings" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary-ink">
                <Sprout size={12} strokeWidth={2} />
                Growing
              </span>
            ) : null}
          </div>
          <div
            className={cn(
              "tabular mt-1 text-[28px] font-semibold leading-none",
              ACCENT_BY_KIND[account.kind],
            )}
          >
            {formatCurrency(account.balance)}
          </div>
          {hint ? (
            <p className="mt-1 text-[12px] text-muted">{hint}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary-ink">
            {formatPercent(account.allocation)}
          </span>
          <div className="text-primary">
            <Sparkline data={history} width={88} height={28} fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-[12px] text-muted">
        <span>
          {monthlyAllocation !== undefined
            ? `${formatCurrency(monthlyAllocation, { showCents: false })} / month allocated`
            : "Tap for details"}
        </span>
        {href ? (
          <ChevronRight
            size={16}
            className="text-muted transition-transform group-hover:translate-x-0.5"
          />
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  return <div className={className}>{body}</div>;
}
