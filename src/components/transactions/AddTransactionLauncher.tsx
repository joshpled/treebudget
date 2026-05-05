"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Account } from "@/lib/types";
import { AddTransactionSheet } from "./AddTransactionSheet";

type Props = {
  accounts: Account[];
};

export function AddTransactionLauncher({ accounts }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Add transaction"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary-ink"
      >
        <Plus size={18} />
      </button>
      {open ? (
        <AddTransactionSheet
          accounts={accounts}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
