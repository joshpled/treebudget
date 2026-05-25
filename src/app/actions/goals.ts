"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const upsertSchema = z.object({
  name: z.string().min(1).max(80),
  target_amount: z.number().positive(),
  current_amount: z.number().min(0),
  due_date: z.string().min(1).nullable().optional(),
});

const createSchema = upsertSchema;
const updateSchema = upsertSchema.extend({ id: z.string().uuid() });

export async function createGoal(input: z.input<typeof createSchema>) {
  const parsed = createSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    name: parsed.name,
    target_amount: parsed.target_amount,
    current_amount: parsed.current_amount,
    due_date: parsed.due_date || null,
  });
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function updateGoal(input: z.input<typeof updateSchema>) {
  const parsed = updateSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("goals")
    .update({
      name: parsed.name,
      target_amount: parsed.target_amount,
      current_amount: parsed.current_amount,
      due_date: parsed.due_date || null,
    })
    .eq("id", parsed.id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function deleteGoal(id: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/", "layout");
}
