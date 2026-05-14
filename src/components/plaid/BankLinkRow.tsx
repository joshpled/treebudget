"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  bankLinkId: string;
  institutionName: string | null;
  status: "active" | "login_required" | "revoked";
  lastSyncedAt: string | null;
};

export function BankLinkRow({
  bankLinkId,
  institutionName,
  status,
  lastSyncedAt,
}: Props) {
  const router = useRouter();
  const [isSyncing, startSync] = useTransition();
  const [isUnlinking, startUnlink] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const sync = () => {
    setError(null);
    startSync(async () => {
      try {
        const res = await fetch("/api/plaid/sync", { method: "POST" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error ?? "Sync failed");
          return;
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sync failed");
      }
    });
  };

  const unlink = () => {
    if (!confirm("Unlink this bank? Past transactions stay; new ones stop syncing.")) {
      return;
    }
    setError(null);
    startUnlink(async () => {
      try {
        const res = await fetch("/api/plaid/unlink", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bank_link_id: bankLinkId }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error ?? "Unlink failed");
          return;
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unlink failed");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
          <Building2 size={18} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-ink">
            {institutionName ?? "Connected bank"}
            {status === "login_required" ? (
              <span className="ml-2 rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-semibold text-danger">
                Reconnect
              </span>
            ) : null}
          </div>
          <div className="text-[12px] text-muted">
            {lastSyncedAt
              ? `Synced ${new Date(lastSyncedAt).toLocaleString()}`
              : "Not yet synced"}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={sync}
          disabled={isSyncing || isUnlinking}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-bg px-3 py-2 text-[13px] font-medium text-ink transition-opacity",
            (isSyncing || isUnlinking) && "opacity-60",
          )}
        >
          <RefreshCw size={14} className={isSyncing ? "animate-spin" : undefined} />
          {isSyncing ? "Syncing…" : "Sync now"}
        </button>
        <button
          type="button"
          onClick={unlink}
          disabled={isSyncing || isUnlinking}
          aria-label="Unlink bank"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg text-danger transition-opacity",
            (isSyncing || isUnlinking) && "opacity-60",
          )}
        >
          <Trash2 size={14} />
        </button>
      </div>
      {error ? (
        <div className="mt-2 text-[12px] text-danger">{error}</div>
      ) : null}
    </div>
  );
}
