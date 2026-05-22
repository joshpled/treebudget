import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPlaidClient } from "@/lib/plaid";
import { decryptToken } from "@/lib/crypto";
import { safePlaidError } from "@/lib/plaid/errors";

// Sandbox-only dev tool: points each connected item's webhook at this
// deployment, then asks Plaid to fire a TRANSACTIONS sync webhook. Use it
// to verify the /api/plaid/webhook endpoint end-to-end.
export async function POST(req: NextRequest) {
  if ((process.env.PLAID_ENV ?? "sandbox") !== "sandbox") {
    return NextResponse.json(
      { error: "Test webhooks are sandbox-only" },
      { status: 403 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: links } = await supabase
    .from("bank_links")
    .select("id, access_token_encrypted")
    .eq("user_id", user.id)
    .eq("status", "active");
  if (!links || links.length === 0) {
    return NextResponse.json(
      { error: "No connected banks to test" },
      { status: 400 },
    );
  }

  const webhookUrl = `${new URL(req.url).origin}/api/plaid/webhook`;
  const plaid = getPlaidClient();

  let fired = 0;
  const errors: string[] = [];
  for (const link of links) {
    try {
      const token = decryptToken(link.access_token_encrypted);
      // Ensure the item points at this deployment's webhook endpoint.
      await plaid.itemWebhookUpdate({
        access_token: token,
        webhook: webhookUrl,
      });
      // Ask Plaid to send a TRANSACTIONS sync webhook now.
      const fireReq = {
        access_token: token,
        webhook_code: "SYNC_UPDATES_AVAILABLE",
      };
      await plaid.sandboxItemFireWebhook(
        fireReq as Parameters<typeof plaid.sandboxItemFireWebhook>[0],
      );
      fired += 1;
    } catch (err) {
      errors.push(safePlaidError(err));
    }
  }

  if (fired === 0) {
    return NextResponse.json(
      { error: errors[0] ?? "Could not fire webhook" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, fired, webhookUrl });
}
