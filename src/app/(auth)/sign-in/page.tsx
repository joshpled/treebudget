import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInContent } from "./SignInContent";

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your treebudget."
      footer={
        <>
          New here?{" "}
          <Link href="/sign-up" className="font-medium text-primary">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <SignInContent />
      </Suspense>
    </AuthShell>
  );
}
