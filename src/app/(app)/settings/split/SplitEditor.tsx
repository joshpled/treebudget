"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SplitDonut } from "@/components/SplitDonut";
import { saveIncomeAndSplit } from "@/app/actions/budget";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

const COLORS = {
  bills: "#5C6B62",
  spending: "#2F7D4F",
  savings: "#C9A227",
};

type Key = "bills" | "spending" | "savings";

type Props = {
  initialIncome: number;
  initialBills: number;
  initialSpending: number;
  initialSavings: number;
  redirectTo: string;
};

export function SplitEditor({
  initialIncome,
  initialBills,
  initialSpending,
  initialSavings,
  redirectTo,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [income, setIncome] = useState(initialIncome);
  const [pct, setPct] = useState({
    bills: initialBills,
    spending: initialSpending,
    savings: initialSavings,
  });

  const adjust = (key: Key, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    setPct((prev) => {
      const others: Key[] = (["bills", "spending", "savings"] as Key[]).filter(
        (k) => k !== key,
      );
      const remaining = 100 - clamped;
      const otherTotal = prev[others[0]] + prev[others[1]] || 1;
      const next = {
        ...prev,
        [key]: clamped,
        [others[0]]: Math.round((prev[others[0]] / otherTotal) * remaining),
      };
      next[others[1]] = 100 - next[key] - next[others[0]];
      return next;
    });
  };

  const total = pct.bills + pct.spending + pct.savings;
  const valid = total === 100;

  const onSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        await saveIncomeAndSplit({
          income,
          bills: pct.bills,
          spending: pct.spending,
          savings: pct.savings,
        });
        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save.");
      }
    });
  };

  return (
    <>
      <div className="px-4 pb-2 pt-4">
        <label className="block text-[12px] font-medium uppercase tracking-wide text-muted">
          Monthly income
        </label>
        <div className="mt-2 flex items-baseline gap-2 rounded-2xl border border-border bg-surface px-4 py-3 shadow-card focus-within:border-primary">
          <span className="text-[24px] font-semibold text-muted">$</span>
          <input
            type="number"
            inputMode="decimal"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value) || 0)}
            className="tabular w-full bg-transparent text-[28px] font-semibold leading-none focus:outline-none"
          />
          <span className="text-[12px] text-muted">/ mo</span>
        </div>
        <p className="mt-1 px-1 text-[12px] text-muted">
          Each paycheck of {formatCurrency(income / 2, { showCents: false })}{" "}
          gets auto-split.
        </p>
      </div>

      <div className="mx-4 mt-4 rounded-2xl border border-border bg-surface p-4 shadow-card">
        <SplitDonut
          slices={[
            { label: "Bills", value: pct.bills, color: COLORS.bills },
            { label: "Spending", value: pct.spending, color: COLORS.spending },
            { label: "Savings", value: pct.savings, color: COLORS.savings },
          ]}
          centerLabel="Allocation"
          centerValue={`${total}%`}
        />
      </div>

      <div className="space-y-5 px-4 py-5">
        <Slider
          label="Bills"
          color={COLORS.bills}
          value={pct.bills}
          monthly={(income * pct.bills) / 100}
          onChange={(v) => adjust("bills", v)}
        />
        <Slider
          label="Spending"
          color={COLORS.spending}
          value={pct.spending}
          monthly={(income * pct.spending) / 100}
          onChange={(v) => adjust("spending", v)}
          hint="The card you carry. Limit = this number."
        />
        <Slider
          label="Savings"
          color={COLORS.savings}
          value={pct.savings}
          monthly={(income * pct.savings) / 100}
          onChange={(v) => adjust("savings", v)}
        />
      </div>

      {error ? (
        <div className="mx-4 mb-3 rounded-2xl border border-danger/40 bg-danger/5 px-4 py-2.5 text-[13px] text-danger">
          {error}
        </div>
      ) : null}

      <div className="px-4 pb-8">
        <button
          type="button"
          onClick={onSave}
          disabled={!valid || isPending}
          className={cn(
            "w-full rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-semibold text-white shadow-card transition-opacity",
            (!valid || isPending) && "opacity-60",
          )}
        >
          {isPending
            ? "Saving…"
            : valid
              ? "Save split"
              : `Total ${total}% — must be 100%`}
        </button>
      </div>
    </>
  );
}

function Slider({
  label,
  color,
  value,
  monthly,
  onChange,
  hint,
}: {
  label: string;
  color: string;
  value: number;
  monthly: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="flex items-center gap-2 text-[14px] font-medium">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: color }}
          />
          {label}
        </span>
        <span className="tabular text-[14px] font-semibold">
          {value}%
          <span className="ml-2 text-[12px] font-normal text-muted">
            {formatCurrency(monthly, { showCents: false })}/mo
          </span>
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: color }}
      />
      {hint ? (
        <p className="mt-1 text-[12px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
