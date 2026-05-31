import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/db/profile";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getCurrentProfile();

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 400 });
  }

  const { cancel } = (await req.json()) as { cancel: boolean };

  const sub = await stripe.subscriptions.update(profile.stripe_subscription_id, {
    cancel_at_period_end: cancel,
  });

  // Optimistically reflect the change so the UI updates without waiting for the
  // webhook. The webhook writes the same fields, so the two converge.
  const admin = createSupabaseAdminClient();
  await admin
    .from("profiles")
    .update({
      cancel_at_period_end: sub.cancel_at_period_end,
      cancel_at: sub.cancel_at
        ? new Date(sub.cancel_at * 1000).toISOString()
        : null,
    })
    .eq("id", user.id);

  revalidatePath("/settings");

  return NextResponse.json({
    cancel_at_period_end: sub.cancel_at_period_end,
    cancel_at: sub.cancel_at,
  });
}
