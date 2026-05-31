"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, CreditCard } from "lucide-react";
import Link from "next/link";
import { formatMonthDay } from "@/lib/format";

type Props = {
  tier: "free" | "paid";
  hasStripeCustomer: boolean;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
};

export function PlanSection({
  tier,
  hasStripeCustomer,
  cancelAtPeriodEnd,
  cancelAt,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "monthly" }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  async function handleCancelToggle(cancel: boolean) {
    if (cancel && !confirm("Cancel Premium? You keep access until the end of your paid period.")) {
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/stripe/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const subtitle =
    tier === "paid"
      ? cancelAtPeriodEnd && cancelAt
        ? `Premium · Cancels ${formatMonthDay(cancelAt)}`
        : "Premium"
      : "Free";

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
        <CreditCard size={17} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-ink">Plan</div>
        <div className="text-[12px] text-muted">{subtitle}</div>
      </div>
      {tier === "free" ? (
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <>
              Upgrade <ArrowRight size={13} />
            </>
          )}
        </button>
      ) : hasStripeCustomer ? (
        <div className="flex items-center gap-2">
          {cancelAtPeriodEnd ? (
            <button
              type="button"
              onClick={() => handleCancelToggle(false)}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                "Resume"
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleCancelToggle(true)}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1.5 text-[13px] font-medium text-danger disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                "Cancel"
              )}
            </button>
          )}
          <button
            type="button"
            onClick={handlePortal}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1.5 text-[13px] font-medium text-ink disabled:opacity-50"
          >
            Manage
          </button>
        </div>
      ) : (
        <Link
          href="/pricing"
          className="text-[13px] font-medium text-primary"
        >
          View plans
        </Link>
      )}
    </div>
  );
}
