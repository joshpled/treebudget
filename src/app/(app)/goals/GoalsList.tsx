"use client";

import { useState } from "react";
import { Sprout, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { GoalSheet } from "@/components/goals/GoalSheet";
import { formatCurrency } from "@/lib/format";
import type { Goal } from "@/lib/types";
import { cn } from "@/lib/cn";

type Props = { goals: Goal[]; tier: "free" | "paid" };

export function GoalsList({ goals, tier }: Props) {
  const [editing, setEditing] = useState<Goal | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <>
      {goals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-transparent p-6 text-center lg:col-span-2">
          <p className="text-[14px] font-medium text-ink">No goals yet.</p>
          <p className="mt-1 text-[12px] text-muted">
            Plant your first goal below.
          </p>
        </div>
      ) : (
        goals.map((g) => {
          const target = Number(g.target_amount);
          const current = Number(g.current_amount);
          const fraction = target > 0 ? Math.min(1, current / target) : 0;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setEditing(g)}
              className={cn(
                "block rounded-2xl border border-border bg-surface p-4 text-left shadow-card",
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sprout size={16} className="text-primary" />
                    <span className="text-[15px] font-semibold">{g.name}</span>
                  </div>
                  <div className="tabular mt-1 text-[22px] font-semibold">
                    {formatCurrency(current, { showCents: false })}
                    <span className="text-[14px] font-normal text-muted">
                      {" "}
                      / {formatCurrency(target, { showCents: false })}
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
              {g.due_date ? (
                <div className="mt-2 text-[12px] text-muted">
                  Target by{" "}
                  {new Date(g.due_date).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              ) : null}
            </button>
          );
        })
      )}

      {tier === "free" ? (
        <div className="col-span-full rounded-2xl border border-border bg-surface p-5 text-center">
          <p className="text-[14px] font-semibold text-ink">Goals are a paid feature.</p>
          <p className="mt-1 text-[13px] text-muted">Upgrade to set savings targets and track your progress.</p>
          <Link
            href="/pricing"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-white"
          >
            See plans <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full rounded-2xl border border-dashed border-border bg-transparent px-4 py-4 text-[14px] font-medium text-muted hover:border-primary hover:text-primary lg:col-span-2"
        >
          <span className="inline-flex items-center gap-1.5">
            <Plus size={16} />
            Add a savings goal
          </span>
        </button>
      )}

      {adding ? <GoalSheet onClose={() => setAdding(false)} /> : null}
      {editing ? (
        <GoalSheet goal={editing} onClose={() => setEditing(null)} />
      ) : null}
    </>
  );
}
