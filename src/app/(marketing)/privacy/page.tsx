import type { Metadata } from "next";
import Link from "next/link";
import {
  COMPANY_LEGAL,
  COMPANY_NAME,
  CONTACT_EMAIL,
  LEGAL_EFFECTIVE,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy · treebudget",
  description:
    "How treebudget collects, uses, and protects your data. We do not sell your personal information.",
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-2xl px-5 pb-20 pt-16 lg:px-8">
      <div className="text-[12px] font-medium uppercase tracking-wider text-primary">
        Legal
      </div>
      <h1 className="mt-2 text-[32px] font-semibold tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-2 text-[14px] text-muted">
        Last updated: {LEGAL_EFFECTIVE}
      </p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink">
        <Section title="1. Who we are">
          <p>
            {COMPANY_NAME} is a personal budgeting application that helps you
            track income, expenses, and savings across a simple three-account
            model. This Privacy Policy explains what we collect, how we use it,
            who we share it with, and the choices you have. It applies to the{" "}
            {COMPANY_NAME} website and app operated by {COMPANY_LEGAL} (&ldquo;
            {COMPANY_NAME},&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;).
          </p>
          <p className="mt-3">
            {COMPANY_NAME} is intended for users in the United States. By using
            the service you agree to this policy.
          </p>
        </Section>

        <Section title="2. Information we collect">
          <p className="font-medium text-ink">Information you provide</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong>Account info:</strong> your email address and, optionally,
              your name when you register or sign in (including via Google
              sign-in).
            </li>
            <li>
              <strong>Budgeting data:</strong> your monthly income, account
              names and allocations, transactions (merchant, amount, category,
              date, notes), and savings goals that you enter.
            </li>
          </ul>
          <p className="mt-4 font-medium text-ink">
            Information from connected banks (Plaid)
          </p>
          <p className="mt-2">
            If you choose to connect a bank, our data provider Plaid shares
            read-only information with us on your behalf using its{" "}
            <code>transactions</code> product: your transactions (merchant,
            amount, date, category), account names and types, and account
            balances. We never receive or store your bank login credentials —
            those stay with Plaid.
          </p>
          <p className="mt-4 font-medium text-ink">Billing information</p>
          <p className="mt-2">
            If you subscribe to a paid plan, our payment processor Stripe
            handles your payment. We store your Stripe customer ID and
            subscription status. We never receive or store your full card
            number, CVV, or expiration date.
          </p>
          <p className="mt-4 font-medium text-ink">Other</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong>Push tokens:</strong> if you enable notifications, we
              store a push subscription token for your device.
            </li>
            <li>
              <strong>Technical data:</strong> standard server logs (IP address,
              request metadata) generated when you use the app.
            </li>
          </ul>
        </Section>

        <Section title="3. Cookies">
          <p>
            We use only the strictly necessary cookies that keep you signed in
            (set by our authentication provider, Supabase). We do{" "}
            <strong>not</strong> use advertising, analytics, or third-party
            tracking cookies, and we do not run any tracking pixels or analytics
            scripts.
          </p>
        </Section>

        <Section title="4. How we use your information">
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>To provide and operate the budgeting features you use.</li>
            <li>To sync bank transactions via Plaid when you connect a bank.</li>
            <li>To process and manage your subscription via Stripe.</li>
            <li>To send push notifications if you opt in.</li>
            <li>
              To send transactional emails (account confirmation, password
              reset) via Supabase Auth. We do not send marketing email.
            </li>
            <li>To maintain security, prevent fraud, and debug problems.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </Section>

        <Section title="5. How we share your information">
          <p>
            We do <strong>not</strong> sell or share your personal information,
            and we do not use it for advertising. We share data only with the
            service providers that make {COMPANY_NAME} work:
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong>Supabase</strong> — database and authentication, hosted on
              AWS in the United States.
            </li>
            <li>
              <strong>Plaid</strong> — read-only bank connectivity (
              <a
                href="https://plaid.com/legal/#end-user-privacy-policy"
                className="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Plaid End User Privacy Policy
              </a>
              ).
            </li>
            <li>
              <strong>Stripe</strong> — payment processing (
              <a
                href="https://stripe.com/privacy"
                className="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stripe Privacy Policy
              </a>
              ).
            </li>
            <li>
              <strong>Vercel</strong> — application hosting and delivery.
            </li>
          </ul>
          <p className="mt-3">
            We may also disclose information if required by law, to enforce our
            terms, or in connection with a merger, acquisition, or sale of
            assets (you will be notified of any such change).
          </p>
        </Section>

        <Section title="6. Plaid — bank connections">
          <p>
            When you connect a financial account, you do so through Plaid Inc.
            By using {COMPANY_NAME} to connect a bank, you also agree to Plaid&apos;s{" "}
            <a
              href="https://plaid.com/legal/#end-user-privacy-policy"
              className="text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              End User Privacy Policy
            </a>
            . Plaid accesses your account information on your behalf, on a
            read-only basis. {COMPANY_NAME} cannot initiate transfers, move
            money, or make payments. You can disconnect a bank at any time from
            Settings → Accounts.
          </p>
        </Section>

        <Section title="7. How we protect your data">
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              Plaid access tokens are encrypted at rest using AES-256-GCM.
            </li>
            <li>
              Every database row is protected by Postgres Row Level Security —
              each user can access only their own data.
            </li>
            <li>All traffic is encrypted in transit using TLS.</li>
          </ul>
          <p className="mt-3">
            No method of storage or transmission is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </Section>

        <Section title="8. Data retention">
          <p>
            We retain your data for as long as your account is active. When you
            delete your account (see your rights below), your data is removed
            from our systems. Stripe may retain billing records as required by
            financial and tax regulations, and backups or logs may persist for a
            limited period before being overwritten.
          </p>
        </Section>

        <Section title="9. Your rights and choices (including California)">
          <p>
            You can disconnect your bank from Settings → Accounts, cancel your
            subscription from Settings → Plan, and reset or delete your account
            from Settings → Account.
          </p>
          <p className="mt-3">
            If you are a California resident, the CCPA/CPRA gives you the right
            to know what personal information we hold, to request deletion or
            correction of it, and not to be discriminated against for exercising
            these rights. You can exercise the right to delete directly using
            the <strong>Delete account</strong> option in Settings → Account,
            which permanently removes your account and associated data, or by
            emailing us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
              {CONTACT_EMAIL}
            </a>
            . We do not sell or share your personal information.
          </p>
        </Section>

        <Section title="10. Children&rsquo;s privacy">
          <p>
            {COMPANY_NAME} is not directed to anyone under 18, and we do not
            knowingly collect personal information from minors. If you believe a
            minor has provided us data, contact us and we will delete it.
          </p>
        </Section>

        <Section title="11. Where your data is processed">
          <p>
            Your data is stored and processed in the United States. By using
            {" "}{COMPANY_NAME}, you consent to this processing.
          </p>
        </Section>

        <Section title="12. Changes to this policy">
          <p>
            We may update this policy from time to time. Material changes will be
            posted here with a new &ldquo;Last updated&rdquo; date and, where
            appropriate, communicated by email.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            Questions or requests? Email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>
      </div>

      <div className="mt-10 text-[13px] text-muted">
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>
        {" · "}
        <Link href="/" className="hover:text-ink">
          Back to home
        </Link>
      </div>
    </section>
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
    <div>
      <h2 className="text-[17px] font-semibold">{title}</h2>
      <div className="mt-2 text-[14px] leading-relaxed text-muted">
        {children}
      </div>
    </div>
  );
}
