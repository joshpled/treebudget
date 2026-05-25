"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sprout, X, ChevronRight } from "lucide-react";
import { dismissSetupCard } from "@/app/actions/setup";
import { cn } from "@/lib/cn";

type Props = {
  doneCount: number;
  total: number;
};

export function SetupProgressCard({ doneCount, total }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [hidden, setHidden] = useState(false);

  const dismiss = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setHidden(true);
    startTransition(async () => {
      try {
        await dismissSetupCard();
        router.refresh();
      } catch {
        setHidden(false);
      }
    });
  };

  if (hidden) return null;

  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <Link
      href="/setup"
      className="mx-4 mt-4 block rounded-2xl border border-primary/30 bg-primary-soft p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-primary-ink">
          <Sprout size={18} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-semibold text-primary-ink">
              Make it real at your bank
            </span>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-full text-primary-ink/70"
            >
              <X size={14} />
            </button>
          </div>
          <p className="mt-1 text-[12px] text-primary-ink/85">
            {doneCount === 0
              ? "Set up split direct deposit + separate accounts so your bucket balances reflect real money."
              : `${doneCount}/${total} steps done. Keep going to fully automate the split.`}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
              <div
                className={cn(
                  "h-full rounded-full bg-primary transition-all",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="flex items-center gap-0.5 text-[12px] font-medium text-primary-ink">
              Continue
              <ChevronRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
