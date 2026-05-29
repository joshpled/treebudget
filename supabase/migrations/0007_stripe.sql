alter table public.profiles
  add column stripe_customer_id text,
  add column stripe_subscription_id text,
  add column stripe_subscription_status text;
