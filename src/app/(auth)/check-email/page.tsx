import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";

type SearchParams = Promise<{ email?: string }>;

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { email } = await searchParams;

  return (
    <AuthShell
      title="Check your email"
      subtitle={
        email
          ? `We sent a confirmation link to ${email}. Open it on this device to finish signing in.`
          : "We sent you a confirmation link. Open it on this device to finish signing in."
      }
      footer={
        <Link href="/sign-in" className="font-medium text-primary">
          Back to sign in
        </Link>
      }
    >
      <div className="rounded-2xl border border-border bg-surface p-4 text-[13px] text-muted shadow-card">
        Didn&apos;t see it? Check spam, or wait a minute and try signing up
        again.
      </div>
    </AuthShell>
  );
}
