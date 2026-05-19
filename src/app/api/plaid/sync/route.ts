import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  refreshAccountsForLink,
  syncTransactionsForLink,
} from "@/lib/plaid/sync";
import { safePlaidError } from "@/lib/plaid/errors";

export async function POST(_req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: links, error } = await supabase
    .from("bank_links")
    .select("id, plaid_item_id, access_token_encrypted, cursor")
    .eq("user_id", user.id)
    .eq("status", "active");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!links || links.length === 0) {
    return NextResponse.json({ ok: true, synced: 0, links: 0 });
  }

  let totalAdded = 0;
  let totalRemoved = 0;
  for (const link of links) {
    try {
      await refreshAccountsForLink(
        supabase,
        user.id,
        link.id,
        link.access_token_encrypted,
      );
      const result = await syncTransactionsForLink(supabase, user.id, link);
      totalAdded += result.added;
      totalRemoved += result.removed;
    } catch (err) {
      console.error("plaid sync error for link", link.id, safePlaidError(err));
    }
  }

  return NextResponse.json({
    ok: true,
    links: links.length,
    added: totalAdded,
    removed: totalRemoved,
  });
}
