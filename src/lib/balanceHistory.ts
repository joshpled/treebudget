import type { Account, Transaction } from "./types";

/**
 * Walk back from an account's current balance, subtracting each day's
 * transaction deltas to derive end-of-day balances for the last N days.
 *
 * Returns an array of length `days`, oldest → newest. The last element is
 * today's balance. Used to fill the AccountCard sparkline.
 */
export function computeBalanceHistory(
  account: Pick<Account, "id" | "balance">,
  transactions: Pick<Transaction, "account_id" | "amount" | "posted_at">[],
  days: number = 30,
): number[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sum this account's transactions by day-of-posting.
  const deltasByDay = new Map<string, number>();
  for (const t of transactions) {
    if (t.account_id !== account.id) continue;
    const day = new Date(t.posted_at);
    if (Number.isNaN(day.getTime())) continue;
    const key = day.toISOString().slice(0, 10);
    deltasByDay.set(key, (deltasByDay.get(key) ?? 0) + Number(t.amount));
  }

  // Walk backward: today's balance is current; yesterday's end balance is
  // today's minus today's net delta; and so on.
  const out: number[] = new Array(days);
  let running = Number(account.balance);
  for (let i = 0; i < days; i += 1) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    out[days - 1 - i] = Math.round(running * 100) / 100;
    running -= deltasByDay.get(key) ?? 0;
  }
  return out;
}
