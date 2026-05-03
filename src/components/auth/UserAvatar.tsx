"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function initialsFor(name: string | null, email: string | null) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  if (email) return email[0]?.toUpperCase() ?? "?";
  return "?";
}

type UserShape = {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export function UserAvatar() {
  const [user, setUser] = useState<UserShape | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) return;
      const meta = data.user.user_metadata ?? {};
      setUser({
        name:
          (meta.full_name as string | undefined) ??
          (meta.name as string | undefined) ??
          null,
        email: data.user.email ?? null,
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

  const initials = user ? initialsFor(user.name, user.email) : "";

  return (
    <Link
      href="/settings"
      aria-label="Account"
      className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-[12px] font-semibold uppercase text-primary-ink"
    >
      {user?.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt=""
          width={36}
          height={36}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <span>{initials}</span>
      )}
    </Link>
  );
}
