import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPlaidClient } from "@/lib/plaid";
import { decryptToken } from "@/lib/crypto";
import { safePlaidError } from "@/lib/plaid/errors";

const schema = z.object({ bank_link_id: z.string().uuid() });

// Returns the live list of Plaid accounts for a bank link, plus the user's
// current mapping of plaid_account_id -> treebudget kind. Used to re-open
// the account-mapping sheet for an already-connected bank.
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
    console.error("accounts POST validation error:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data: link } = await supabase
    .from("bank_links")
    .select("id, access_token_encrypted")
    .eq("id", body.bank_link_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!link) {
    return NextResponse.json({ error: "Bank link not found" }, { status: 404 });
  }

  let accounts;
  try {
    const plaid = getPlaidClient();
    const res = await plaid.accountsGet({
      access_token: decryptToken(link.access_token_encrypted),
    });
    accounts = res.data.accounts.map((a) => ({
      plaid_account_id: a.account_id,
      name: a.name,
      official_name: a.official_name ?? null,
      type: String(a.type),
      subtype: a.subtype ?? null,
      balance: Number(a.balances.current ?? a.balances.available ?? 0),
    }));
  } catch (err) {
    console.error("plaid accounts error:", safePlaidError(err));
    return NextResponse.json(
      { error: "Could not load accounts from Plaid" },
      { status: 500 },
    );
  }

  // Current mappings for this bank link.
  const { data: mapped } = await supabase
    .from("accounts")
    .select("kind, plaid_account_id")
    .eq("user_id", user.id)
    .eq("bank_link_id", body.bank_link_id);

  const current: Record<string, string> = {};
  for (const row of mapped ?? []) {
    if (row.plaid_account_id) current[row.plaid_account_id] = row.kind;
  }

  return NextResponse.json({ accounts, current });
}
