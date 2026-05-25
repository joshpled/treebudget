import type { SetupStepId } from "@/lib/types";

export type SetupStep = {
  id: SetupStepId;
  title: string;
  summary: string;
  body: string[];
};

export const SETUP_STEPS: SetupStep[] = [
  {
    id: "spending_account",
    title: "Open a separate Spending checking account",
    summary:
      "The card you carry day-to-day. The Spending balance becomes your weekly limit.",
    body: [
      "If you already have two checking accounts, you can use your existing one and skip ahead.",
      "Otherwise, open a no-fee second checking at any bank that doesn't charge for it (see recommendations below).",
      "Move only the debit card for this account into your wallet — the Bills card stays home.",
    ],
  },
  {
    id: "savings_account",
    title: "Open a separate Savings account",
    summary: "Where the 20% (or whatever you chose) accumulates.",
    body: [
      "Any high-yield savings works. The point is friction: the money isn't on the card you carry.",
      "You can keep this at the same bank as Bills for easy transfers.",
    ],
  },
  {
    id: "connected_in_app",
    title: "Connect all three accounts in treebudget",
    summary:
      "Settings → Accounts → Connect a bank. Map each real account to its bucket.",
    body: [
      "treebudget reads transactions and balances — read-only, no money movement.",
      "If you have more than three accounts, just map the three that fund Bills / Spending / Savings.",
    ],
  },
  {
    id: "direct_deposit_split",
    title: "Split your direct deposit at your employer",
    summary:
      "The one-time setup that makes the split automatic forever. Ask HR for a direct deposit form.",
    body: [
      "Most employers let you split a paycheck across multiple accounts by percentage.",
      "Use the snippet below — copy it, edit if needed, and send it to HR or paste it into your payroll portal.",
      "If your paycheck arrives by check or cash (servers, tips), skip this and lean on auto-transfers instead.",
    ],
  },
  {
    id: "auto_transfers",
    title: "Schedule recurring auto-transfers at your bank",
    summary:
      "For tipped income, side gigs, or anything that doesn't come via direct deposit.",
    body: [
      "Most online banking apps let you schedule a weekly or monthly transfer between your accounts.",
      "Easiest pattern: a single weekly transfer out of Bills to Spending + Savings, matching your percentages.",
      "When you tag income in treebudget (coming soon), the app will tell you exactly what to move.",
    ],
  },
];

export type BankRec = {
  name: string;
  why: string;
  url: string;
};

export const BANK_RECOMMENDATIONS: BankRec[] = [
  {
    name: "SoFi",
    why: "Built-in Vaults let you split one account into named buckets — closest match to treebudget's model in a single login.",
    url: "https://www.sofi.com/banking/",
  },
  {
    name: "Ally",
    why: "Buckets feature inside their savings account, plus separate no-fee checking. Strong direct-deposit split.",
    url: "https://www.ally.com/bank/",
  },
  {
    name: "Capital One 360",
    why: "No-fee 360 Checking — easy to open multiple in the same login and label them Bills / Spending / Savings.",
    url: "https://www.capitalone.com/bank/checking-accounts/",
  },
];

export type BigBankGuide = {
  name: string;
  openSecond: string;
  splitDeposit: string;
};

export const BIG_BANKS: BigBankGuide[] = [
  {
    name: "Chase",
    openSecond:
      "Sign in → 'Open an account' → Total Checking → choose a different account name (e.g. 'Spending'). Same login, separate balance.",
    splitDeposit:
      "Profile → Direct deposit → Set up. Add each Chase account number with a percentage.",
  },
  {
    name: "Bank of America",
    openSecond:
      "Menu → 'Open an account' → Advantage SafeBalance or Advantage Plus → name it 'Spending'. Use a different debit card.",
    splitDeposit:
      "Profile → Pay & transfer → Direct deposit. BoA gives you a pre-filled form to send to HR.",
  },
  {
    name: "Wells Fargo",
    openSecond:
      "More → 'Open an account' → Everyday Checking → add a second to the same profile.",
    splitDeposit:
      "More → Transfer and pay → Set up direct deposit → choose split allocation per account.",
  },
];
