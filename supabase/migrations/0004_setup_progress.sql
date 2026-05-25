-- 0004: persist "real-money setup" progress on the profile
--
-- The setup guide (/setup) is a 5-step checklist that helps users
-- actually mirror treebudget's bucket model at their real bank. We track
-- per-step completion and a dismissal timestamp for the Home banner.

alter table public.profiles
  add column if not exists setup_steps jsonb not null default '{}'::jsonb,
  add column if not exists setup_dismissed_at timestamptz;
