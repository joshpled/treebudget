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
  Sprout,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ResetAccountButton } from "@/components/ResetAccountButton";
import { DemoDataButton } from "@/components/DemoDataButton";
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
    {
      href: "/setup",
      icon: Sprout,
      label: "Make it real at your bank",
      hint: "Setup guide + payroll snippet",
    },
  ];

  const appSection: Item[] = [
    { href: "/settings/notifications", icon: Bell, label: "Notifications" },
    { icon: Moon, label: "Appearance", trailing: "System", disabled: true },
    { icon: ShieldCheck, label: "Privacy & security", disabled: true },
    { icon: HelpCircle, label: "Help & feedback", disabled: true },
  ];

  return (
    <>
      <TopBar />
      <div className="mx-auto w-full max-w-md lg:max-w-5xl lg:px-8">
        <PageHeader
          eyebrow="You"
          title={displayName}
          subtitle={email ?? "Personal preferences and account setup."}
        />

        <div className="grid gap-0 lg:grid-cols-2 lg:gap-x-6">
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

          <div className="lg:col-span-2">
            <Section title="Account">
              <SignOutButton />
              <DemoDataButton />
              <ResetAccountButton />
            </Section>
          </div>
        </div>

        <p className="px-4 pb-8 pt-2 text-center text-[12px] text-muted">
          treebudget · v0.2
        </p>
      </div>
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
