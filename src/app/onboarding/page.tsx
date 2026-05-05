import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/db/profile";
import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (profile?.onboarded_at) {
    redirect("/");
  }
  return (
    <OnboardingWizard
      initialIncome={Number(profile?.monthly_income ?? 6000)}
    />
  );
}
