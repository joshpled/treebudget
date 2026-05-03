import Link from "next/link";
import { TreeMark } from "./TreeMark";

type Props = {
  title?: string;
  back?: { href: string; label?: string };
  right?: React.ReactNode;
};

export function TopBar({ title, back, right }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {back ? (
            <Link
              href={back.href}
              className="-ml-2 flex h-9 items-center gap-1 rounded-full px-2 text-sm text-muted hover:text-ink"
            >
              <span aria-hidden>←</span>
              <span>{back.label ?? "Back"}</span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <TreeMark size={22} />
              <span className="text-[15px] font-semibold tracking-tight">
                treebudget
              </span>
            </Link>
          )}
        </div>
        {title && !back ? (
          <span className="absolute left-1/2 -translate-x-1/2 text-sm font-medium">
            {title}
          </span>
        ) : null}
        {title && back ? (
          <span className="text-sm font-medium">{title}</span>
        ) : null}
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}
