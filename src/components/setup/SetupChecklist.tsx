"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { SETUP_STEPS } from "@/lib/setup/content";
import type { SetupStepId, SetupSteps } from "@/lib/types";
import { toggleSetupStep } from "@/app/actions/setup";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptic";

type Props = {
  initialSteps: SetupSteps;
};

export function SetupChecklist({ initialSteps }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [steps, setSteps] = useState<SetupSteps>(initialSteps);
  const [openId, setOpenId] = useState<SetupStepId | null>(null);

  const toggle = (id: SetupStepId) => {
    const done = !steps[id];
    haptic();
    setSteps((prev) => ({ ...prev, [id]: done }));
    startTransition(async () => {
      try {
        await toggleSetupStep({ step: id, done });
        router.refresh();
      } catch {
        setSteps((prev) => ({ ...prev, [id]: !done }));
      }
    });
  };

  return (
    <ol className="space-y-2">
      {SETUP_STEPS.map((step, index) => {
        const done = !!steps[step.id];
        const open = openId === step.id;
        const isConnectStep = step.id === "connected_in_app";
        return (
          <li
            key={step.id}
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
          >
            <div className="flex items-center gap-3 p-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(step.id);
                }}
                aria-label={done ? "Mark incomplete" : "Mark complete"}
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                  done
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-bg text-transparent",
                )}
              >
                <Check size={14} strokeWidth={3} />
              </button>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : step.id)}
                className="flex flex-1 items-start gap-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
                      Step {index + 1}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "mt-0.5 text-[14px] font-medium leading-snug",
                      done ? "text-muted line-through" : "text-ink",
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="mt-1 text-[12px] text-muted">
                    {step.summary}
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={cn(
                    "mt-1 shrink-0 text-muted transition-transform",
                    open && "rotate-180",
                  )}
                />
              </button>
            </div>
            {open ? (
              <div className="space-y-2 border-t border-border px-4 py-3">
                {step.body.map((para, i) => (
                  <p key={i} className="text-[13px] leading-relaxed text-ink">
                    {para}
                  </p>
                ))}
                {isConnectStep ? (
                  <Link
                    href="/settings/accounts"
                    className="mt-2 inline-block rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-white"
                  >
                    Go to Connect a bank
                  </Link>
                ) : null}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
