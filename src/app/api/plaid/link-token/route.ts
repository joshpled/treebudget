import { NextResponse, type NextRequest } from "next/server";
import { type CountryCode, type Products } from "plaid";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getPlaidClient,
  getWebhookUrl,
  PLAID_COUNTRY_CODES,
  PLAID_PRODUCTS,
} from "@/lib/plaid";

export async function POST(_req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const plaid = getPlaidClient();
  try {
    const res = await plaid.linkTokenCreate({
      client_name: "treebudget",
      language: "en",
      country_codes: PLAID_COUNTRY_CODES as CountryCode[],
      products: PLAID_PRODUCTS as Products[],
      user: { client_user_id: user.id },
      webhook: getWebhookUrl(),
    });
    return NextResponse.json({ link_token: res.data.link_token });
  } catch (err) {
    console.error("plaid link-token error", err);
    return NextResponse.json(
      { error: "Could not create link token" },
      { status: 500 },
    );
  }
}
