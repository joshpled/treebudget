-- treebudget initial schema
-- Run in Supabase Studio: SQL Editor → New query → paste → Run.
-- Idempotent enough to re-run during early development.

-- =============================================================
-- profiles
-- =============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  display_name text,
  monthly_income numeric(12,2) not null default 6000,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- accounts
-- Each user gets the three starter accounts on signup via trigger.
-- =============================================================
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('bills','spending','savings','investment','other')),
  name text not null,
  allocation numeric(5,4) not null default 0 check (allocation >= 0 and allocation <= 1),
  balance numeric(14,2) not null default 0,
  is_card boolean not null default false,
  archived boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists accounts_user_id_idx on public.accounts(user_id);

-- =============================================================
-- transactions
-- Signed amount: positive = inbound, negative = spend.
-- external_* fields are reserved for Plaid dedupe in the next milestone.
-- =============================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  merchant text not null,
  category text not null,
  amount numeric(14,2) not null,
  note text,
  posted_at timestamptz not null,
  external_source text,
  external_id text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_posted_idx
  on public.transactions(user_id, posted_at desc);
create index if not exists transactions_account_posted_idx
  on public.transactions(account_id, posted_at desc);
create unique index if not exists transactions_external_unique
  on public.transactions(external_source, external_id)
  where external_source is not null and external_id is not null;

-- =============================================================
-- goals
-- =============================================================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null check (target_amount > 0),
  current_amount numeric(14,2) not null default 0 check (current_amount >= 0),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goals_user_id_idx on public.goals(user_id);

-- =============================================================
-- updated_at trigger
-- =============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_accounts_updated_at on public.accounts;
create trigger set_accounts_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

drop trigger if exists set_goals_updated_at on public.goals;
create trigger set_goals_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- =============================================================
-- Row Level Security: every table is "owner reads/writes own rows only".
-- =============================================================
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;

-- profiles: id is the user id
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- accounts / transactions / goals: scope by user_id
do $$
declare t text;
begin
  foreach t in array array['accounts','transactions','goals']
  loop
    execute format($f$
      drop policy if exists "%1$s_select_own" on public.%1$s;
      create policy "%1$s_select_own" on public.%1$s
        for select using (user_id = auth.uid());

      drop policy if exists "%1$s_insert_own" on public.%1$s;
      create policy "%1$s_insert_own" on public.%1$s
        for insert with check (user_id = auth.uid());

      drop policy if exists "%1$s_update_own" on public.%1$s;
      create policy "%1$s_update_own" on public.%1$s
        for update using (user_id = auth.uid()) with check (user_id = auth.uid());

      drop policy if exists "%1$s_delete_own" on public.%1$s;
      create policy "%1$s_delete_own" on public.%1$s
        for delete using (user_id = auth.uid());
    $f$, t);
  end loop;
end$$;

-- =============================================================
-- Signup trigger: create profile + 3 starter accounts on auth.users insert.
-- Runs as SECURITY DEFINER so it can bypass RLS during the seed.
-- =============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  full_name text := nullif(coalesce(meta->>'full_name', meta->>'name', ''), '');
begin
  insert into public.profiles (id, full_name, display_name, monthly_income, onboarded_at)
  values (
    new.id,
    full_name,
    full_name,
    6000,
    null
  )
  on conflict (id) do nothing;

  insert into public.accounts (user_id, kind, name, allocation, balance, is_card, position)
  values
    (new.id, 'bills',    'Bills',    0.50, 0, false, 0),
    (new.id, 'spending', 'Spending', 0.30, 0, true,  1),
    (new.id, 'savings',  'Savings',  0.20, 0, false, 2)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- Backfill: if you already created a user before running this migration,
-- seed their profile + accounts now.
-- =============================================================
insert into public.profiles (id, full_name, display_name, monthly_income, onboarded_at)
select
  u.id,
  nullif(coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''), ''),
  nullif(coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''), ''),
  6000,
  null
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

insert into public.accounts (user_id, kind, name, allocation, balance, is_card, position)
select u.id, kind, name, allocation, 0, is_card, position
from auth.users u
cross join (values
  ('bills','Bills',0.50::numeric,false,0),
  ('spending','Spending',0.30::numeric,true,1),
  ('savings','Savings',0.20::numeric,false,2)
) as starter(kind,name,allocation,is_card,position)
where not exists (
  select 1 from public.accounts a where a.user_id = u.id
);
