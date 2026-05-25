"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { loadDemoData } from "@/app/actions/budget";
import { Spinner } from "@/components/Spinner";
import { haptic } from "@/lib/haptic";
import { cn } from "@/lib/cn";

export function DemoDataButton() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    haptic(20);
    startTransition(async () => {
      try {
        await loadDemoData();
        // loadDemoData redirects to / on success.
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't load demo.");
      }
    });
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-medium text-ink"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
          <Sparkles size={17} strokeWidth={1.8} />
        </div>
        <span>Load demo data</span>
      </button>
    );
  }

  return (
    <div className="px-4 py-3">
      <p className="text-[13px] text-ink">
        Replace your data with a realistic demo: a couple months of
        transactions, bi-weekly paychecks, and a few savings goals. Useful
        when showing the app off.
      </p>
      {error ? (
        <p className="mt-2 text-[12px] text-danger">{error}</p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={load}
          disabled={isPending}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-3 py-2.5 text-[13px] font-semibold text-white transition-opacity",
            isPending && "opacity-70",
          )}
        >
          {isPending ? <Spinner size={14} /> : null}
          {isPending ? "Loading…" : "Load demo data"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-full border border-border bg-bg px-4 py-2.5 text-[13px] font-medium text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
