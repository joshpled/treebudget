import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy · treebudget",
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-2xl px-5 pb-20 pt-16 lg:px-8">
      <div className="text-[12px] font-medium uppercase tracking-wider text-primary">Legal</div>
      <h1 className="mt-2 text-[32px] font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-[14px] text-muted">Last updated: May 2026</p>

      <div className="prose-legal mt-10 space-y-8 text-[15px] leading-relaxed text-ink">
        <Section title="What we collect">
          <p>When you create an account we collect your email address and, optionally, your name. During onboarding you provide your monthly income and choose how to split it across your three accounts. All account data, transactions, and savings goals you enter are stored in our database.</p>
          <p className="mt-3">If you connect a bank via Plaid, Plaid shares read-only transaction and balance data with us on your behalf. We store your transactions and balances but never your bank credentials — those stay with Plaid.</p>
          <p className="mt-3">If you subscribe to a paid plan, Stripe processes your payment. We store your Stripe customer ID and subscription status. We never see or store your full card number.</p>
          <p className="mt-3">If you enable push notifications, we store a push subscription token tied to your account so we can deliver notifications to your device.</p>
        </Section>

        <Section title="How we use your data">
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>To provide the budgeting features you use — account balances, transactions, goals, and income splits.</li>
            <li>To sync bank transactions via Plaid when you connect a bank.</li>
            <li>To manage your subscription and process billing via Stripe.</li>
            <li>To send push notifications if you opt in.</li>
            <li>To send transactional emails (account confirmation, password reset) via Supabase Auth.</li>
          </ul>
          <p className="mt-3">We do not sell your data, use it for advertising, or share it with third parties beyond the service providers listed below.</p>
        </Section>

        <Section title="Third-party services">
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li><strong>Supabase</strong> — database and authentication. Data is hosted on AWS in the United States.</li>
            <li><strong>Plaid</strong> — read-only bank connectivity. Governed by <a href="https://plaid.com/legal/" className="text-primary underline" target="_blank" rel="noopener noreferrer">Plaid's privacy policy</a>.</li>
            <li><strong>Stripe</strong> — payment processing. Governed by <a href="https://stripe.com/privacy" className="text-primary underline" target="_blank" rel="noopener noreferrer">Stripe's privacy policy</a>.</li>
            <li><strong>Vercel</strong> — hosting and edge delivery.</li>
          </ul>
        </Section>

        <Section title="Data retention">
          <p>Your data is retained as long as your account is active. If you delete your account, your data is removed from our database within 30 days. Stripe retains billing records as required by financial regulations.</p>
        </Section>

        <Section title="Security">
          <p>Plaid access tokens are encrypted at rest using AES-256-GCM. All database rows are protected by Row Level Security — each user can only access their own data. All traffic is encrypted in transit via TLS.</p>
        </Section>

        <Section title="Your rights">
          <p>You can export or delete your data at any time by contacting us. You can disconnect your bank from Settings → Accounts. You can cancel your subscription from Settings → Plan at any time.</p>
        </Section>

        <Section title="Contact">
          <p>Questions? Email us at <a href="mailto:hello@treebudget.app" className="text-primary underline">hello@treebudget.app</a>.</p>
        </Section>
      </div>

      <div className="mt-10 text-[13px] text-muted">
        <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
        {" · "}
        <Link href="/" className="hover:text-ink">Back to home</Link>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[17px] font-semibold">{title}</h2>
      <div className="mt-2 text-[14px] leading-relaxed text-muted">{children}</div>
    </div>
  );
}
