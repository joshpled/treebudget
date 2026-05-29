alter table public.profiles
  add column tier text not null default 'free'
  check (tier in ('free', 'paid'));
