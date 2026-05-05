export type {
  Account,
  AccountKind,
  Goal,
  Profile,
  Transaction,
} from "./db/types";

export const TRANSACTION_CATEGORIES = [
  "Salary",
  "Rent",
  "Utilities",
  "Groceries",
  "Coffee",
  "Restaurants",
  "Gas",
  "Transport",
  "Subscriptions",
  "Shopping",
  "Entertainment",
  "Health",
  "Transfer",
  "Other",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];
