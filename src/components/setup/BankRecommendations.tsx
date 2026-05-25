import { ExternalLink } from "lucide-react";
import { BANK_RECOMMENDATIONS, BIG_BANKS } from "@/lib/setup/content";

export function BankRecommendations() {
  return (
    <div className="space-y-2">
      {BANK_RECOMMENDATIONS.map((bank) => (
        <a
          key={bank.name}
          href={bank.url}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
              {bank.name}
              <ExternalLink size={13} className="text-muted" />
            </div>
            <p className="mt-1 text-[13px] text-muted">{bank.why}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

export function BigBankInstructions() {
  return (
    <div className="space-y-3">
      {BIG_BANKS.map((bank) => (
        <div
          key={bank.name}
          className="rounded-2xl border border-border bg-surface p-4 shadow-card"
        >
          <div className="text-[15px] font-semibold text-ink">{bank.name}</div>
          <div className="mt-2">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Open a second checking
            </div>
            <p className="mt-1 text-[13px] text-ink">{bank.openSecond}</p>
          </div>
          <div className="mt-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Set up split direct deposit
            </div>
            <p className="mt-1 text-[13px] text-ink">{bank.splitDeposit}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
