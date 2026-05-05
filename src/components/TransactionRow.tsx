import Link from "next/link";
import {
  Coffee,
  Home as HomeIcon,
  ShoppingBag,
  Utensils,
  Fuel,
  Car,
  Tv,
  Film,
  Heart,
  ArrowLeftRight,
  Banknote,
  Receipt,
  Lightbulb,
  Apple,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { formatCurrency, formatRelativeDay } from "@/lib/format";
import { cn } from "@/lib/cn";

const ICON_BY_CATEGORY: Record<string, LucideIcon> = {
  Salary: Banknote,
  Rent: HomeIcon,
  Utilities: Lightbulb,
  Groceries: Apple,
  Coffee: Coffee,
  Restaurants: Utensils,
  Gas: Fuel,
  Transport: Car,
  Subscriptions: Tv,
  Shopping: ShoppingBag,
  Entertainment: Film,
  Health: Heart,
  Transfer: ArrowLeftRight,
  Other: Receipt,
};

type Props = {
  transaction: Transaction;
  showAccount?: string;
  href?: string;
};

export function TransactionRow({ transaction, showAccount, href }: Props) {
  const Icon = ICON_BY_CATEGORY[transaction.category] ?? Receipt;
  const amount = Number(transaction.amount);
  const positive = amount > 0;
  const className = "flex items-center gap-3 px-1 py-3";
  const body = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-ink">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[15px] font-medium text-ink">
            {transaction.merchant}
          </span>
          <span
            className={cn(
              "tabular shrink-0 text-[15px] font-semibold",
              positive ? "text-primary" : "text-ink",
            )}
          >
            {formatCurrency(amount, { signed: positive })}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 text-[12px] text-muted">
          <span className="truncate">
            {transaction.category}
            {showAccount ? ` · ${showAccount}` : ""}
          </span>
          <span className="shrink-0">{formatRelativeDay(transaction.posted_at)}</span>
        </div>
      </div>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  return <div className={className}>{body}</div>;
}
