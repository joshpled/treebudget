"use client";

import { useSearchParams } from "next/navigation";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { SignInForm } from "./SignInForm";

export function SignInContent() {
  const params = useSearchParams();
  const next = params?.get("next") ?? undefined;

  return (
    <div className="space-y-5">
      <GoogleButton next={next} label="Sign in with Google" />
      <Divider />
      <SignInForm next={next} />
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[12px] uppercase tracking-wide text-muted">or</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
