-- 0005: auto-split on tagged income + bucket vs bank balance separation
--
-- A. Separate balances. accounts.balance is now treebudget's authoritative
--    ledger (moved by manual transactions and auto-split). Plaid's reported
--    real-account balance moves to accounts.plaid_balance and is only used
--    to detect drift between the buckets and the actual bank.
--
-- B. Auto-split on income. transactions.split_applied marks an income that
--    has been split across buckets; transactions.parent_transaction_id is
--    set on the generated transfer rows so they can be found and undone
--    later.

alter table public.accounts
  add column if not exists plaid_balance numeric(14,2);

alter table public.transactions
  add column if not exists split_applied boolean not null default false,
  add column if not exists parent_transaction_id uuid
    references public.transactions(id) on delete cascade;

create index if not exists transactions_parent_idx
  on public.transactions(parent_transaction_id)
  where parent_transaction_id is not null;
