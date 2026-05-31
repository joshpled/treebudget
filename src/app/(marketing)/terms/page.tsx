import type { Metadata } from "next";
import Link from "next/link";
import {
  COMPANY_LEGAL,
  COMPANY_NAME,
  CONTACT_EMAIL,
  GOVERNING_STATE,
  LEGAL_EFFECTIVE,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service · treebudget",
  description:
    "The terms governing your use of treebudget, including billing, disclaimers, and dispute resolution.",
};

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-2xl px-5 pb-20 pt-16 lg:px-8">
      <div className="text-[12px] font-medium uppercase tracking-wider text-primary">
        Legal
      </div>
      <h1 className="mt-2 text-[32px] font-semibold tracking-tight">
        Terms of Service
      </h1>
      <p className="mt-2 text-[14px] text-muted">
        Last updated: {LEGAL_EFFECTIVE}
      </p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink">
        <Section title="1. Acceptance of these terms">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) are a binding agreement
            between you and {COMPANY_LEGAL} (&ldquo;{COMPANY_NAME},&rdquo;
            &ldquo;we,&rdquo; &ldquo;us&rdquo;). By creating an account or using
            {" "}{COMPANY_NAME}, you agree to these Terms and to our{" "}
            <Link href="/privacy" className="text-primary underline">
              Privacy Policy
            </Link>
            . If you do not agree, do not use the service. You must be at least
            18 years old to use {COMPANY_NAME}.
          </p>
        </Section>

        <Section title="2. The service">
          <p>
            {COMPANY_NAME} is a personal budgeting tool. The free tier provides
            manual transaction tracking across three core accounts. Paid plans
            add bank sync via Plaid, unlimited transactions, savings goals, and
            automatic income splitting.
          </p>
          <p className="mt-3">
            Bank connections are <strong>read-only</strong>. {COMPANY_NAME}{" "}
            never initiates transfers, moves money, or makes payments on your
            behalf.
          </p>
        </Section>

        <Section title="3. Your account">
          <p>
            You are responsible for the activity under your account and for
            keeping your credentials secure. Provide accurate information when
            you register. One account per person; do not share accounts or let
            others access yours.
          </p>
        </Section>

        <Section title="4. Subscriptions, billing, and cancellation">
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              Paid plans are billed in advance on a recurring basis (monthly or
              annually) through Stripe, at the price shown at checkout plus any
              applicable taxes.
            </li>
            <li>
              <strong>Your subscription automatically renews</strong> at the end
              of each billing period at the then-current price until you cancel.
            </li>
            <li>
              You can cancel anytime from Settings → Plan (Stripe billing
              portal). Cancellation takes effect at the end of the current
              period; you keep paid access until then.
            </li>
            <li>
              Payments are non-refundable, including for partial billing periods,
              except where required by law.
            </li>
            <li>
              We may change pricing with at least 30 days&apos; notice to your
              registered email. Continued use after a price change takes effect
              constitutes acceptance.
            </li>
          </ul>
        </Section>

        <Section title="5. Acceptable use">
          <p>You agree not to:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Use the service for any unlawful or fraudulent purpose.</li>
            <li>Access, tamper with, or attempt to access another user&apos;s data.</li>
            <li>Reverse-engineer, scrape, overload, or disrupt the service or its APIs.</li>
            <li>Resell, sublicense, or commercially exploit the service without our consent.</li>
          </ul>
        </Section>

        <Section title="6. Intellectual property">
          <p>
            {COMPANY_NAME} and its software, design, and content are owned by us
            and our licensors. We grant you a limited, non-exclusive,
            non-transferable, revocable license to use the service for your
            personal use. Your data remains yours.
          </p>
        </Section>

        <Section title="7. Third-party services">
          <p>
            {COMPANY_NAME} relies on Plaid (bank connectivity) and Stripe
            (payments). Your use of those features is also subject to{" "}
            <a
              href="https://plaid.com/legal/"
              className="text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Plaid&apos;s
            </a>{" "}
            and{" "}
            <a
              href="https://stripe.com/legal"
              className="text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stripe&apos;s
            </a>{" "}
            respective terms. We are not responsible for third-party services.
          </p>
        </Section>

        <Section title="8. Not financial advice">
          <p>
            {COMPANY_NAME} is an informational budgeting tool. It does{" "}
            <strong>not</strong> provide financial, investment, tax, accounting,
            or legal advice. Bank data provided through Plaid may be delayed,
            incomplete, or inaccurate. You are solely responsible for your
            financial decisions and for verifying any information before relying
            on it.
          </p>
        </Section>

        <Section title="9. Disclaimer of warranties">
          <p className="uppercase">
            The service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, whether express or
            implied, including warranties of merchantability, fitness for a
            particular purpose, and non-infringement. We do not warrant that the
            service will be uninterrupted, secure, error-free, or that any data
            (including bank data) will be accurate or current.
          </p>
        </Section>

        <Section title="10. Limitation of liability">
          <p className="uppercase">
            To the maximum extent permitted by law, {COMPANY_NAME} and its
            operator will not be liable for any indirect, incidental, special,
            consequential, or punitive damages, or any loss of data, profits, or
            revenue, arising out of or relating to your use of the service. Our
            total liability for any claim is limited to the greater of (a) the
            amount you paid us in the 12 months before the claim, or (b) USD
            $100.
          </p>
        </Section>

        <Section title="11. Indemnification">
          <p>
            You agree to indemnify and hold harmless {COMPANY_NAME} and its
            operator from any claims, losses, liabilities, and expenses
            (including reasonable legal fees) arising from your use of the
            service, your violation of these Terms, or your violation of any law
            or third-party right.
          </p>
        </Section>

        <Section title="12. Dispute resolution, arbitration, and class-action waiver">
          <p>
            <strong>Please read this section carefully — it affects your legal
            rights.</strong>
          </p>
          <p className="mt-3">
            <strong>Informal resolution first.</strong> Before filing a claim,
            you agree to contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
              {CONTACT_EMAIL}
            </a>{" "}
            and try to resolve the dispute informally for at least 30 days.
          </p>
          <p className="mt-3">
            <strong>Binding arbitration.</strong> If we cannot resolve a dispute
            informally, you and {COMPANY_NAME} agree that any dispute arising out
            of or relating to these Terms or the service will be resolved by
            final and binding individual arbitration, rather than in court,
            except that either party may bring an individual claim in small-claims
            court.
          </p>
          <p className="mt-3">
            <strong>Class-action and jury-trial waiver.</strong> You and{" "}
            {COMPANY_NAME} agree to bring claims only in an individual capacity,
            and not as a plaintiff or class member in any class, collective, or
            representative proceeding. You and {COMPANY_NAME} waive any right to a
            jury trial.
          </p>
          <p className="mt-3">
            <strong>30-day opt-out.</strong> You may opt out of this arbitration
            agreement by emailing{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
              {CONTACT_EMAIL}
            </a>{" "}
            within 30 days of first accepting these Terms, stating your name and
            that you opt out of arbitration.
          </p>
        </Section>

        <Section title="13. Governing law and venue">
          <p>
            These Terms are governed by the laws of the State of{" "}
            {GOVERNING_STATE}, without regard to its conflict-of-laws rules. Any
            arbitration will be seated in {GOVERNING_STATE}, and any dispute not
            subject to arbitration will be brought exclusively in the state or
            federal courts located in {GOVERNING_STATE}.
          </p>
        </Section>

        <Section title="14. Termination">
          <p>
            You may delete your account at any time from Settings → Account,
            which permanently removes your data. We may suspend or terminate
            accounts that violate these Terms or that we reasonably believe pose
            a risk. Sections that by their nature should survive termination
            (including disclaimers, limitation of liability, indemnification, and
            dispute resolution) will survive.
          </p>
        </Section>

        <Section title="15. Changes to these terms">
          <p>
            We may update these Terms from time to time. Material changes will be
            posted here with a new &ldquo;Last updated&rdquo; date and, where
            appropriate, emailed to you. Continued use after changes take effect
            constitutes acceptance.
          </p>
        </Section>

        <Section title="16. General">
          <p>
            If any provision of these Terms is held unenforceable, the remaining
            provisions stay in effect. Our failure to enforce a provision is not
            a waiver. These Terms, with the Privacy Policy, are the entire
            agreement between you and us regarding the service. You may not
            assign these Terms; we may assign them in connection with a merger,
            acquisition, or sale of assets.
          </p>
        </Section>

        <Section title="17. Contact">
          <p>
            Questions? Email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>
      </div>

      <div className="mt-10 text-[13px] text-muted">
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
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
