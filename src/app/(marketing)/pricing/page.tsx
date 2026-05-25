import type { Metadata } from "next";
import { PricingCard } from "./PricingCard";

export const metadata: Metadata = {
  title: "Pricing · treebudget",
  description:
    "One plan, full access. $9.99 a month or $99 a year. Bank sync, unlimited transactions and goals, all the calm.",
};

export default function PricingPage() {
  return (
    <section className="hero-glow">
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-16 sm:pt-24 lg:px-8">
        <div className="text-center">
          <div className="rise text-[12px] font-medium uppercase tracking-wider text-primary">
            Pricing
          </div>
          <h1 className="rise rise-delay-1 mt-2 text-[36px] font-semibold tracking-tight sm:text-[44px]">
            One plan, full access.
          </h1>
          <p className="rise rise-delay-2 mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            Bank sync, unlimited transactions, unlimited goals, the full
            three-account model, and the setup guide that helps you make it
            real at your bank.
          </p>
        </div>

        <div className="rise rise-delay-3 mt-12">
          <PricingCard />
        </div>

        <div className="rise rise-delay-4 mx-auto mt-10 max-w-xl space-y-4 text-[14px] leading-relaxed text-muted">
          <Faq q="What's in the plan?">
            Everything in treebudget. There&apos;s only one tier on purpose —
            no upsells, no feature gating. Pay monthly or save by paying
            yearly.
          </Faq>
          <Faq q="Can I cancel anytime?">
            Yes. Cancel from Settings; you keep access through the end of
            your billing period.
          </Faq>
          <Faq q="Is my bank data safe?">
            Bank sync is read-only via Plaid. treebudget never moves your
            money. Access tokens are encrypted at rest with AES-256-GCM and
            scoped per user via Postgres Row Level Security.
          </Faq>
          <Faq q="Does it work on desktop?">
            Yes — same app, with a proper dashboard layout on desktop and the
            phone-first design on mobile.
          </Faq>
        </div>
      </div>
    </section>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border border-border bg-surface p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-semibold text-ink">
        {q}
        <span className="text-muted transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="mt-2 text-[13px] leading-relaxed text-muted">
        {children}
      </div>
    </details>
  );
}
