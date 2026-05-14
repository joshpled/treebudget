-- treebudget plaid integration schema
-- Adds bank_links (one row per connected institution) and links
-- transactions + accounts to Plaid via stable external ids.
-- Run in Supabase Studio SQL Editor.

-- =============================================================
-- bank_links
-- One row per Plaid Item (one institution). access_token is
-- stored as a base64-encoded AES-256-GCM ciphertext from
-- src/lib/crypto.ts; raw tokens never touch the database.
-- =============================================================
create table if not exists public.bank_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'plaid',
  plaid_item_id text not null,
  access_token_encrypted text not null,
  cursor text,                         -- Plaid /transactions/sync cursor
  institution_id text,
  institution_name text,
  status text not null default 'active',  -- 'active' | 'login_required' | 'revoked'
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, plaid_item_id)
);

create index if not exists bank_links_user_id_idx on public.bank_links(user_id);

drop trigger if exists set_bank_links_updated_at on public.bank_links;
create trigger set_bank_links_updated_at
  before update on public.bank_links
  for each row execute function public.set_updated_at();

-- =============================================================
-- Extend accounts + transactions for Plaid linkage
-- =============================================================
alter table public.accounts
  add column if not exists plaid_account_id text,
  add column if not exists bank_link_id uuid references public.bank_links(id) on delete set null;

create unique index if not exists accounts_plaid_account_unique
  on public.accounts(plaid_account_id)
  where plaid_account_id is not null;

-- (transactions already has external_source + external_id from 0001)

-- =============================================================
-- RLS for bank_links
-- =============================================================
alter table public.bank_links enable row level security;

drop policy if exists "bank_links_select_own" on public.bank_links;
create policy "bank_links_select_own" on public.bank_links
  for select using (user_id = auth.uid());

drop policy if exists "bank_links_insert_own" on public.bank_links;
create policy "bank_links_insert_own" on public.bank_links
  for insert with check (user_id = auth.uid());

drop policy if exists "bank_links_update_own" on public.bank_links;
create policy "bank_links_update_own" on public.bank_links
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "bank_links_delete_own" on public.bank_links;
create policy "bank_links_delete_own" on public.bank_links
  for delete using (user_id = auth.uid());
