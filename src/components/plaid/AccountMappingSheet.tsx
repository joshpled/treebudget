"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";

type PlaidAccount = {
  plaid_account_id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  balance: number;
};

type Kind = "bills" | "spending" | "savings" | "skip";

type Props = {
  bankLinkId: string;
  institutionName: string | null;
  plaidAccounts: PlaidAccount[];
  onClose: () => void;
};

function autoSuggest(a: PlaidAccount): Kind {
  if (a.subtype === "savings") return "savings";
  if (a.subtype === "checking") {
    // Two checkings: first becomes bills, second becomes spending. We'll
    // disambiguate by name heuristic.
    if (/spend|debit|every|daily/i.test(a.name)) return "spending";
    return "bills";
  }
  return "skip";
}

export function AccountMappingSheet({
  bankLinkId,
  institutionName,
  plaidAccounts,
  onClose,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<Record<string, Kind>>(() => {
    const out: Record<string, Kind> = {};
    const usedKinds = new Set<Kind>();
    for (const a of plaidAccounts) {
      let suggestion = autoSuggest(a);
      if (suggestion !== "skip" && usedKinds.has(suggestion)) {
        suggestion = "skip";
      }
      out[a.plaid_account_id] = suggestion;
      if (suggestion !== "skip") usedKinds.add(suggestion);
    }
    return out;
  });

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

  const setKind = (id: string, kind: Kind) => {
    setAssignments((prev) => {
      const next = { ...prev };
      if (kind !== "skip") {
        // Ensure exclusivity: only one Plaid account per budget kind.
        for (const k of Object.keys(next)) {
          if (k !== id && next[k] === kind) next[k] = "skip";
        }
      }
      next[id] = kind;
      return next;
    });
  };

  const onSave = () => {
    setError(null);
    const mappings = plaidAccounts
      .map((a) => ({
        plaid_account_id: a.plaid_account_id,
        kind: assignments[a.plaid_account_id],
        name: a.official_name ?? a.name,
      }))
      .filter((m): m is { plaid_account_id: string; kind: "bills" | "spending" | "savings"; name: string } =>
        m.kind !== "skip",
      );

    if (mappings.length === 0) {
      setError("Pick at least one account to link.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/plaid/exchange", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bank_link_id: bankLinkId, mappings }),
        });
        const body = await res.json();
        if (!res.ok) {
          setError(body.error ?? "Could not save mapping");
          return;
        }
        router.refresh();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
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
            {institutionName ?? "Connected bank"}
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

        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4 pt-4">
          <p className="text-[13px] text-muted">
            Map each real account to a treebudget bucket. Transactions on a
            linked account will sync automatically.
          </p>

          {plaidAccounts.map((a) => (
            <div
              key={a.plaid_account_id}
              className="space-y-2 rounded-2xl border border-border bg-surface p-3 shadow-card"
            >
              <div className="flex items-baseline justify-between">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium text-ink">
                    {a.official_name ?? a.name}
                  </div>
                  <div className="text-[11px] uppercase tracking-wide text-muted">
                    {a.subtype ?? a.type}
                  </div>
                </div>
                <div className="tabular text-[14px] font-semibold">
                  {formatCurrency(a.balance, { showCents: false })}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(["bills", "spending", "savings", "skip"] as Kind[]).map(
                  (k) => {
                    const active = assignments[a.plaid_account_id] === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setKind(a.plaid_account_id, k)}
                        className={cn(
                          "rounded-full border px-2 py-1.5 text-[12px] font-medium capitalize transition-colors",
                          active
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-bg text-muted hover:text-ink",
                        )}
                      >
                        {k === "skip" ? "Skip" : k}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          ))}

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
            onClick={onSave}
            disabled={isPending}
            className={cn(
              "w-full rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-semibold text-white shadow-card transition-opacity",
              isPending && "opacity-60",
            )}
          >
            {isPending ? "Linking…" : "Link & sync"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
