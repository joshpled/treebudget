"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import type { Account } from "@/lib/types";
import { haptic } from "@/lib/haptic";
import { AddTransactionSheet } from "./AddTransactionSheet";

type Props = {
  accounts: Account[];
};

export function AddTransactionLauncher({ accounts }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Add transaction"
        onClick={() => {
          haptic();
          setOpen(true);
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary-ink"
      >
        <Plus size={18} />
      </button>
      {open && mounted
        ? createPortal(
            <AddTransactionSheet
              accounts={accounts}
              onClose={() => setOpen(false)}
            />,
            document.body,
          )
        : null}
    </>
  );
}
