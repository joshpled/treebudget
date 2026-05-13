"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { Account } from "@/lib/types";
import { TRANSACTION_CATEGORIES } from "@/lib/types";
import { addTransaction } from "@/app/actions/budget";
import { cn } from "@/lib/cn";

type Props = {
  accounts: Account[];
  onClose: () => void;
  defaultAccountId?: string;
};

type Direction = "spend" | "income";

export function AddTransactionSheet({
  accounts,
  onClose,
  defaultAccountId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [accountId, setAccountId] = useState(
    defaultAccountId ?? accounts[0]?.id ?? "",
  );
  const [direction, setDirection] = useState<Direction>("spend");
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState<string>("Other");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Lock body scroll while open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    setError(null);
    const parsed = Number(amount);
    if (!parsed || isNaN(parsed)) {
      setError("Enter a valid amount.");
      return;
    }
    if (!merchant.trim()) {
      setError("Merchant is required.");
      return;
    }
    if (!accountId) {
      setError("Pick an account.");
      return;
    }
    const signed = direction === "spend" ? -Math.abs(parsed) : Math.abs(parsed);
    startTransition(async () => {
      try {
        await addTransaction({
          account_id: accountId,
          merchant: merchant.trim(),
          category,
          amount: signed,
          note: note.trim() || undefined,
        });
        router.refresh();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save.");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-md flex-col rounded-t-3xl bg-bg shadow-card"
        style={{ maxHeight: "85svh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-border bg-bg px-4 py-3">
          <span className="text-[15px] font-semibold">Add transaction</span>
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
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface p-1">
            <Toggle
              active={direction === "spend"}
              onClick={() => setDirection("spend")}
            >
              Spend
            </Toggle>
            <Toggle
              active={direction === "income"}
              onClick={() => setDirection("income")}
            >
              Income
            </Toggle>
          </div>

          <div className="rounded-2xl border border-border bg-surface px-4 py-3 shadow-card focus-within:border-primary">
            <div className="text-[12px] font-medium uppercase tracking-wide text-muted">
              Amount
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[24px] font-semibold text-muted">$</span>
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                }
                placeholder="0.00"
                className="tabular w-full bg-transparent text-[28px] font-semibold leading-none focus:outline-none"
              />
            </div>
          </div>

          <Field label="Merchant">
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Trader Joe's"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] shadow-card focus:border-primary focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Account">
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-3 py-3 text-[15px] shadow-card focus:border-primary focus:outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-3 py-3 text-[15px] shadow-card focus:border-primary focus:outline-none"
              >
                {TRANSACTION_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Note (optional)">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] shadow-card focus:border-primary focus:outline-none"
            />
          </Field>

          {error ? (
            <div className="rounded-2xl border border-danger/40 bg-danger/5 px-4 py-2.5 text-[13px] text-danger">
              {error}
            </div>
          ) : null}
        </div>

        <div
          className="border-t border-border bg-bg px-4 pb-4 pt-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
        >
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className={cn(
              "w-full rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-semibold text-white shadow-card transition-opacity",
              isPending && "opacity-60",
            )}
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({
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
      onClick={onClick}
      className={cn(
        "rounded-xl px-3 py-2 text-[14px] font-medium transition-colors",
        active ? "bg-primary text-white" : "text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
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
