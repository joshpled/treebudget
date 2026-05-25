import Link from "next/link";
import { TreeMark } from "@/components/TreeMark";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <TreeMark size={26} />
            <span className="text-[17px] font-semibold tracking-tight">
              treebudget
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/pricing"
              className="rounded-full px-3 py-2 text-[14px] font-medium text-muted hover:text-ink"
            >
              Pricing
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full px-3 py-2 text-[14px] font-medium text-muted hover:text-ink"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-primary px-4 py-2 text-[14px] font-semibold text-white shadow-card"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <TreeMark size={20} />
            <span className="font-medium text-ink">treebudget</span>
            <span>· budget without the spreadsheet</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/pricing" className="hover:text-ink">
              Pricing
            </Link>
            <Link href="/sign-in" className="hover:text-ink">
              Sign in
            </Link>
            <Link href="/sign-up" className="hover:text-ink">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
