import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPlaidClient } from "@/lib/plaid";
import { decryptToken } from "@/lib/crypto";
import { safePlaidError } from "@/lib/plaid/errors";

const schema = z.object({ bank_link_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body", details: String(err) },
      { status: 400 },
    );
  }

  const { data: link, error } = await supabase
    .from("bank_links")
    .select("id, access_token_encrypted")
    .eq("id", body.bank_link_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const plaid = getPlaidClient();
    await plaid.itemRemove({ access_token: decryptToken(link.access_token_encrypted) });
  } catch (err) {
    // Continue with local cleanup even if Plaid call fails.
    console.error("plaid item remove failed (continuing):", safePlaidError(err));
  }

  // Unlink accounts (don't delete; the user's budget buckets remain).
  await supabase
    .from("accounts")
    .update({ plaid_account_id: null, bank_link_id: null })
    .eq("user_id", user.id)
    .eq("bank_link_id", link.id);

  // Delete the link row (cascades nothing critical; transactions stay).
  await supabase.from("bank_links").delete().eq("id", link.id);

  return NextResponse.json({ ok: true });
}
