"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

type State = "idle" | "sending" | "sent" | "no-sub" | "error";

export function PushTestButton() {
  const [state, setState] = useState<State>("idle");

  async function send() {
    setState("sending");
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "treebudget",
          body: "Test notification — everything works 🌳",
          url: "/dashboard",
        }),
      });
      if (res.status === 404) {
        setState("no-sub");
      } else if (res.ok) {
        setState("sent");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 4000);
  }

  const label =
    state === "sending"
      ? "Sending…"
      : state === "sent"
        ? "Sent!"
        : state === "no-sub"
          ? "No subscription — enable in Settings → Notifications"
          : state === "error"
            ? "Error sending"
            : "Test notification";

  return (
    <button
      onClick={send}
      disabled={state === "sending"}
      className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-medium text-ink shadow-card transition-opacity disabled:opacity-50"
    >
      <Bell size={14} className="shrink-0 text-primary" />
      <span>{label}</span>
    </button>
  );
}
