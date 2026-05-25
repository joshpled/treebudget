"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/cn";

type Cycle = "monthly" | "yearly";

const FEATURES = [
  "All three core accounts (Bills, Spending, Savings)",
  "Bank sync via Plaid — read-only by design",
  "Unlimited transactions and categories",
  "Unlimited savings goals",
  "Setup guide with bank-by-bank instructions",
  "Demo mode for showing the app off",
  "Email + Google sign-in",
  "Works on mobile and desktop",
];

export function PricingCard() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  const price = cycle === "monthly" ? "$9.99" : "$99";
  const per = cycle === "monthly" ? "/month" : "/year";
  // 12 × 9.99 = $119.88. $99 yearly = ~ $20.88 / 17% saved.
  const monthlyEquivalent = cycle === "yearly" ? "≈ $8.25 / month" : null;

  return (
    <div className="overflow-hidden rounded-3xl border border-primary/30 bg-surface shadow-card">
      <div className="bg-primary-soft/60 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4">
          <div
            role="tablist"
            aria-label="Billing cycle"
            className="inline-flex rounded-full border border-border bg-bg p-1"
          >
            <CycleButton
              active={cycle === "monthly"}
              onClick={() => setCycle("monthly")}
            >
              Monthly
            </CycleButton>
            <CycleButton
              active={cycle === "yearly"}
              onClick={() => setCycle("yearly")}
            >
              Yearly
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  cycle === "yearly"
                    ? "bg-white/20 text-white"
                    : "bg-primary-soft text-primary-ink",
                )}
              >
                Save 17%
              </span>
            </CycleButton>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="tabular text-[56px] font-semibold leading-none text-ink sm:text-[64px]">
              {price}
            </span>
            <span className="text-[16px] text-muted">{per}</span>
          </div>
          {monthlyEquivalent ? (
            <div className="text-[13px] text-muted">{monthlyEquivalent}</div>
          ) : (
            <div className="text-[13px] text-muted">
              Or {` `}$99/year and save 17%
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 p-6 sm:p-8">
        <div className="text-center text-[14px] font-semibold uppercase tracking-wide text-muted">
          Full access — everything included
        </div>
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 text-[14px] leading-snug text-ink"
            >
              <Check
                size={16}
                className="mt-0.5 shrink-0 text-primary"
                strokeWidth={2.5}
              />
              {f}
            </li>
          ))}
        </ul>

        <Link
          href={`/sign-up?plan=${cycle}`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-semibold text-white shadow-card transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Get started — {price}
          {per}
          <ArrowRight size={16} />
        </Link>
        <p className="text-center text-[12px] text-muted">
          7-day free preview · Cancel anytime
        </p>
      </div>
    </div>
  );
}

function CycleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center rounded-full px-4 py-2 text-[14px] font-medium transition-colors",
        active ? "bg-primary text-white shadow-card" : "text-muted",
      )}
    >
      {children}
    </button>
  );
}
