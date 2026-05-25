// Generates a realistic-looking set of demo transactions + goals for a
// user. Deterministic (seeded PRNG) so demos look the same each load.

type DemoTxn = {
  user_id: string;
  account_id: string;
  merchant: string;
  category: string;
  amount: number;
  note: string | null;
  posted_at: string;
  external_source: "demo";
  external_id: string;
};

type DemoGoal = {
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  due_date: string | null;
};

type AccountIds = {
  bills: string;
  spending: string;
  savings: string;
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const PAYCHECK_DAYS_AGO = [3, 17, 31, 45];
const PAYCHECK_AMOUNT = 2500;

const SPENDING_PLAN: Array<{
  category: string;
  merchants: string[];
  min: number;
  max: number;
  count: number;
}> = [
  {
    category: "Coffee",
    merchants: ["Blue Bottle", "Starbucks", "Local Roasters"],
    min: 4,
    max: 9,
    count: 18,
  },
  {
    category: "Groceries",
    merchants: ["Whole Foods", "Trader Joe's", "Wegmans"],
    min: 35,
    max: 140,
    count: 10,
  },
  {
    category: "Restaurants",
    merchants: ["Sweetgreen", "Joe's Pizza", "Tacombi", "Shake Shack"],
    min: 14,
    max: 65,
    count: 12,
  },
  {
    category: "Transport",
    merchants: ["Uber", "Lyft", "MTA"],
    min: 3,
    max: 28,
    count: 8,
  },
  { category: "Gas", merchants: ["Shell", "BP"], min: 30, max: 60, count: 3 },
  {
    category: "Shopping",
    merchants: ["Amazon", "Target", "Uniqlo"],
    min: 22,
    max: 180,
    count: 6,
  },
  {
    category: "Entertainment",
    merchants: ["AMC", "Steam", "Live Nation"],
    min: 12,
    max: 80,
    count: 3,
  },
  {
    category: "Health",
    merchants: ["CVS", "One Medical"],
    min: 8,
    max: 60,
    count: 2,
  },
];

const BILLS_PLAN: Array<{
  category: string;
  merchants: string[];
  min: number;
  max: number;
  count: number;
}> = [
  { category: "Rent", merchants: ["Maple Heights Apts"], min: 1800, max: 1800, count: 2 },
  {
    category: "Utilities",
    merchants: ["ConEd", "City Water", "Verizon Fios"],
    min: 35,
    max: 140,
    count: 6,
  },
  {
    category: "Subscriptions",
    merchants: ["Netflix", "Spotify", "iCloud", "NYTimes"],
    min: 6,
    max: 22,
    count: 8,
  },
];

function isoDateNDaysAgo(days: number, hour: number, minute: number) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function futureIsoDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export type DemoBundle = {
  transactions: DemoTxn[];
  goals: DemoGoal[];
  balances: { bills: number; spending: number; savings: number };
};

export function buildDemoBundle(
  userId: string,
  accountIds: AccountIds,
): DemoBundle {
  const rand = mulberry32(20260513);
  const transactions: DemoTxn[] = [];
  let counter = 1;
  const nextId = () => `demo_${counter++}_${userId.slice(0, 6)}`;

  const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const amount = (min: number, max: number) =>
    Math.round((min + rand() * (max - min)) * 100) / 100;

  // Paychecks: $2,500 every 14 days, with manual splits to Spending + Savings
  // (representing a user who already does the splits at their bank).
  for (const daysAgo of PAYCHECK_DAYS_AGO) {
    const spendingShare = Math.round(PAYCHECK_AMOUNT * 0.3 * 100) / 100;
    const savingsShare = Math.round(PAYCHECK_AMOUNT * 0.2 * 100) / 100;

    transactions.push({
      user_id: userId,
      account_id: accountIds.bills,
      merchant: "Acme Payroll",
      category: "Salary",
      amount: PAYCHECK_AMOUNT,
      note: "Bi-weekly direct deposit",
      posted_at: isoDateNDaysAgo(daysAgo, 9, 5),
      external_source: "demo",
      external_id: nextId(),
    });
    transactions.push({
      user_id: userId,
      account_id: accountIds.bills,
      merchant: "Internal Transfer",
      category: "Transfer",
      amount: -spendingShare,
      note: "→ Spending",
      posted_at: isoDateNDaysAgo(daysAgo, 9, 10),
      external_source: "demo",
      external_id: nextId(),
    });
    transactions.push({
      user_id: userId,
      account_id: accountIds.spending,
      merchant: "Internal Transfer",
      category: "Transfer",
      amount: spendingShare,
      note: "← Bills",
      posted_at: isoDateNDaysAgo(daysAgo, 9, 10),
      external_source: "demo",
      external_id: nextId(),
    });
    transactions.push({
      user_id: userId,
      account_id: accountIds.bills,
      merchant: "Internal Transfer",
      category: "Transfer",
      amount: -savingsShare,
      note: "→ Savings",
      posted_at: isoDateNDaysAgo(daysAgo, 9, 12),
      external_source: "demo",
      external_id: nextId(),
    });
    transactions.push({
      user_id: userId,
      account_id: accountIds.savings,
      merchant: "Internal Transfer",
      category: "Transfer",
      amount: savingsShare,
      note: "← Bills",
      posted_at: isoDateNDaysAgo(daysAgo, 9, 12),
      external_source: "demo",
      external_id: nextId(),
    });
  }

  for (const plan of SPENDING_PLAN) {
    for (let i = 0; i < plan.count; i += 1) {
      const daysAgo = Math.floor(rand() * 50);
      transactions.push({
        user_id: userId,
        account_id: accountIds.spending,
        merchant: pick(plan.merchants),
        category: plan.category,
        amount: -amount(plan.min, plan.max),
        note: null,
        posted_at: isoDateNDaysAgo(
          daysAgo,
          8 + Math.floor(rand() * 12),
          Math.floor(rand() * 60),
        ),
        external_source: "demo",
        external_id: nextId(),
      });
    }
  }

  for (const plan of BILLS_PLAN) {
    for (let i = 0; i < plan.count; i += 1) {
      const daysAgo = Math.floor(rand() * 55);
      transactions.push({
        user_id: userId,
        account_id: accountIds.bills,
        merchant: pick(plan.merchants),
        category: plan.category,
        amount: -amount(plan.min, plan.max),
        note: null,
        posted_at: isoDateNDaysAgo(daysAgo, 12, Math.floor(rand() * 60)),
        external_source: "demo",
        external_id: nextId(),
      });
    }
  }

  // Compute balances by summing transactions per account.
  const balances = { bills: 0, spending: 0, savings: 0 };
  for (const t of transactions) {
    if (t.account_id === accountIds.bills) balances.bills += t.amount;
    else if (t.account_id === accountIds.spending) balances.spending += t.amount;
    else if (t.account_id === accountIds.savings) balances.savings += t.amount;
  }
  // Pad the starting position so balances look lived-in, not razor-thin.
  balances.bills = Math.round((balances.bills + 1200) * 100) / 100;
  balances.spending = Math.round((balances.spending + 480) * 100) / 100;
  balances.savings = Math.round((balances.savings + 6800) * 100) / 100;

  const goals: DemoGoal[] = [
    {
      user_id: userId,
      name: "Emergency fund",
      target_amount: 12000,
      current_amount: 4200,
      due_date: null,
    },
    {
      user_id: userId,
      name: "Trip to Lisbon",
      target_amount: 3500,
      current_amount: 1240,
      due_date: futureIsoDate(180),
    },
    {
      user_id: userId,
      name: "New laptop",
      target_amount: 2400,
      current_amount: 600,
      due_date: null,
    },
  ];

  return { transactions, goals, balances };
}
