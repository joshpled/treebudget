import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    if (!userId) return NextResponse.json({ ok: true });

    await supabase
      .from("profiles")
      .update({
        tier: "paid",
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        stripe_subscription_status: "active",
      })
      .eq("id", userId);
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const isPaid = sub.status === "active" || sub.status === "trialing";

    await supabase
      .from("profiles")
      .update({
        tier: isPaid ? "paid" : "free",
        stripe_subscription_status: sub.status,
        stripe_subscription_id: sub.id,
        cancel_at_period_end: sub.cancel_at_period_end,
        cancel_at: sub.cancel_at
          ? new Date(sub.cancel_at * 1000).toISOString()
          : null,
      })
      .eq("stripe_customer_id", customerId);
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;

    await supabase
      .from("profiles")
      .update({
        tier: "free",
        stripe_subscription_status: "canceled",
        stripe_subscription_id: null,
        cancel_at_period_end: false,
        cancel_at: null,
      })
      .eq("stripe_customer_id", customerId);
  }

  return NextResponse.json({ ok: true });
}
