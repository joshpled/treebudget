"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "./supabase/client";

export type SupabaseUserSummary = {
  id: string;
  email: string | null;
  fullName: string | null;
  firstName: string | null;
  avatarUrl: string | null;
};

export function useSupabaseUser(): SupabaseUserSummary | null {
  const [user, setUser] = useState<SupabaseUserSummary | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) return;
      const meta = data.user.user_metadata ?? {};
      const fullName =
        (meta.full_name as string | undefined) ??
        (meta.name as string | undefined) ??
        null;
      const firstName = fullName
        ? fullName.split(" ")[0] ?? null
        : data.user.email
          ? data.user.email.split("@")[0]
          : null;
      setUser({
        id: data.user.id,
        email: data.user.email ?? null,
        fullName,
        firstName,
        avatarUrl:
          (meta.avatar_url as string | undefined) ??
          (meta.picture as string | undefined) ??
          null,
      });
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return user;
}
