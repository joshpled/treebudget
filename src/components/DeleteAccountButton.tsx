"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteAccount } from "@/app/actions/account";
import { Spinner } from "@/components/Spinner";
import { haptic } from "@/lib/haptic";
import { cn } from "@/lib/cn";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const armed = typed.trim().toUpperCase() === "DELETE";

  const remove = () => {
    if (!armed) return;
    setError(null);
    haptic(30);
    startTransition(async () => {
      try {
        await deleteAccount();
        // deleteAccount signs out and redirects to "/" on success.
      } catch (err) {
        setError(err instanceof Error ? err.message : "Deletion failed.");
      }
    });
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-medium text-danger"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-danger/10 text-danger">
          <Trash2 size={17} strokeWidth={1.8} />
        </div>
        <span>Delete account</span>
      </button>
    );
  }

  return (
    <div className="px-4 py-3">
      <p className="text-[13px] text-ink">
        This permanently deletes your account, all your data, and your login.
        Any active subscription is cancelled and connected banks are
        disconnected. This cannot be undone.
      </p>
      <label className="mt-3 block text-[12px] font-medium text-muted">
        Type <span className="font-semibold text-ink">DELETE</span> to confirm
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoFocus
          autoComplete="off"
          className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-[14px] text-ink outline-none focus:border-danger"
        />
      </label>
      {error ? (
        <p className="mt-2 text-[12px] text-danger">{error}</p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={remove}
          disabled={isPending || !armed}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full bg-danger px-3 py-2.5 text-[13px] font-semibold text-white transition-opacity",
            (isPending || !armed) && "opacity-50",
          )}
        >
          {isPending ? <Spinner size={14} /> : null}
          {isPending ? "Deleting…" : "Permanently delete account"}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setTyped("");
            setError(null);
          }}
          disabled={isPending}
          className="rounded-full border border-border bg-bg px-4 py-2.5 text-[13px] font-medium text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
