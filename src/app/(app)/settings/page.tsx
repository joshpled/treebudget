import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listAccounts } from "@/lib/db/accounts";
import { getCurrentProfile } from "@/lib/db/profile";
import { SettingsView } from "./SettingsView";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profile, accounts] = await Promise.all([
    getCurrentProfile(),
    listAccounts(),
  ]);

  const fullName =
    profile?.full_name ??
    profile?.display_name ??
    (user?.user_metadata?.full_name as string | undefined) ??
    null;
  const email = user?.email ?? null;
  const displayName =
    fullName || (email ? email.split("@")[0] : "Welcome");

  return (
    <SettingsView
      displayName={displayName}
      email={email}
      income={Number(profile?.monthly_income ?? 0)}
      accounts={accounts}
    />
  );
}
