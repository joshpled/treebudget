"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

type Props = {
  accounts: Array<{ id: string; name: string }>;
  selectedId: string;
};

export function TransactionFilterChips({ accounts, selectedId }: Props) {
  const router = useRouter();
  const select = (id: string) => {
    if (id === "all") router.push("/transactions");
    else router.push(`/transactions?account=${id}`);
  };
  const filters = [{ id: "all", name: "All" }, ...accounts];

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
      {filters.map((f) => {
        const active = f.id === selectedId;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => select(f.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
              active
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-ink",
            )}
          >
            {f.name}
          </button>
        );
      })}
    </div>
  );
}
