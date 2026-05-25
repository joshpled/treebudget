"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SetupStepId, SetupSteps } from "@/lib/types";

const STEP_IDS = [
  "spending_account",
  "savings_account",
  "connected_in_app",
  "direct_deposit_split",
  "auto_transfers",
] as const;

const toggleSchema = z.object({
  step: z.enum(STEP_IDS),
  done: z.boolean(),
});

export async function toggleSetupStep(input: {
  step: SetupStepId;
  done: boolean;
}) {
  const parsed = toggleSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  // Read-modify-write the steps jsonb. RLS scopes the row to this user.
  const { data: profile } = await supabase
    .from("profiles")
    .select("setup_steps")
    .eq("id", user.id)
    .maybeSingle();

  const next: SetupSteps = {
    ...((profile?.setup_steps as SetupSteps | null) ?? {}),
    [parsed.step]: parsed.done,
  };

  const { error } = await supabase
    .from("profiles")
    .update({ setup_steps: next })
    .eq("id", user.id);
  if (error) throw error;

  revalidatePath("/", "layout");
}

export async function dismissSetupCard() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("profiles")
    .update({ setup_dismissed_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw error;

  revalidatePath("/", "layout");
}
