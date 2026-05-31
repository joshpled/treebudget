alter table public.profiles
  add column cancel_at_period_end boolean not null default false,
  add column cancel_at timestamptz;
