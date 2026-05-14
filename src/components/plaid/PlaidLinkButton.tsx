"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink, type PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import { Link2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { AccountMappingSheet } from "./AccountMappingSheet";

type PlaidAccount = {
  plaid_account_id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  balance: number;
};

type ExchangeResult = {
  bank_link_id: string;
  institution_name: string | null;
  accounts: PlaidAccount[];
};

type Props = {
  className?: string;
  label?: string;
};

export function PlaidLinkButton({ className, label = "Connect a bank" }: Props) {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapping, setMapping] = useState<ExchangeResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/plaid/link-token", { method: "POST" })
      .then(async (r) => {
        const body = await r.json();
        if (cancelled) return;
        if (!r.ok || !body.link_token) {
          setError(body.error ?? "Could not start Plaid");
          return;
        }
        setLinkToken(body.link_token);
      })
      .catch((err) => !cancelled && setError(String(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const onSuccess = useCallback(
    async (public_token: string, meta: PlaidLinkOnSuccessMetadata) => {
      setError(null);
      try {
        const res = await fetch("/api/plaid/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_token,
            institution: meta.institution
              ? {
                  institution_id: meta.institution.institution_id,
                  name: meta.institution.name,
                }
              : undefined,
            accounts: meta.accounts.map((a) => ({
              id: a.id,
              name: a.name,
              type: a.type,
              subtype: a.subtype,
            })),
          }),
        });
        const body = (await res.json()) as ExchangeResult | { error: string };
        if (!res.ok) {
          setError("error" in body ? body.error : "Link failed");
          return;
        }
        setMapping(body as ExchangeResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Link failed");
      }
    },
    [],
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  const disabled = !ready || loading || !linkToken;

  return (
    <>
      <button
        type="button"
        onClick={() => (ready ? open() : null)}
        disabled={disabled}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-left transition-colors disabled:opacity-50",
          !disabled && "hover:border-primary",
          className,
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
          <Link2 size={18} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-ink">{label}</div>
          <div className="text-[12px] text-muted">
            {loading
              ? "Preparing secure connection…"
              : error
                ? error
                : "Powered by Plaid · sandbox: user_good / pass_good"}
          </div>
        </div>
      </button>
      {mapping ? (
        <AccountMappingSheet
          bankLinkId={mapping.bank_link_id}
          institutionName={mapping.institution_name}
          plaidAccounts={mapping.accounts}
          onClose={() => {
            setMapping(null);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}
