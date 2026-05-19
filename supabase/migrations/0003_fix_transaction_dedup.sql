-- 0003: fix Plaid transaction de-duplication
--
-- Migration 0001 created the (external_source, external_id) unique index as
-- a PARTIAL index (WHERE external_source IS NOT NULL AND external_id IS NOT
-- NULL). Postgres cannot use a partial index for ON CONFLICT inference
-- without the matching predicate, which PostgREST/Supabase upsert does not
-- expose — so the Plaid sync upsert fails with "no unique or exclusion
-- constraint matching the ON CONFLICT specification".
--
-- Recreate it as a plain (non-partial) unique index. Manual transactions
-- carry external_id = NULL; NULLs are distinct in a unique index, so any
-- number of manual rows are still permitted.

drop index if exists public.transactions_external_unique;

create unique index transactions_external_unique
  on public.transactions (external_source, external_id);
