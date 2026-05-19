"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field } from "@/components/auth/Field";
import { Spinner } from "@/components/Spinner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

type Props = { next?: string };

export function SignInForm({ next }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      router.replace(next && next.startsWith("/") ? next : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Field
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error ? (
        <div className="rounded-2xl border border-danger/40 bg-danger/5 px-4 py-2.5 text-[13px] text-danger">
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-semibold text-white shadow-card transition-opacity",
          loading && "opacity-70",
        )}
      >
        {loading ? <Spinner /> : null}
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <div className="text-center text-[12px]">
        <Link href="/sign-up" className="text-muted">
          Forgot password? Use Google sign-in for now.
        </Link>
      </div>
    </form>
  );
}
