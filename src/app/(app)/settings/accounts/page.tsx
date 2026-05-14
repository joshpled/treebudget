import { CreditCard, Sprout, Receipt, TrendingUp, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { PlaidLinkButton } from "@/components/plaid/PlaidLinkButton";
import { BankLinkRow } from "@/components/plaid/BankLinkRow";
import { listAccounts } from "@/lib/db/accounts";
import { listBankLinks } from "@/lib/db/bank_links";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { AccountKind } from "@/lib/types";

const ICONS: Record<AccountKind, LucideIcon> = {
  bills: Receipt,
  spending: CreditCard,
  savings: Sprout,
  investment: TrendingUp,
  other: Receipt,
};

export default async function AccountsPage() {
  const [accounts, links] = await Promise.all([
    listAccounts(),
    listBankLinks(),
  ]);

  return (
    <>
      <TopBar back={{ href: "/settings", label: "Settings" }} title="Accounts" />
      <PageHeader
        eyebrow="Setup"
        title="Your accounts"
        subtitle="The 3 core accounts power the auto-split. Connect a bank to sync transactions."
      />

      <section className="px-4 pb-4">
        <h2 className="px-1 pb-2 text-[12px] font-medium uppercase tracking-wide text-muted">
          Core accounts
        </h2>
        <div className="space-y-2">
          {accounts.map((a) => {
            const Icon = ICONS[a.kind];
            const linked = a.plaid_account_id !== null;
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-ink">
                    {a.name}
                    {a.is_card ? (
                      <span className="ml-2 rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary-ink">
                        Card
                      </span>
                    ) : null}
                    {linked ? (
                      <span className="ml-2 rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary-ink">
                        Linked
                      </span>
                    ) : null}
                  </div>
                  <div className="text-[12px] text-muted capitalize">
                    {a.kind} · {formatPercent(Number(a.allocation))} of income
                  </div>
                </div>
                <div className="tabular text-[14px] font-semibold">
                  {formatCurrency(Number(a.balance), { showCents: false })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4 pb-4">
        <h2 className="px-1 pb-2 text-[12px] font-medium uppercase tracking-wide text-muted">
          Bank sync
        </h2>
        <div className="space-y-2">
          {links.map((link) => (
            <BankLinkRow
              key={link.id}
              bankLinkId={link.id}
              institutionName={link.institution_name}
              status={link.status}
              lastSyncedAt={link.last_synced_at}
            />
          ))}
          <PlaidLinkButton
            label={links.length === 0 ? "Connect a bank" : "Connect another bank"}
          />
        </div>
      </section>

      <section className="px-4 pb-8">
        <h2 className="px-1 pb-2 text-[12px] font-medium uppercase tracking-wide text-muted">
          Add more
        </h2>
        <div className="space-y-2">
          <AddOption
            icon={TrendingUp}
            title="Investment account"
            subtitle="Brokerage, retirement, crypto"
          />
          <AddOption
            icon={Receipt}
            title="Additional checking"
            subtitle="Joint account, side income, etc."
          />
          <AddOption
            icon={Sprout}
            title="Sub-savings"
            subtitle="Earmark a goal under Savings"
          />
        </div>
      </section>
    </>
  );
}

function AddOption({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-transparent px-4 py-3 text-left transition-colors hover:border-primary"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-ink">{title}</div>
        <div className="text-[12px] text-muted">{subtitle}</div>
      </div>
      <Plus size={16} className="text-muted" />
    </button>
  );
}
