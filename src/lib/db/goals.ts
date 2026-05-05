import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Goal } from "./types";

export async function listGoals(): Promise<Goal[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("listGoals error", error);
    return [];
  }
  return (data ?? []) as Goal[];
}
