import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyPlaidWebhook } from "@/lib/plaid/verify-webhook";
import { syncTransactionsForLink } from "@/lib/plaid/sync";
import { safePlaidError } from "@/lib/plaid/errors";

// Plaid webhooks: handle TRANSACTIONS sync updates + ITEM error events.
//
// This route has no user session, so it uses the service-role Supabase
// client (which bypasses RLS). That makes signature verification and
// strict user_id scoping mandatory:
//   1. verifyPlaidWebhook proves the request genuinely came from Plaid.
//   2. Every query below is scoped to the bank link's own user_id.

export async function POST(req: NextRequest) {
  // Read the raw body once — needed verbatim for signature verification.
  const rawBody = await req.text();

  const isAuthentic = await verifyPlaidWebhook(
    rawBody,
    req.headers.get("Plaid-Verification"),
  );
  if (!isAuthentic) {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 401 },
    );
  }

  let body: {
    webhook_type?: string;
    webhook_code?: string;
    item_id?: string;
    error?: { error_code?: string };
  };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { webhook_type, webhook_code, item_id } = body;
  if (!item_id) {
    return NextResponse.json({ ok: true, ignored: "no item_id" });
  }

  const supabase = createSupabaseAdminClient();

  const { data: link } = await supabase
    .from("bank_links")
    .select("id, user_id, plaid_item_id, access_token_encrypted, cursor, status")
    .eq("plaid_item_id", item_id)
    .maybeSingle();

  if (!link) {
    return NextResponse.json({ ok: true, ignored: "unknown item_id" });
  }

  if (
    webhook_type === "TRANSACTIONS" &&
    (webhook_code === "SYNC_UPDATES_AVAILABLE" ||
      webhook_code === "INITIAL_UPDATE" ||
      webhook_code === "DEFAULT_UPDATE" ||
      webhook_code === "HISTORICAL_UPDATE")
  ) {
    try {
      const result = await syncTransactionsForLink(supabase, link.user_id, {
        id: link.id,
        plaid_item_id: link.plaid_item_id,
        access_token_encrypted: link.access_token_encrypted,
        cursor: link.cursor,
      });
      return NextResponse.json({ ok: true, ...result });
    } catch (err) {
      console.error("webhook sync error", safePlaidError(err));
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  }

  if (webhook_type === "ITEM" && webhook_code === "ERROR") {
    const status =
      body.error?.error_code === "ITEM_LOGIN_REQUIRED"
        ? "login_required"
        : "active";
    await supabase.from("bank_links").update({ status }).eq("id", link.id);
    return NextResponse.json({ ok: true, status });
  }

  // Unhandled webhook type — acknowledge so Plaid stops retrying.
  return NextResponse.json({ ok: true, handled: false });
}
