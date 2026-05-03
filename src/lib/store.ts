"use client";

import { create } from "zustand";
import {
  SEED_ACCOUNTS,
  SEED_GOALS,
  SEED_INCOME,
  SEED_TRANSACTIONS,
  SEED_USER,
} from "./mock/seed";
import type { Account, Goal, Transaction } from "./types";

type SplitMap = Record<"bills" | "spending" | "savings", number>;

type BudgetState = {
  user: { name: string };
  income: number;
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
  setIncome: (amount: number) => void;
  setSplit: (split: SplitMap) => void;
  applyPaycheck: (amount: number) => void;
};

export const useBudgetStore = create<BudgetState>((set) => ({
  user: SEED_USER,
  income: SEED_INCOME,
  accounts: SEED_ACCOUNTS,
  transactions: SEED_TRANSACTIONS,
  goals: SEED_GOALS,

  setIncome: (amount) => set({ income: amount }),

  setSplit: (split) =>
    set((state) => ({
      accounts: state.accounts.map((a) => {
        if (a.kind === "bills") return { ...a, allocation: split.bills };
        if (a.kind === "spending") return { ...a, allocation: split.spending };
        if (a.kind === "savings") return { ...a, allocation: split.savings };
        return a;
      }),
    })),

  applyPaycheck: (amount) =>
    set((state) => {
      const updates: Account[] = state.accounts.map((a) => {
        if (a.kind === "bills" || a.kind === "spending" || a.kind === "savings") {
          const delta = amount * a.allocation;
          return {
            ...a,
            balance: Math.round((a.balance + delta) * 100) / 100,
            history: [...a.history.slice(1), a.balance + delta],
          };
        }
        return a;
      });
      return { accounts: updates };
    }),
}));
