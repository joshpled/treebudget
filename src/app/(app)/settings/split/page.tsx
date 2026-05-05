import { TopBar } from "@/components/TopBar";
import { listAccounts } from "@/lib/db/accounts";
import { getCurrentProfile } from "@/lib/db/profile";
import { SplitEditor } from "./SplitEditor";

export default async function SplitEditorPage() {
  const [profile, accounts] = await Promise.all([
    getCurrentProfile(),
    listAccounts(),
  ]);

  const bills = accounts.find((a) => a.kind === "bills");
  const spending = accounts.find((a) => a.kind === "spending");
  const savings = accounts.find((a) => a.kind === "savings");

  const initialBills = Math.round(Number(bills?.allocation ?? 0.5) * 100);
  const initialSpending = Math.round(Number(spending?.allocation ?? 0.3) * 100);
  const initialSavings = 100 - initialBills - initialSpending;

  return (
    <>
      <TopBar
        back={{ href: "/settings", label: "Settings" }}
        title="Income & split"
      />
      <SplitEditor
        initialIncome={Number(profile?.monthly_income ?? 6000)}
        initialBills={initialBills}
        initialSpending={initialSpending}
        initialSavings={initialSavings}
        redirectTo="/settings"
      />
    </>
  );
}
