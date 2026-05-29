import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/db/profile";
import { PricingCards } from "./PricingCards";

export const metadata: Metadata = {
  title: "Pricing · treebudget",
  description:
    "Start free. Upgrade for bank sync, unlimited transactions, savings goals, and auto income split.",
};

export default async function PricingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getCurrentProfile() : null;
  const isLoggedIn = !!user;
  const tier = profile?.tier ?? null;

  return (
    <section className="hero-glow">
      <div className="mx-auto max-w-4xl px-5 pb-20 pt-16 sm:pt-24 lg:px-8">
        <div className="text-center">
          <div className="rise text-[12px] font-medium uppercase tracking-wider text-primary">
            Pricing
          </div>
          <h1 className="rise rise-delay-1 mt-2 text-[36px] font-semibold tracking-tight sm:text-[44px]">
            Start free. Upgrade when ready.
          </h1>
          <p className="rise rise-delay-2 mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            The free tier gives you the three-account model and manual
            tracking. Paid unlocks bank sync, goals, and auto income split.
          </p>
        </div>

        <div className="rise rise-delay-3 mt-12">
          <PricingCards isLoggedIn={isLoggedIn} tier={tier} />
        </div>

        <div className="rise rise-delay-4 mx-auto mt-10 max-w-xl space-y-4 text-[14px] leading-relaxed text-muted">
          <Faq q="Can I upgrade later?">
            Yes. Start on the free tier and upgrade anytime from the pricing
            page. Your data carries over.
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
