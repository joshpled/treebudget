"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { FREE_TRANSACTION_LIMIT } from "@/lib/tier";

type Cycle = "monthly" | "yearly";

const FREE_FEATURES = [
  "All three core accounts (Bills, Spending, Savings)",
  `Up to ${FREE_TRANSACTION_LIMIT} manual transactions`,
  "Email + Google sign-in",
  "Works on mobile and desktop",
];

const FREE_LOCKED = [
  "Bank sync via Plaid",
  "Unlimited transactions",
  "Savings goals",
  "Auto income split",
];

const PAID_FEATURES = [
  "Everything in Free",
  "Bank sync via Plaid — read-only by design",
  "Unlimited transactions and categories",
  "Unlimited savings goals",
  "Auto income split across all accounts",
  "Setup guide with bank-by-bank instructions",
  "Demo mode",
];

export function PricingCards() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  const price = cycle === "monthly" ? "$9.99" : "$99";
  const per = cycle === "monthly" ? "/month" : "/year";
  const monthlyEquivalent = cycle === "yearly" ? "≈ $8.25 / month" : null;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* Free card */}
      <div className="flex-1 overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        <div className="border-b border-border p-6 sm:p-8">
          <div className="text-[13px] font-semibold uppercase tracking-wider text-muted">
            Free
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="tabular text-[48px] font-semibold leading-none text-ink">
              $0
            </span>
            <span className="text-[15px] text-muted">forever</span>
          </div>
          <div className="mt-1 text-[13px] text-muted">No credit card required</div>
        </div>
        <div className="space-y-3 p-6 sm:p-8">
          <ul className="space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[14px] leading-snug text-ink">
                <Check size={15} className="mt-0.5 shrink-0 text-primary" strokeWidth={2.5} />
                {f}
              </li>
            ))}
            {FREE_LOCKED.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[14px] leading-snug text-muted">
                <X size={15} className="mt-0.5 shrink-0" strokeWidth={2} />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/sign-up"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-bg px-4 py-3.5 text-[15px] font-semibold text-ink shadow-card transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Get started free
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Paid card */}
      <div className="flex-1 overflow-hidden rounded-3xl border border-primary/30 bg-surface shadow-card">
        <div className="bg-primary-soft/60 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold uppercase tracking-wider text-primary-ink">
              Paid
            </div>
            <div
              role="tablist"
              aria-label="Billing cycle"
              className="inline-flex rounded-full border border-border bg-bg p-1"
            >
              <CycleButton active={cycle === "monthly"} onClick={() => setCycle("monthly")}>
                Monthly
              </CycleButton>
              <CycleButton active={cycle === "yearly"} onClick={() => setCycle("yearly")}>
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
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="tabular text-[48px] font-semibold leading-none text-ink sm:text-[56px]">
              {price}
            </span>
            <span className="text-[16px] text-muted">{per}</span>
          </div>
          {monthlyEquivalent ? (
            <div className="mt-1 text-[13px] text-muted">{monthlyEquivalent}</div>
          ) : (
            <div className="mt-1 text-[13px] text-muted">Or $99/year and save 17%</div>
          )}
        </div>
        <div className="space-y-3 p-6 sm:p-8">
          <ul className="space-y-2">
            {PAID_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[14px] leading-snug text-ink">
                <Check size={15} className="mt-0.5 shrink-0 text-primary" strokeWidth={2.5} />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href={`/sign-up?plan=${cycle}`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-semibold text-white shadow-card transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Get full access — {price}{per}
            <ArrowRight size={16} />
          </Link>
          <p className="text-center text-[12px] text-muted">Cancel anytime</p>
        </div>
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
        "flex items-center rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
        active ? "bg-primary text-white shadow-card" : "text-muted",
      )}
    >
      {children}
    </button>
  );
}
