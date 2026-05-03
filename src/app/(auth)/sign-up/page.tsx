import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpContent } from "./SignUpContent";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Plant your treebudget"
      subtitle="Three accounts. One card. Auto-split paychecks."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <SignUpContent />
      </Suspense>
    </AuthShell>
  );
}
