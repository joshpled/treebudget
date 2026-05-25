import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Receipt,
  Sprout,
  PiggyBank,
  Sparkles,
  ShieldCheck,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "treebudget — Budget without the spreadsheet",
  description:
    "Three accounts, one card, no math. treebudget splits every paycheck across Bills, Spending, and Savings so you always know what you can spend.",
};

export default function LandingPage() {
  return (
    <>
      {/* HERO */}
      <section className="hero-glow relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-24 lg:px-8 lg:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="rise inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-[12px] font-medium text-muted backdrop-blur">
                <Sparkles size={14} className="text-primary" />
                Built around a simple three-account model
              </div>
              <h1 className="rise rise-delay-1 mt-5 text-balance text-[40px] font-semibold leading-[1.05] tracking-tight text-ink sm:text-[56px] lg:text-[64px]">
                Budget without the{" "}
                <span className="text-primary">spreadsheet.</span>
              </h1>
              <p className="rise rise-delay-2 mt-5 max-w-xl text-pretty text-[16px] leading-relaxed text-muted sm:text-[18px]">
                treebudget splits every paycheck across <strong>Bills</strong>,{" "}
                <strong>Spending</strong>, and <strong>Savings</strong>. Carry
                one card. The balance is your limit. No math, no envelopes,
                no overdraft surprises.
              </p>
              <div className="rise rise-delay-3 mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[15px] font-semibold text-white shadow-card transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get started — it&apos;s $9.99/mo
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-full border border-border bg-surface px-6 py-3 text-[15px] font-semibold text-ink hover:border-primary"
                >
                  See pricing
                </Link>
              </div>
              <p className="rise rise-delay-4 mt-4 text-[13px] text-muted">
                7-day free preview · Cancel anytime · Read-only bank sync
              </p>
            </div>

            <div className="rise rise-delay-2 lg:col-span-5">
              <HeroPhonePreview />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-border/60 bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[12px] font-medium uppercase tracking-wider text-primary">
              How it works
            </div>
            <h2 className="mt-2 text-[28px] font-semibold tracking-tight sm:text-[36px]">
              Three accounts. One card. Less stress.
            </h2>
            <p className="mt-3 text-[15px] text-muted">
              The whole system fits on one screen. You set the percentages
              once; treebudget does the rest.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <HowItWorksStep
              n={1}
              icon={Banknote}
              title="Set your split"
              body="Choose what share of every paycheck goes to Bills, Spending, and Savings. The classic is 50/30/20 — tweak it to fit your life."
            />
            <HowItWorksStep
              n={2}
              icon={CreditCard}
              title="Carry one card"
              body="The Spending card balance is your real spending limit for the week. When it's gone, it's gone — no spreadsheets, no shame."
            />
            <HowItWorksStep
              n={3}
              icon={Sprout}
              title="Watch Savings grow"
              body="Bills and Savings hum along in the background. Income arrives, splits itself, and Savings climbs without you thinking about it."
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="text-[12px] font-medium uppercase tracking-wider text-primary">
                What you get
              </div>
              <h2 className="mt-2 text-[28px] font-semibold tracking-tight sm:text-[36px]">
                A calm, focused money app — not a chore.
              </h2>
              <p className="mt-3 text-[15px] text-muted">
                Built mobile-first, gorgeous on desktop. Everything important
                in two taps.
              </p>
              <ul className="mt-6 space-y-3">
                <Feature
                  icon={ShieldCheck}
                  text="Bank sync via Plaid — read-only by design, your money never moves on its own."
                />
                <Feature
                  icon={Receipt}
                  text="Auto-categorized transactions across all three accounts in one feed."
                />
                <Feature
                  icon={PiggyBank}
                  text="Savings goals with progress rings — set targets, see them fill."
                />
                <Feature
                  icon={Sparkles}
                  text="Onboarding that actually teaches the model — and a step-by-step setup guide for making the splits real at your bank."
                />
              </ul>
            </div>

            <FeatureCardCluster />
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="border-t border-border/60 bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center lg:px-8">
          <div className="text-[12px] font-medium uppercase tracking-wider text-primary">
            One plan, full access
          </div>
          <h2 className="mt-2 text-[28px] font-semibold tracking-tight sm:text-[36px]">
            $9.99/month or $99/year.
          </h2>
          <p className="mt-3 text-[15px] text-muted">
            Everything in treebudget. Bank sync, unlimited transactions,
            unlimited goals, all the calm.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[15px] font-semibold text-white shadow-card transition-transform hover:scale-[1.02]"
            >
              Get started
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-border bg-bg px-6 py-3 text-[15px] font-semibold text-ink hover:border-primary"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- bits ---------- */

function HowItWorksStep({
  n,
  icon: Icon,
  title,
  body,
}: {
  n: number;
  icon: typeof Banknote;
  title: string;
  body: string;
}) {
  return (
    <div className="card-lift rounded-2xl border border-border bg-bg p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <span className="text-[12px] font-medium uppercase tracking-wide text-muted">
          Step {n}
        </span>
      </div>
      <h3 className="mt-4 text-[18px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function Feature({
  icon: Icon,
  text,
}: {
  icon: typeof ShieldCheck;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
        <Icon size={15} strokeWidth={1.8} />
      </div>
      <span className="text-[14px] leading-relaxed text-ink">{text}</span>
    </li>
  );
}

function HeroPhonePreview() {
  return (
    <div className="card-lift relative mx-auto w-full max-w-sm rounded-[36px] border border-border bg-surface p-3 shadow-card lg:max-w-md">
      <div className="rounded-[28px] bg-bg p-4">
        <div className="flex items-center justify-between pb-3">
          <div className="text-[12px] text-muted">Good morning, Sam.</div>
          <div className="h-7 w-7 rounded-full bg-primary-soft" />
        </div>
        <div className="text-[11px] uppercase tracking-wide text-muted">
          Total balance
        </div>
        <div className="tabular text-[36px] font-semibold leading-none">
          $8,420.50
        </div>

        <div className="mt-5 space-y-2">
          <PreviewAccountCard
            name="Bills"
            balance="$1,840"
            pct="50%"
            accent="bg-muted/40"
            sub="Bills paid from here"
          />
          <PreviewAccountCard
            name="Spending"
            balance="$612"
            pct="30%"
            accent="bg-primary"
            sub="Your card · your limit"
            highlight
          />
          <PreviewAccountCard
            name="Savings"
            balance="$5,968"
            pct="20%"
            accent="bg-accent"
            sub="Quietly growing"
          />
        </div>
      </div>
    </div>
  );
}

function PreviewAccountCard({
  name,
  balance,
  pct,
  accent,
  sub,
  highlight,
}: {
  name: string;
  balance: string;
  pct: string;
  accent: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-3">
      <div className={`h-9 w-1.5 rounded-full ${accent}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-ink">{name}</span>
          <span className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary-ink">
            {pct}
          </span>
        </div>
        <div className="text-[11px] text-muted">{sub}</div>
      </div>
      <div
        className={`tabular text-[16px] font-semibold ${
          highlight ? "text-primary" : "text-ink"
        }`}
      >
        {balance}
      </div>
    </div>
  );
}

function FeatureCardCluster() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="card-lift col-span-2 rounded-2xl border border-border bg-surface p-5 shadow-card">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] font-medium uppercase tracking-wide text-muted">
            Income split
          </span>
          <span className="text-[12px] text-primary">Edit</span>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <SplitDonutPreview />
          <ul className="flex-1 space-y-2 text-[13px]">
            <SplitRow color="bg-muted/70" label="Bills" pct="50%" />
            <SplitRow color="bg-primary" label="Spending" pct="30%" />
            <SplitRow color="bg-accent" label="Savings" pct="20%" />
          </ul>
        </div>
      </div>
      <div className="card-lift rounded-2xl border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center gap-2">
          <Sprout size={16} className="text-primary" />
          <span className="text-[13px] font-semibold">Emergency fund</span>
        </div>
        <div className="tabular mt-1 text-[20px] font-semibold">
          $4,200
          <span className="text-[12px] font-normal text-muted"> / $12,000</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
          <div className="h-full w-[35%] rounded-full bg-primary" />
        </div>
      </div>
      <div className="card-lift rounded-2xl border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-primary" />
          <span className="text-[13px] font-semibold">Setup progress</span>
        </div>
        <div className="tabular mt-1 text-[20px] font-semibold">3 / 5</div>
        <p className="mt-1 text-[12px] text-muted">
          Make the splits real at your bank — a guided 5-step checklist.
        </p>
      </div>
    </div>
  );
}

function SplitDonutPreview() {
  // Simple SVG donut: bills 50%, spending 30%, savings 20%.
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <svg width={88} height={88} viewBox="0 0 88 88" className="-rotate-90">
      <circle cx={44} cy={44} r={r} fill="none" stroke="var(--border)" strokeWidth={12} />
      <circle
        cx={44}
        cy={44}
        r={r}
        fill="none"
        stroke="var(--muted)"
        strokeWidth={12}
        strokeDasharray={`${c * 0.5} ${c}`}
        strokeDashoffset={0}
        opacity={0.7}
      />
      <circle
        cx={44}
        cy={44}
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={12}
        strokeDasharray={`${c * 0.3} ${c}`}
        strokeDashoffset={-c * 0.5}
      />
      <circle
        cx={44}
        cy={44}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={12}
        strokeDasharray={`${c * 0.2} ${c}`}
        strokeDashoffset={-c * 0.8}
      />
    </svg>
  );
}

function SplitRow({
  color,
  label,
  pct,
}: {
  color: string;
  label: string;
  pct: string;
}) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-ink">{label}</span>
      </span>
      <span className="tabular text-muted">{pct}</span>
    </li>
  );
}
