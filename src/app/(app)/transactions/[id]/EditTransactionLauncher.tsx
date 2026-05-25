"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { Account, Transaction } from "@/lib/types";
import { EditTransactionSheet } from "@/components/transactions/EditTransactionSheet";
import { haptic } from "@/lib/haptic";

type Props = {
  transaction: Transaction;
  accounts: Account[];
};

export function EditTransactionLauncher({ transaction, accounts }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Edit transaction"
        onClick={() => {
          haptic();
          setOpen(true);
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary-ink"
      >
        <Pencil size={16} />
      </button>
      {open ? (
        <EditTransactionSheet
          transaction={transaction}
          accounts={accounts}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
