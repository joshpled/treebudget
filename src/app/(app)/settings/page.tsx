import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsView } from "./SettingsView";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined);
  const email = user?.email ?? null;
  const displayName =
    fullName || (email ? email.split("@")[0] : "Welcome");

  return <SettingsView displayName={displayName} email={email} />;
}
