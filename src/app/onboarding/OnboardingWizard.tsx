"use client";

import { useState, useTransition } from "react";
import { TreeMark } from "@/components/TreeMark";
import { SplitDonut } from "@/components/SplitDonut";
import { completeOnboarding } from "@/app/actions/budget";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

const COLORS = {
  bills: "#5C6B62",
  spending: "#2F7D4F",
  savings: "#C9A227",
};

type Step = 1 | 2 | 3;

type Props = { initialIncome: number };

export function OnboardingWizard({ initialIncome }: Props) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>(1);
  const [income, setIncomeLocal] = useState(initialIncome || 6000);
  const [pct, setPct] = useState({ bills: 50, spending: 30, savings: 20 });
  const [error, setError] = useState<string | null>(null);

  const total = pct.bills + pct.spending + pct.savings;
  const valid = total === 100;

  const adjust = (key: keyof typeof pct, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    const others = (Object.keys(pct) as Array<keyof typeof pct>).filter(
      (k) => k !== key,
    );
    const remaining = 100 - clamped;
    const otherTotal = pct[others[0]] + pct[others[1]] || 1;
    const next = {
      ...pct,
      [key]: clamped,
      [others[0]]: Math.round((pct[others[0]] / otherTotal) * remaining),
    };
    next[others[1]] = 100 - next[key] - next[others[0]];
    setPct(next);
  };

  const finish = () => {
    setError(null);
    startTransition(async () => {
      try {
        await completeOnboarding({
          income,
          bills: pct.bills,
          spending: pct.spending,
          savings: pct.savings,
        });
        // completeOnboarding redirects on success.
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save.");
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-4 pt-6">
        <div className="flex items-center gap-2">
          <TreeMark size={22} />
          <span className="text-[14px] font-semibold tracking-tight">
            treebudget
          </span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={cn(
                "h-1.5 w-6 rounded-full",
                s <= step ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 pt-6">
        {step === 1 ? (
          <>
            <h1 className="text-[26px] font-semibold leading-tight">
              What&apos;s your monthly income?
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              We&apos;ll use this to size each of your accounts.
            </p>
            <div className="mt-8 flex items-baseline gap-2 rounded-2xl border border-border bg-surface px-4 py-4 shadow-card focus-within:border-primary">
              <span className="text-[28px] font-semibold text-muted">$</span>
              <input
                type="number"
                inputMode="decimal"
                autoFocus
                value={income}
                onChange={(e) => setIncomeLocal(Number(e.target.value) || 0)}
                className="tabular w-full bg-transparent text-[36px] font-semibold leading-none focus:outline-none"
              />
              <span className="text-[12px] text-muted">/ mo</span>
            </div>
            <p className="mt-2 px-1 text-[12px] text-muted">
              Take-home (after taxes). You can change this anytime.
            </p>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h1 className="text-[26px] font-semibold leading-tight">
              Split each paycheck
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              50/30/20 is a great starting point. Tweak to fit your life.
            </p>
            <div className="mt-6 rounded-2xl border border-border bg-surface p-4 shadow-card">
              <SplitDonut
                slices={[
                  { label: "Bills", value: pct.bills, color: COLORS.bills },
                  { label: "Spending", value: pct.spending, color: COLORS.spending },
                  { label: "Savings", value: pct.savings, color: COLORS.savings },
                ]}
                centerLabel="Total"
                centerValue={`${total}%`}
              />
            </div>
            <div className="mt-5 space-y-5">
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
              />
              <Slider
                label="Savings"
                color={COLORS.savings}
                value={pct.savings}
                monthly={(income * pct.savings) / 100}
                onChange={(v) => adjust("savings", v)}
              />
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h1 className="text-[26px] font-semibold leading-tight">
              You&apos;re ready to go
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              We&apos;ll create three accounts. Carry the Spending card; the
              others run quietly in the background.
            </p>
            <div className="mt-6 space-y-2">
              <Summary
                label="Bills"
                color={COLORS.bills}
                pct={pct.bills}
                amount={(income * pct.bills) / 100}
                hint="Rent, utilities, recurring bills"
              />
              <Summary
                label="Spending"
                color={COLORS.spending}
                pct={pct.spending}
                amount={(income * pct.spending) / 100}
                hint="The card you carry day-to-day"
                badge="Card"
              />
              <Summary
                label="Savings"
                color={COLORS.savings}
                pct={pct.savings}
                amount={(income * pct.savings) / 100}
                hint="Set aside automatically"
              />
            </div>
            {error ? (
              <div className="mt-4 rounded-2xl border border-danger/40 bg-danger/5 px-4 py-2.5 text-[13px] text-danger">
                {error}
              </div>
            ) : null}
            <p className="mt-4 px-1 text-[12px] text-muted">
              You can connect a real bank later. Add transactions manually with
              the + button on Home anytime.
            </p>
          </>
        ) : null}
      </main>

      <footer className="px-4 pb-6 pt-4">
        <button
          type="button"
          onClick={() => {
            if (step === 1) setStep(2);
            else if (step === 2 && valid) setStep(3);
            else if (step === 3) finish();
          }}
          disabled={(step === 2 && !valid) || isPending}
          className={cn(
            "w-full rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-semibold text-white shadow-card transition-opacity",
            ((step === 2 && !valid) || isPending) && "opacity-60",
          )}
        >
          {isPending
            ? "Saving…"
            : step === 1
              ? "Continue"
              : step === 2
                ? "Looks good"
                : "Take me in"}
        </button>
        {step > 1 && !isPending ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s === 3 ? 2 : 1) as Step)}
            className="mt-2 block w-full text-center text-[13px] font-medium text-muted"
          >
            Back
          </button>
        ) : null}
      </footer>
    </div>
  );
}

function Slider({
  label,
  color,
  value,
  monthly,
  onChange,
}: {
  label: string;
  color: string;
  value: number;
  monthly: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
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
    </div>
  );
}

function Summary({
  label,
  color,
  pct,
  amount,
  hint,
  badge,
}: {
  label: string;
  color: string;
  pct: number;
  amount: number;
  hint: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card">
      <span
        className="h-9 w-1.5 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-ink">{label}</span>
          {badge ? (
            <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary-ink">
              {badge}
            </span>
          ) : null}
        </div>
        <div className="text-[12px] text-muted">{hint}</div>
      </div>
      <div className="text-right">
        <div className="tabular text-[15px] font-semibold">
          {formatCurrency(amount, { showCents: false })}
        </div>
        <div className="text-[11px] text-muted">{pct}%</div>
      </div>
    </div>
  );
}
