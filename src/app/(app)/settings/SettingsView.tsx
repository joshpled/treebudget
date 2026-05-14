import Link from "next/link";
import {
  ChevronRight,
  Banknote,
  Wallet,
  Link2,
  Bell,
  Moon,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { SignOutButton } from "@/components/auth/SignOutButton";
import type { Account } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/format";

type Item = {
  href?: string;
  icon: LucideIcon;
  label: string;
  hint?: string;
  trailing?: string;
  disabled?: boolean;
};

type Props = {
  displayName: string;
  email: string | null;
  income: number;
  accounts: Account[];
};

export function SettingsView({ displayName, email, income, accounts }: Props) {
  const bills = accounts.find((a) => a.kind === "bills");
  const spending = accounts.find((a) => a.kind === "spending");
  const savings = accounts.find((a) => a.kind === "savings");

  const moneySection: Item[] = [
    {
      href: "/settings/split",
      icon: Banknote,
      label: "Income & split",
      hint: `${formatCurrency(income, { showCents: false })}/mo`,
      trailing: `${formatPercent(Number(bills?.allocation ?? 0))} · ${formatPercent(Number(spending?.allocation ?? 0))} · ${formatPercent(Number(savings?.allocation ?? 0))}`,
    },
    {
      href: "/settings/accounts",
      icon: Wallet,
      label: "Accounts",
      hint: `${accounts.length} accounts`,
    },
    {
      href: "/settings/accounts",
      icon: Link2,
      label: "Connect a bank",
      hint: "Powered by Plaid",
    },
  ];

  const appSection: Item[] = [
    { icon: Bell, label: "Notifications", disabled: true },
    { icon: Moon, label: "Appearance", trailing: "System", disabled: true },
    { icon: ShieldCheck, label: "Privacy & security", disabled: true },
    { icon: HelpCircle, label: "Help & feedback", disabled: true },
  ];

  return (
    <>
      <TopBar />
      <PageHeader
        eyebrow="You"
        title={displayName}
        subtitle={email ?? "Personal preferences and account setup."}
      />

      <Section title="Money">
        {moneySection.map((item) => (
          <Row key={item.label} item={item} />
        ))}
      </Section>

      <Section title="App">
        {appSection.map((item) => (
          <Row key={item.label} item={item} />
        ))}
      </Section>

      <Section title="Account">
        <SignOutButton />
      </Section>

      <p className="px-4 pb-8 pt-2 text-center text-[12px] text-muted">
        treebudget · v0.2
      </p>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 pb-4">
      <h2 className="px-1 pb-2 text-[12px] font-medium uppercase tracking-wide text-muted">
        {title}
      </h2>
      <div className="divide-y divide-border rounded-2xl border border-border bg-surface shadow-card">
        {children}
      </div>
    </section>
  );
}

function Row({ item }: { item: Item }) {
  const Icon = item.icon;
  const content = (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
        <Icon size={17} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-ink">{item.label}</div>
        {item.hint ? (
          <div className="text-[12px] text-muted">{item.hint}</div>
        ) : null}
      </div>
      {item.trailing ? (
        <span className="text-[12px] text-muted">{item.trailing}</span>
      ) : null}
      {item.href && !item.disabled ? (
        <ChevronRight size={16} className="text-muted" />
      ) : null}
    </div>
  );
  if (item.href && !item.disabled) {
    return <Link href={item.href}>{content}</Link>;
  }
  return (
    <div className={item.disabled ? "opacity-50" : undefined}>{content}</div>
  );
}
