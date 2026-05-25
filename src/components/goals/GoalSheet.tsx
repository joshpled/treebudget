"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Trash2 } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { createGoal, updateGoal, deleteGoal } from "@/app/actions/goals";
import { haptic } from "@/lib/haptic";
import { cn } from "@/lib/cn";
import type { Goal } from "@/lib/types";

type Props = {
  goal?: Goal;
  onClose: () => void;
};

export function GoalSheet({ goal, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState(goal?.name ?? "");
  const [target, setTarget] = useState(
    goal ? String(goal.target_amount) : "",
  );
  const [current, setCurrent] = useState(
    goal ? String(goal.current_amount) : "0",
  );
  const [due, setDue] = useState(goal?.due_date?.slice(0, 10) ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = () => {
    setError(null);
    const targetNum = Number(target);
    const currentNum = Number(current);
    if (!name.trim()) return setError("Name is required.");
    if (!targetNum || targetNum <= 0) {
      return setError("Target must be a positive number.");
    }
    if (currentNum < 0) return setError("Current can't be negative.");
    haptic();
    startTransition(async () => {
      try {
        if (goal) {
          await updateGoal({
            id: goal.id,
            name: name.trim(),
            target_amount: targetNum,
            current_amount: currentNum,
            due_date: due || null,
          });
        } else {
          await createGoal({
            name: name.trim(),
            target_amount: targetNum,
            current_amount: currentNum,
            due_date: due || null,
          });
        }
        haptic(15);
        router.refresh();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed.");
      }
    });
  };

  const remove = () => {
    if (!goal) return;
    if (!confirm("Delete this goal? This can't be undone.")) return;
    startDelete(async () => {
      try {
        await deleteGoal(goal.id);
        router.refresh();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed.");
      }
    });
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="animate-sheet-backdrop fixed inset-0 z-50 flex items-end justify-center bg-ink/40"
      onClick={onClose}
    >
      <div
        className="animate-sheet-content flex w-full max-w-md flex-col rounded-t-3xl bg-bg shadow-card"
        style={{ maxHeight: "85svh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between rounded-t-3xl border-b border-border bg-bg px-4 py-3">
          <span className="text-[15px] font-semibold">
            {goal ? "Edit goal" : "New savings goal"}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4 pt-4">
          <Field label="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Emergency fund"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] shadow-card focus:border-primary focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Target ($)">
              <input
                type="text"
                inputMode="decimal"
                value={target}
                onChange={(e) =>
                  setTarget(e.target.value.replace(/[^0-9.]/g, ""))
                }
                placeholder="12000"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] shadow-card focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Saved so far ($)">
              <input
                type="text"
                inputMode="decimal"
                value={current}
                onChange={(e) =>
                  setCurrent(e.target.value.replace(/[^0-9.]/g, ""))
                }
                placeholder="0"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] shadow-card focus:border-primary focus:outline-none"
              />
            </Field>
          </div>

          <Field label="Target date (optional)">
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] shadow-card focus:border-primary focus:outline-none"
            />
          </Field>

          {error ? (
            <div className="rounded-2xl border border-danger/40 bg-danger/5 px-4 py-2.5 text-[13px] text-danger">
              {error}
            </div>
          ) : null}

          {goal ? (
            <button
              type="button"
              onClick={remove}
              disabled={isPending || isDeleting}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-2xl border border-danger/40 bg-danger/5 px-4 py-2.5 text-[13px] font-medium text-danger transition-opacity",
                (isPending || isDeleting) && "opacity-60",
              )}
            >
              {isDeleting ? <Spinner size={14} /> : <Trash2 size={14} />}
              {isDeleting ? "Deleting…" : "Delete goal"}
            </button>
          ) : null}
        </div>

        <div
          className="border-t border-border bg-bg px-4 pb-4 pt-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
        >
          <button
            type="button"
            onClick={save}
            disabled={isPending || isDeleting}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-semibold text-white shadow-card transition-opacity",
              (isPending || isDeleting) && "opacity-70",
            )}
          >
            {isPending ? <Spinner /> : null}
            {isPending ? "Saving…" : goal ? "Save changes" : "Create goal"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
