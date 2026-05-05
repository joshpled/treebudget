import { Sprout } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { listGoals } from "@/lib/db/goals";
import { formatCurrency } from "@/lib/format";

export default async function GoalsPage() {
  const goals = await listGoals();

  return (
    <>
      <TopBar right={<UserAvatar />} />
      <PageHeader
        eyebrow="Savings"
        title="Goals"
        subtitle="Set targets. Watch them grow."
      />
      <div className="space-y-3 px-4 pb-6">
        {goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-transparent p-6 text-center">
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
              </div>
            );
          })
        )}

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
