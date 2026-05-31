"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPlaidClient } from "@/lib/plaid";
import { decryptToken } from "@/lib/crypto";
import { safePlaidError } from "@/lib/plaid/errors";
import { stripe } from "@/lib/stripe";

/**
 * Permanently delete the signed-in user's account and ALL associated data.
 * Irreversible. Backs the deletion promise in the Privacy Policy / Terms.
 *
 * Order matters: revoke external state (Plaid items, Stripe subscription)
 * BEFORE deleting the auth user, because the cascade wipes the rows that hold
 * the tokens/ids needed to do so. Deleting the auth user cascades every owned
 * row (profiles/accounts/transactions/goals/bank_links/push_subscriptions),
 * each of which references auth.users(id) on delete cascade.
 */
export async function deleteAccount() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  // 1. Best-effort: release each Plaid item so we stop being billed / counted.
  const { data: links } = await supabase
    .from("bank_links")
    .select("access_token_encrypted")
    .eq("user_id", user.id);
  for (const link of links ?? []) {
    try {
      const plaid = getPlaidClient();
      await plaid.itemRemove({
        access_token: decryptToken(link.access_token_encrypted),
      });
    } catch (err) {
      console.error("deleteAccount itemRemove failed:", safePlaidError(err));
    }
  }

  // 2. Best-effort: cancel an active Stripe subscription.
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_subscription_id, stripe_subscription_status")
    .eq("id", user.id)
    .maybeSingle();
  if (
    profile?.stripe_subscription_id &&
    profile.stripe_subscription_status !== "canceled"
  ) {
    try {
      await stripe.subscriptions.cancel(profile.stripe_subscription_id);
    } catch (err) {
      console.error("deleteAccount stripe cancel failed:", err);
    }
  }

  // 3. Explicitly clear push subscriptions (defensive — also covered by cascade).
  await supabase.from("push_subscriptions").delete().eq("user_id", user.id);

  // 4. Delete the auth user with the admin client (the session client cannot).
  //    Cascades all owned rows in public.*.
  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw new Error(`Account deletion failed: ${error.message}`);

  // 5. Clear the now-orphaned session and send them home.
  await supabase.auth.signOut();
  redirect("/");
}
