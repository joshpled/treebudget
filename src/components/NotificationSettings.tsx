"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, XCircle } from "lucide-react";

function urlBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer as ArrayBuffer;
}

type Status = "loading" | "unsupported" | "denied" | "default" | "subscribed";

export function NotificationSettings() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "subscribed" : "default"))
      .catch(() => setStatus("default"));
  }, []);

  async function subscribe() {
    setBusy(true);
    setMessage(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus("denied");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (res.ok) {
        setStatus("subscribed");
        setMessage("Notifications enabled on this device.");
      } else {
        setMessage("Failed to save subscription.");
      }
    } catch {
      setMessage("Could not subscribe. Check VAPID keys are set.");
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setStatus("default");
      setMessage("Notifications disabled.");
    } catch {
      setMessage("Failed to unsubscribe.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <div className="divide-y divide-border rounded-2xl border border-border bg-surface shadow-card">
        {status === "unsupported" && (
          <div className="px-4 py-4 text-[14px] text-muted">
            Push notifications not supported in this browser.
          </div>
        )}

        {status === "denied" && (
          <div className="flex items-start gap-3 px-4 py-4">
            <XCircle size={18} className="mt-0.5 shrink-0 text-danger" />
            <div>
              <p className="text-[14px] font-medium text-ink">
                Notifications blocked
              </p>
              <p className="mt-0.5 text-[12px] text-muted">
                Allow notifications for this site in your browser settings, then
                reload.
              </p>
            </div>
          </div>
        )}

        {(status === "default" ||
          status === "subscribed" ||
          status === "loading") && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
              {status === "subscribed" ? (
                <Bell size={17} strokeWidth={1.8} />
              ) : (
                <BellOff size={17} strokeWidth={1.8} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium text-ink">
                Push notifications
              </div>
              <div className="text-[12px] text-muted">
                {status === "loading"
                  ? "Checking…"
                  : status === "subscribed"
                    ? "Enabled on this device"
                    : "Disabled"}
              </div>
            </div>
            {status !== "loading" && (
              <button
                onClick={status === "subscribed" ? unsubscribe : subscribe}
                disabled={busy}
                className={[
                  "rounded-full px-4 py-1.5 text-[13px] font-medium transition-opacity disabled:opacity-50",
                  status === "subscribed"
                    ? "border border-border bg-bg text-muted"
                    : "bg-primary text-white",
                ].join(" ")}
              >
                {busy ? "…" : status === "subscribed" ? "Turn off" : "Turn on"}
              </button>
            )}
          </div>
        )}

        {message && (
          <div className="px-4 py-3 text-[12px] text-muted">{message}</div>
        )}
      </div>
    </div>
  );
}
