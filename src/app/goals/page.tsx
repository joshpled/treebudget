"use client";

import { Sprout } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { useBudgetStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";

export default function GoalsPage() {
  const { goals } = useBudgetStore();

  return (
    <>
      <TopBar />
      <PageHeader
        eyebrow="Savings"
        title="Goals"
        subtitle="Set targets. Watch them grow."
      />
      <div className="space-y-3 px-4 pb-6">
        {goals.map((g) => {
          const fraction = Math.min(1, g.current / g.target);
          return (
            <div
              key={g.id}
              className="rounded-2xl border border-border bg-surface p-4 shadow-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sprout size={16} className="text-primary" />
                    <span className="text-[15px] font-semibold">{g.name}</span>
                  </div>
                  <div className="tabular mt-1 text-[22px] font-semibold">
                    {formatCurrency(g.current, { showCents: false })}
                    <span className="text-[14px] font-normal text-muted">
                      {" "}
                      / {formatCurrency(g.target, { showCents: false })}
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary-ink">
                  {Math.round(fraction * 100)}%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${fraction * 100}%` }}
                />
              </div>
              {g.dueDate ? (
                <div className="mt-2 text-[12px] text-muted">
                  Target by{" "}
                  {new Date(g.dueDate).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              ) : null}
            </div>
          );
        })}

        <button
          type="button"
          className="w-full rounded-2xl border border-dashed border-border bg-transparent px-4 py-4 text-[14px] font-medium text-muted hover:border-primary hover:text-primary"
        >
          + Add a savings goal
        </button>
      </div>
    </>
  );
}
