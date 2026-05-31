import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service · treebudget",
};

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-2xl px-5 pb-20 pt-16 lg:px-8">
      <div className="text-[12px] font-medium uppercase tracking-wider text-primary">Legal</div>
      <h1 className="mt-2 text-[32px] font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-[14px] text-muted">Last updated: May 2026</p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink">
        <Section title="Agreement">
          <p>By creating an account or using treebudget, you agree to these terms. If you do not agree, do not use the service.</p>
        </Section>

        <Section title="The service">
          <p>treebudget is a personal budgeting tool that helps you track income, expenses, and savings goals. The free tier allows manual transaction tracking. The paid tier adds bank sync via Plaid, unlimited transactions, savings goals, and auto income splitting.</p>
          <p className="mt-3">Bank sync is read-only. treebudget never initiates transfers, moves money, or makes payments on your behalf.</p>
        </Section>

        <Section title="Your account">
          <p>You are responsible for maintaining the security of your account credentials. You must provide accurate information during sign-up. One account per person — do not share accounts.</p>
          <p className="mt-3">You must be at least 18 years old to use treebudget.</p>
        </Section>

        <Section title="Paid plans and billing">
          <p>Paid plans are billed monthly or annually via Stripe. Prices are shown at checkout including any applicable taxes. You can cancel at any time from Settings → Plan; you retain access through the end of your billing period. No refunds are issued for partial periods.</p>
          <p className="mt-3">We reserve the right to change pricing with 30 days' notice to your registered email address.</p>
        </Section>

        <Section title="Acceptable use">
          <p>You agree not to:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Use the service for any unlawful purpose.</li>
            <li>Attempt to access another user's data.</li>
            <li>Reverse-engineer, scrape, or abuse the API.</li>
            <li>Resell or sublicense access to the service.</li>
          </ul>
        </Section>

        <Section title="Data and privacy">
          <p>Your use of the service is also governed by our <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.</p>
        </Section>

        <Section title="Disclaimer of warranties">
          <p>treebudget is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or that bank sync data will always be accurate or up to date. Transaction data from Plaid may be delayed or incomplete.</p>
          <p className="mt-3">treebudget is a budgeting tool, not a financial advisor. Nothing in the service constitutes financial, investment, tax, or legal advice.</p>
        </Section>

        <Section title="Limitation of liability">
          <p>To the maximum extent permitted by law, treebudget's liability for any claim arising out of or related to these terms or the service is limited to the amount you paid us in the 12 months prior to the claim, or $10, whichever is greater.</p>
        </Section>

        <Section title="Termination">
          <p>You may delete your account at any time. We may suspend or terminate accounts that violate these terms. Upon termination, your data will be deleted within 30 days.</p>
        </Section>

        <Section title="Changes to these terms">
          <p>We may update these terms from time to time. Material changes will be communicated via email to your registered address. Continued use of the service after changes take effect constitutes acceptance.</p>
        </Section>

        <Section title="Contact">
          <p>Questions? Email us at <a href="mailto:hello@treebudget.app" className="text-primary underline">hello@treebudget.app</a>.</p>
        </Section>
      </div>

      <div className="mt-10 text-[13px] text-muted">
        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
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
