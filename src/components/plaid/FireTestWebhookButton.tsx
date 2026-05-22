"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Webhook } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import { haptic } from "@/lib/haptic";
import { cn } from "@/lib/cn";

// Sandbox-only: fires a real Plaid webhook at /api/plaid/webhook so the
// whole automatic-sync path can be verified.
export function FireTestWebhookButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fire = () => {
    setError(null);
    setNotice(null);
    haptic();
    startTransition(async () => {
      try {
        const res = await fetch("/api/plaid/fire-test-webhook", {
          method: "POST",
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(body.error ?? "Could not fire test webhook");
          return;
        }
        haptic(15);
        setNotice(
          "Webhook fired. Plaid is calling /api/plaid/webhook now — watch Vercel's Live logs for a 200. New transactions sync automatically; refresh in a few seconds.",
        );
        // Give the webhook a moment to land, then refresh.
        setTimeout(() => router.refresh(), 4000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not fire webhook");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-dashed border-border bg-transparent p-3">
      <button
        type="button"
        onClick={fire}
        disabled={isPending}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-full border border-border bg-bg px-3 py-2 text-[13px] font-medium text-ink transition-opacity",
          isPending && "opacity-60",
        )}
      >
        {isPending ? <Spinner size={14} /> : <Webhook size={14} />}
        {isPending ? "Firing…" : "Fire test webhook (sandbox)"}
      </button>
      {error ? (
        <div className="mt-2 text-[12px] text-danger">{error}</div>
      ) : null}
      {notice ? (
        <div className="mt-2 text-[12px] text-primary">{notice}</div>
      ) : null}
    </div>
  );
}
