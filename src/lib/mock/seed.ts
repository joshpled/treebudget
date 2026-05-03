import type { Account, Goal, Transaction, TransactionCategory } from "../types";

// Deterministic PRNG so seed data is stable across renders / SSR / hydration.
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const rand = mulberry32(20260503);

const HISTORY_DAYS = 60;

function buildHistory(start: number, drift: number, jitter: number): number[] {
  const history: number[] = [];
  let value = start;
  for (let i = 0; i < HISTORY_DAYS; i += 1) {
    value += drift + (rand() - 0.5) * jitter;
    history.push(Math.round(value * 100) / 100);
  }
  return history;
}

export const SEED_INCOME = 6200;

export const SEED_ACCOUNTS: Account[] = [
  {
    id: "acc_bills",
    kind: "bills",
    name: "Bills",
    balance: 1840.27,
    allocation: 0.5,
    history: buildHistory(2400, -10, 80),
  },
  {
    id: "acc_spending",
    kind: "spending",
    name: "Spending",
    balance: 612.08,
    allocation: 0.3,
    history: buildHistory(900, -5, 60),
    isCard: true,
  },
  {
    id: "acc_savings",
    kind: "savings",
    name: "Savings",
    balance: 8420.5,
    allocation: 0.2,
    history: buildHistory(7200, 22, 30),
  },
];

const MERCHANTS_BY_CATEGORY: Record<TransactionCategory, string[]> = {
  Salary: ["Acme Payroll"],
  Rent: ["Maple Heights Apts"],
  Utilities: ["ConEd", "City Water", "Verizon Fios"],
  Groceries: ["Whole Foods", "Trader Joe's", "Wegmans"],
  Coffee: ["Blue Bottle", "Starbucks", "Local Roasters"],
  Restaurants: ["Sweetgreen", "Joe's Pizza", "Tacombi", "Shake Shack"],
  Gas: ["Shell", "BP"],
  Transport: ["Uber", "Lyft", "MTA"],
  Subscriptions: ["Netflix", "Spotify", "iCloud", "NYTimes"],
  Shopping: ["Amazon", "Target", "Uniqlo"],
  Entertainment: ["AMC", "Steam", "Live Nation"],
  Health: ["CVS", "One Medical"],
  Transfer: ["Internal Transfer"],
  Other: ["Misc"],
};

const SPENDING_PLAN: Array<{
  category: TransactionCategory;
  min: number;
  max: number;
  count: number;
}> = [
  { category: "Coffee", min: 4, max: 9, count: 18 },
  { category: "Groceries", min: 35, max: 140, count: 12 },
  { category: "Restaurants", min: 14, max: 65, count: 14 },
  { category: "Transport", min: 3, max: 28, count: 10 },
  { category: "Gas", min: 30, max: 60, count: 4 },
  { category: "Shopping", min: 22, max: 180, count: 7 },
  { category: "Entertainment", min: 12, max: 80, count: 4 },
  { category: "Health", min: 8, max: 60, count: 3 },
];

const BILLS_PLAN: Array<{
  category: TransactionCategory;
  min: number;
  max: number;
  count: number;
}> = [
  { category: "Rent", min: 1800, max: 1800, count: 2 },
  { category: "Utilities", min: 35, max: 140, count: 6 },
  { category: "Subscriptions", min: 6, max: 22, count: 8 },
];

function pick<T>(items: T[]): T {
  return items[Math.floor(rand() * items.length)];
}

function randomAmount(min: number, max: number) {
  const value = min + rand() * (max - min);
  return Math.round(value * 100) / 100;
}

function isoDateNDaysAgo(days: number) {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() - days);
  d.setMinutes(Math.floor(rand() * 60));
  return d.toISOString();
}

function buildTransactions(): Transaction[] {
  const txns: Transaction[] = [];
  let id = 1;
  const next = () => `t_${(id++).toString().padStart(4, "0")}`;

  // Two paychecks in the last 60 days.
  for (const daysAgo of [3, 17, 31, 45]) {
    txns.push({
      id: next(),
      accountId: "acc_bills",
      date: isoDateNDaysAgo(daysAgo),
      merchant: pick(MERCHANTS_BY_CATEGORY.Salary),
      category: "Salary",
      amount: SEED_INCOME / 2,
      note: "Bi-weekly direct deposit",
    });
    // Auto-split into spending + savings
    txns.push({
      id: next(),
      accountId: "acc_bills",
      date: isoDateNDaysAgo(daysAgo),
      merchant: "Internal Transfer",
      category: "Transfer",
      amount: -((SEED_INCOME / 2) * 0.3),
      note: "→ Spending (auto-split 30%)",
    });
    txns.push({
      id: next(),
      accountId: "acc_spending",
      date: isoDateNDaysAgo(daysAgo),
      merchant: "Internal Transfer",
      category: "Transfer",
      amount: (SEED_INCOME / 2) * 0.3,
      note: "← Bills (auto-split 30%)",
    });
    txns.push({
      id: next(),
      accountId: "acc_bills",
      date: isoDateNDaysAgo(daysAgo),
      merchant: "Internal Transfer",
      category: "Transfer",
      amount: -((SEED_INCOME / 2) * 0.2),
      note: "→ Savings (auto-split 20%)",
    });
    txns.push({
      id: next(),
      accountId: "acc_savings",
      date: isoDateNDaysAgo(daysAgo),
      merchant: "Internal Transfer",
      category: "Transfer",
      amount: (SEED_INCOME / 2) * 0.2,
      note: "← Bills (auto-split 20%)",
    });
  }

  // Spending account daily activity.
  for (const plan of SPENDING_PLAN) {
    for (let i = 0; i < plan.count; i += 1) {
      const daysAgo = Math.floor(rand() * HISTORY_DAYS);
      txns.push({
        id: next(),
        accountId: "acc_spending",
        date: isoDateNDaysAgo(daysAgo),
        merchant: pick(MERCHANTS_BY_CATEGORY[plan.category]),
        category: plan.category,
        amount: -randomAmount(plan.min, plan.max),
      });
    }
  }

  // Bills account activity.
  for (const plan of BILLS_PLAN) {
    for (let i = 0; i < plan.count; i += 1) {
      const daysAgo = Math.floor(rand() * HISTORY_DAYS);
      txns.push({
        id: next(),
        accountId: "acc_bills",
        date: isoDateNDaysAgo(daysAgo),
        merchant: pick(MERCHANTS_BY_CATEGORY[plan.category]),
        category: plan.category,
        amount: -randomAmount(plan.min, plan.max),
      });
    }
  }

  // Sort newest first.
  txns.sort((a, b) => (a.date < b.date ? 1 : -1));
  return txns;
}

export const SEED_TRANSACTIONS: Transaction[] = buildTransactions();

export const SEED_GOALS: Goal[] = [
  {
    id: "goal_emergency",
    name: "Emergency fund",
    target: 12000,
    current: 8420.5,
    dueDate: undefined,
  },
  {
    id: "goal_trip",
    name: "Iceland trip",
    target: 3500,
    current: 1240,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
  },
  {
    id: "goal_laptop",
    name: "New laptop",
    target: 2400,
    current: 600,
  },
];

export const SEED_USER = {
  name: "Josh",
};
