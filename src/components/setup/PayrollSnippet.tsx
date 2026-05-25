"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptic";

type Props = {
  billsPct: number;
  spendingPct: number;
  savingsPct: number;
};

export function PayrollSnippet({ billsPct, spendingPct, savingsPct }: Props) {
  const [copied, setCopied] = useState(false);

  const text =
    `Please split my direct deposit across the following accounts:\n` +
    `• ${billsPct}% to my Bills checking account\n` +
    `• ${spendingPct}% to my Spending checking account\n` +
    `• ${savingsPct}% to my Savings account\n\n` +
    `I will provide each account's routing and account number separately.`;

  const copy = async () => {
    haptic();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore — fall back to manual select
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[12px] font-medium uppercase tracking-wide text-muted">
          Tell HR / payroll
        </div>
        <button
          type="button"
          onClick={copy}
          className={cn(
            "flex items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1.5 text-[12px] font-medium transition-colors",
            copied ? "text-primary" : "text-ink",
          )}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-ink">
        {text}
      </pre>
    </div>
  );
}
