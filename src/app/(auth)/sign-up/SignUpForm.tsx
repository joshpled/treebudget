"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/auth/Field";
import { Spinner } from "@/components/Spinner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

type Props = { next?: string };

export function SignUpForm({ next }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const callback = new URL("/auth/callback", window.location.origin);
      if (next) callback.searchParams.set("next", next);
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callback.toString(),
          data: { full_name: name || undefined },
        },
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      // If email confirmations are required (default + recommended), the user
      // has no session yet — send them to a "check your email" landing page.
      if (!data.session) {
        router.replace(`/check-email?email=${encodeURIComponent(email)}`);
        return;
      }
      router.replace(next && next.startsWith("/") ? next : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field
        label="Your name"
        type="text"
        name="name"
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <p className="-mt-2 px-1 text-[12px] text-muted">
        At least 8 characters. We&apos;ll email you a confirmation link.
      </p>
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
        {loading ? "Creating your account…" : "Create account"}
      </button>
    </form>
  );
}
