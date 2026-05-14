import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPlaidClient } from "@/lib/plaid";
import { encryptToken } from "@/lib/crypto";
import {
  refreshAccountsForLink,
  syncTransactionsForLink,
} from "@/lib/plaid/sync";

const schema = z.object({
  public_token: z.string().min(1),
  institution: z
    .object({
      institution_id: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
  accounts: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.string().optional(),
        subtype: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

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

  const plaid = getPlaidClient();
  try {
    const exchange = await plaid.itemPublicTokenExchange({
      public_token: body.public_token,
    });
    const accessToken = exchange.data.access_token;
    const itemId = exchange.data.item_id;

    const { data: link, error: insertError } = await supabase
      .from("bank_links")
      .upsert(
        {
          user_id: user.id,
          provider: "plaid",
          plaid_item_id: itemId,
          access_token_encrypted: encryptToken(accessToken),
          institution_id: body.institution?.institution_id ?? null,
          institution_name: body.institution?.name ?? null,
          status: "active",
        },
        { onConflict: "provider,plaid_item_id" },
      )
      .select()
      .single();
    if (insertError || !link) throw insertError ?? new Error("Insert failed");

    // Pull initial accounts list (used by the UI to ask the user to map
    // each Plaid account to one of their treebudget buckets).
    const accounts = await refreshAccountsForLink(
      supabase,
      user.id,
      link.id as string,
      link.access_token_encrypted as string,
    );

    return NextResponse.json({
      bank_link_id: link.id,
      institution_name: link.institution_name,
      accounts,
    });
  } catch (err) {
    console.error("plaid exchange error", err);
    return NextResponse.json(
      { error: "Could not link bank account" },
      { status: 500 },
    );
  }
}

// Save the user's mapping of Plaid accounts -> treebudget account kinds.
// Called right after the exchange completes, once the user picks which
// real account should fund Bills / Spending / Savings.
const mappingSchema = z.object({
  bank_link_id: z.string().uuid(),
  mappings: z.array(
    z.object({
      plaid_account_id: z.string(),
      kind: z.enum(["bills", "spending", "savings"]),
      name: z.string().optional(),
    }),
  ),
});

export async function PUT(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: z.infer<typeof mappingSchema>;
  try {
    body = mappingSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body", details: String(err) },
      { status: 400 },
    );
  }

  // Apply the mappings: set plaid_account_id + bank_link_id on each
  // treebudget account row by kind.
  for (const m of body.mappings) {
    const { error } = await supabase
      .from("accounts")
      .update({
        plaid_account_id: m.plaid_account_id,
        bank_link_id: body.bank_link_id,
        name: m.name ?? undefined,
      })
      .eq("user_id", user.id)
      .eq("kind", m.kind);
    if (error) {
      console.error("mapping update error", error);
      return NextResponse.json(
        { error: "Could not save mapping" },
        { status: 500 },
      );
    }
  }

  // Now that accounts are linked, fetch the access token + sync transactions.
  const { data: link } = await supabase
    .from("bank_links")
    .select("id, plaid_item_id, access_token_encrypted, cursor")
    .eq("id", body.bank_link_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!link) {
    return NextResponse.json({ error: "Bank link not found" }, { status: 404 });
  }

  try {
    await refreshAccountsForLink(
      supabase,
      user.id,
      link.id,
      link.access_token_encrypted,
    );
    const result = await syncTransactionsForLink(supabase, user.id, link);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("post-mapping sync error", err);
    return NextResponse.json({ ok: true, synced: false }, { status: 200 });
  }
}
