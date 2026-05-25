"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RotateCcw } from "lucide-react";
import { applyIncomeSplit, undoIncomeSplit } from "@/app/actions/budget";
import { Spinner } from "@/components/Spinner";
import { haptic } from "@/lib/haptic";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Account } from "@/lib/types";

type Props = {
  transactionId: string;
  splitApplied: boolean;
  incomeAmount: number;
  sourceAccountId: string;
  coreAccounts: Pick<Account, "id" | "kind" | "name" | "allocation">[];
};

export function SplitToggle({
  transactionId,
  splitApplied,
  incomeAmount,
  sourceAccountId,
  coreAccounts,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const source = coreAccounts.find((a) => a.id === sourceAccountId);
  const others = coreAccounts.filter((a) => a.id !== sourceAccountId);

  const shares = others.map((a) => ({
    name: a.name,
    amount: Math.round(incomeAmount * Number(a.allocation) * 100) / 100,
  }));
  const sourceShare =
    Math.round(
      (incomeAmount - shares.reduce((s, x) => s + x.amount, 0)) * 100,
    ) / 100;

  const apply = () => {
    setError(null);
    haptic();
    startTransition(async () => {
      try {
        await applyIncomeSplit({ transaction_id: transactionId });
        haptic(20);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't split.");
      }
    });
  };

  const undo = () => {
    setError(null);
    haptic();
    startTransition(async () => {
      try {
        await undoIncomeSplit({ transaction_id: transactionId });
        haptic(15);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't undo.");
      }
    });
  };

  if (splitApplied) {
    return (
      <div className="mx-4 mt-4 rounded-2xl border border-primary/30 bg-primary-soft p-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-primary-ink">
          <Sparkles size={14} />
          Auto-split applied
        </div>
        <ul className="mt-3 space-y-1.5 text-[13px] text-primary-ink/90">
          {source ? (
            <li className="flex items-center justify-between">
              <span>{source.name} kept</span>
              <span className="tabular font-semibold">
                {formatCurrency(sourceShare)}
              </span>
            </li>
          ) : null}
          {shares.map((s) => (
            <li key={s.name} className="flex items-center justify-between">
              <span>→ {s.name}</span>
              <span className="tabular font-semibold">
                {formatCurrency(s.amount)}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={undo}
          disabled={isPending}
          className={cn(
            "mt-4 flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-bg px-3 py-2 text-[13px] font-medium text-ink transition-opacity",
            isPending && "opacity-60",
          )}
        >
          {isPending ? <Spinner size={14} /> : <RotateCcw size={14} />}
          {isPending ? "Undoing…" : "Undo split"}
        </button>
        {error ? (
          <p className="mt-2 text-[12px] text-danger">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-dashed border-border bg-transparent p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
          <Sparkles size={17} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-ink">
            Split this as income
          </div>
          <p className="mt-0.5 text-[12px] text-muted">
            Apply your allocation across all three buckets.
          </p>
          <ul className="mt-2 space-y-1 text-[12px] text-muted">
            {source ? (
              <li>
                {source.name} keeps {formatCurrency(sourceShare)}
              </li>
            ) : null}
            {shares.map((s) => (
              <li key={s.name}>
                → {s.name} {formatCurrency(s.amount)}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        type="button"
        onClick={apply}
        disabled={isPending}
        className={cn(
          "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-[14px] font-semibold text-white shadow-card transition-opacity",
          isPending && "opacity-70",
        )}
      >
        {isPending ? <Spinner size={15} /> : null}
        {isPending ? "Splitting…" : "Split across accounts"}
      </button>
      {error ? <p className="mt-2 text-[12px] text-danger">{error}</p> : null}
    </div>
  );
}
