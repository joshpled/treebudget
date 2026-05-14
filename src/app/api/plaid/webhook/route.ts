import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { syncTransactionsForLink } from "@/lib/plaid/sync";

// Plaid webhooks: handle TRANSACTIONS sync update + ITEM error events.
// This route bypasses cookies/auth — it's called server-to-server by Plaid.
// Per-user data access is constrained by the bank_links row's user_id.
//
// Note: We don't currently verify Plaid's JWT signature. Before going to
// production with real-money flows, add verification using
// `webhookVerificationKeyGet` (Plaid SDK) + `jose`. For sandbox + read-only
// budgeting it's acceptable to defer.

export async function POST(req: NextRequest) {
  let body: {
    webhook_type?: string;
    webhook_code?: string;
    item_id?: string;
    error?: { error_code?: string };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { webhook_type, webhook_code, item_id } = body;
  if (!item_id) {
    return NextResponse.json({ ok: true, ignored: "no item_id" });
  }

  // Use the server-side client directly (no cookies) and let the bank_links
  // RLS bypass via service-context fetch by user_id.
  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  });

  const { data: link } = await supabase
    .from("bank_links")
    .select(
      "id, user_id, plaid_item_id, access_token_encrypted, cursor, status",
    )
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
      console.error("webhook sync error", err);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  }

  if (webhook_type === "ITEM" && webhook_code === "ERROR") {
    const status =
      body.error?.error_code === "ITEM_LOGIN_REQUIRED"
        ? "login_required"
        : "active";
    await supabase
      .from("bank_links")
      .update({ status })
      .eq("id", link.id);
    return NextResponse.json({ ok: true, status });
  }

  // Unhandled webhook type. Acknowledge so Plaid stops retrying.
  return NextResponse.json({ ok: true, handled: false });
}
