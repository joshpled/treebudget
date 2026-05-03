export type AccountKind =
  | "bills"
  | "spending"
  | "savings"
  | "investment"
  | "other";

export type Account = {
  id: string;
  kind: AccountKind;
  name: string;
  balance: number;
  /** Allocation share, 0-1. Bills + spending + savings should sum to 1. */
  allocation: number;
  /** Last 60 days of end-of-day balances, oldest -> newest. */
  history: number[];
  isCard?: boolean;
};

export type TransactionCategory =
  | "Salary"
  | "Rent"
  | "Utilities"
  | "Groceries"
  | "Coffee"
  | "Restaurants"
  | "Gas"
  | "Transport"
  | "Subscriptions"
  | "Shopping"
  | "Entertainment"
  | "Health"
  | "Transfer"
  | "Other";

export type Transaction = {
  id: string;
  accountId: string;
  /** ISO date string. */
  date: string;
  merchant: string;
  category: TransactionCategory;
  /** Positive for income / inbound, negative for spend. */
  amount: number;
  note?: string;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  current: number;
  dueDate?: string;
};
