import { TopBar } from "@/components/TopBar";
import { PageHeader } from "@/components/PageHeader";
import { SetupChecklist } from "@/components/setup/SetupChecklist";
import { PayrollSnippet } from "@/components/setup/PayrollSnippet";
import {
  BankRecommendations,
  BigBankInstructions,
} from "@/components/setup/BankRecommendations";
import { getCurrentProfile } from "@/lib/db/profile";
import { listAccounts } from "@/lib/db/accounts";
import { SETUP_STEPS } from "@/lib/setup/content";

export default async function SetupPage() {
  const [profile, accounts] = await Promise.all([
    getCurrentProfile(),
    listAccounts(),
  ]);

  const steps = profile?.setup_steps ?? {};
  const doneCount = SETUP_STEPS.filter((s) => !!steps[s.id]).length;

  const bills = accounts.find((a) => a.kind === "bills");
  const spending = accounts.find((a) => a.kind === "spending");
  const savings = accounts.find((a) => a.kind === "savings");
  const billsPct = Math.round(Number(bills?.allocation ?? 0.5) * 100);
  const spendingPct = Math.round(Number(spending?.allocation ?? 0.3) * 100);
  const savingsPct = 100 - billsPct - spendingPct;

  return (
    <>
      <TopBar back={{ href: "/dashboard", label: "Home" }} title="Set it up for real" />
      <div className="mx-auto w-full max-w-md lg:max-w-6xl lg:px-8">
        <PageHeader
          eyebrow={`Progress · ${doneCount}/${SETUP_STEPS.length}`}
          title="Make the buckets real at your bank"
        />

        <section className="px-4 pb-4 lg:px-0">
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-card lg:p-6">
            <h2 className="text-[14px] font-semibold text-ink">
              How it works
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              treebudget tracks three buckets — <strong>Bills</strong>,{" "}
              <strong>Spending</strong>, and <strong>Savings</strong> — and
              applies your split to every income you tag. The app does the
              math, but it can&apos;t move real money for you. To make the
              buckets real, you separate your accounts at your bank and let
              your paycheck split itself there too. Once set up, it&apos;s
              hands-off forever.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              If you&apos;d rather just use treebudget as a budget tracker on
              one account, that works too — skip the steps below and treat
              the Spending balance as your weekly allowance.
            </p>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-5 lg:gap-6">
          <section className="px-4 pb-4 lg:col-span-3 lg:px-0">
            <h2 className="px-1 pb-2 text-[12px] font-medium uppercase tracking-wide text-muted">
              Your real-money setup
            </h2>
            <SetupChecklist initialSteps={steps} />
          </section>

          <div className="lg:col-span-2">
            <section className="px-4 pb-4 lg:px-0">
              <h2 className="px-1 pb-2 text-[12px] font-medium uppercase tracking-wide text-muted">
                Tell HR / payroll
              </h2>
            <PayrollSnippet
              billsPct={billsPct}
              spendingPct={spendingPct}
              savingsPct={savingsPct}
            />
          </section>

          <section className="px-4 pb-4 lg:px-0">
            <h2 className="px-1 pb-2 text-[12px] font-medium uppercase tracking-wide text-muted">
              Banks we recommend
            </h2>
            <BankRecommendations />
          </section>
          </div>
        </div>

        <section className="px-4 pb-8 lg:px-0">
          <h2 className="px-1 pb-2 text-[12px] font-medium uppercase tracking-wide text-muted">
            Already with a big bank?
          </h2>
          <div className="lg:grid lg:grid-cols-3 lg:gap-3">
            <BigBankInstructions />
          </div>
        </section>
      </div>
    </>
  );
}
