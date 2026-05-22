"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, RefreshCw, SlidersHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptic";
import { AccountMappingSheet } from "./AccountMappingSheet";

type PlaidAccount = {
  plaid_account_id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  balance: number;
};

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
  const [isLoadingMapping, startMapping] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [remap, setRemap] = useState<{
    accounts: PlaidAccount[];
    current: Record<string, string>;
  } | null>(null);

  const busy = isSyncing || isUnlinking || isLoadingMapping;

  const sync = () => {
    setError(null);
    setNotice(null);
    haptic();
    startSync(async () => {
      try {
        const res = await fetch("/api/plaid/sync", { method: "POST" });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || body.ok === false) {
          setError(body.error ?? "Sync failed");
          return;
        }
        haptic(15);
        const added = Number(body.added ?? 0);
        const fetched = Number(body.fetched ?? 0);
        const skipped = Number(body.skippedUnmapped ?? 0);
        // Self-diagnosing message: distinguish "Plaid sent nothing" from
        // "sent data but nothing matched a mapped account" from success.
        if (added > 0) {
          setNotice(
            `Imported ${added} transaction${added === 1 ? "" : "s"}.`,
          );
        } else if (fetched === 0) {
          setNotice(
            "Plaid returned 0 transactions. If you just connected, wait ~30s and sync again.",
          );
        } else if (skipped > 0) {
          setNotice(
            `Plaid sent ${fetched} transaction${fetched === 1 ? "" : "s"}, but none were on a mapped account. Use "Change accounts" to map your Checking/Savings.`,
          );
        } else {
          setNotice("Up to date — no new transactions.");
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sync failed");
      }
    });
  };

  const changeAccounts = () => {
    setError(null);
    setNotice(null);
    startMapping(async () => {
      try {
        const res = await fetch("/api/plaid/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bank_link_id: bankLinkId }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(body.error ?? "Could not load accounts");
          return;
        }
        setRemap({ accounts: body.accounts ?? [], current: body.current ?? {} });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load accounts");
      }
    });
  };

  const unlink = () => {
    if (
      !confirm("Unlink this bank? Past transactions stay; new ones stop syncing.")
    ) {
      return;
    }
    setError(null);
    setNotice(null);
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
          disabled={busy}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-bg px-3 py-2 text-[13px] font-medium text-ink transition-opacity",
            busy && "opacity-60",
          )}
        >
          <RefreshCw
            size={14}
            className={isSyncing ? "animate-spin" : undefined}
          />
          {isSyncing ? "Syncing…" : "Sync now"}
        </button>
        <button
          type="button"
          onClick={changeAccounts}
          disabled={busy}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-bg px-3 py-2 text-[13px] font-medium text-ink transition-opacity",
            busy && "opacity-60",
          )}
        >
          <SlidersHorizontal size={14} />
          {isLoadingMapping ? "Loading…" : "Change accounts"}
        </button>
        <button
          type="button"
          onClick={unlink}
          disabled={busy}
          aria-label="Unlink bank"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-bg text-danger transition-opacity",
            busy && "opacity-60",
          )}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {error ? (
        <div className="mt-2 text-[12px] text-danger">{error}</div>
      ) : null}
      {notice ? (
        <div className="mt-2 text-[12px] text-primary">{notice}</div>
      ) : null}

      {remap ? (
        <AccountMappingSheet
          bankLinkId={bankLinkId}
          institutionName={institutionName}
          plaidAccounts={remap.accounts}
          initialAssignments={remap.current}
          onClose={() => {
            setRemap(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
