# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start local dev server (Next.js)
npm run build        # production build
npm run typecheck    # tsc --noEmit (no test runner, use this to catch type errors)
npm run test:e2e     # Playwright E2E (requires E2E_BASE_URL env var — see below)
npm run test:e2e:report  # open last Playwright HTML report
```

There are no unit tests. All automated testing is Playwright E2E.

### Running E2E tests

Tests run against a **deployed URL**, not localhost. They require:

```bash
E2E_BASE_URL=https://your-preview.vercel.app
E2E_EMAIL=...    # dedicated throwaway test account
E2E_PASSWORD=...
```

Tests run serially (workers: 1) because they share one test account that gets reset between each test. The primary way to run them is via GitHub Actions → **E2E tests** → **Run workflow**. To run a single spec locally:

```bash
E2E_BASE_URL=... E2E_EMAIL=... E2E_PASSWORD=... npx playwright test e2e/goals.spec.ts
```

## Architecture

### Stack

Next.js 15 App Router + Supabase (auth + Postgres + RLS) + Plaid (bank sync) + Tailwind CSS.

### Route groups

- `src/app/(app)/` — authenticated app (dashboard, transactions, goals, settings). Layout renders `AppSidebar` (desktop) + `BottomNav` (mobile).
- `src/app/(auth)/` — sign-in, sign-up, check-email pages.
- `src/app/(marketing)/` — public landing and pricing pages.
- `src/app/onboarding/` — 4-step wizard for new users; exempt from the app layout.
- `src/app/api/plaid/` — REST routes for Plaid (webhook, link-token, token exchange, sync, accounts, unlink).

### Auth and routing

`src/middleware.ts` → `src/lib/supabase/middleware.ts` runs on every request:
1. Unauthenticated users → redirect to `/sign-in`.
2. Signed-in users on marketing/auth pages → redirect to `/dashboard`.
3. Signed-in users with `profiles.onboarded_at = null` → redirect to `/onboarding`.

### Data model

Every user is provisioned 3 fixed accounts on signup via a Postgres trigger (`handle_new_user`): **bills** (50%), **spending** (30%), **savings** (20%). These are the only `AccountKind` values that receive income splits.

**Transaction amounts are signed**: positive = inbound (income), negative = outgoing (spend). This is the inverse of Plaid's convention — Plaid amounts are negated on import.

**Income split** (`applyIncomeSplit` in `src/app/actions/budget.ts`): tagging an income transaction inserts child `Transfer` transactions (one consolidated debit on the source + one credit per destination), sets `parent_transaction_id`, and flags the parent with `split_applied: true`. `undoIncomeSplit` reverses this cleanly. Transactions with `split_applied: true` or a `parent_transaction_id` cannot be edited or deleted directly.

### Supabase clients

Two separate clients with different privilege levels:

| Client | File | Key used | When to use |
|--------|------|----------|-------------|
| Server (SSR) | `src/lib/supabase/server.ts` | anon key + user session cookie | All Server Components and Server Actions |
| Admin | `src/lib/supabase/admin.ts` | service role key (bypasses RLS) | Plaid webhook only — every query must be manually scoped to a `user_id` |

Row Level Security is enabled on all tables; every user can only read/write their own rows.

### Plaid integration

Plaid access tokens are stored encrypted in `bank_links.access_token_encrypted` using AES-256-GCM (`src/lib/crypto.ts`). The encryption key comes from `PLAID_TOKEN_ENCRYPTION_KEY` (base64-encoded 32-byte key).

The webhook at `/api/plaid/webhook` is the primary sync mechanism. It verifies the Plaid signature (`src/lib/plaid/verify-webhook.ts`), then calls `syncTransactionsForLink` (`src/lib/plaid/sync.ts`). A cursor-resumption guard prevents locking in a stale pre-extraction cursor on the very first sync.

`accounts.balance` is treebudget's authoritative ledger — it is updated by every transaction add/edit/delete. `accounts.plaid_balance` is the bank's reported balance (display-only; it never overwrites `balance` once non-zero).

### Mutations

All data mutations go through Next.js Server Actions in `src/app/actions/`:
- `budget.ts` — transactions (add/edit/delete), income split/undo, income+split save, onboarding complete, account reset, demo data load.
- `goals.ts` — goal CRUD.
- `setup.ts` — setup step toggle + dismiss.

All actions validate input with Zod and call `revalidatePath("/", "layout")` after writes.

### DB layer

`src/lib/db/` contains typed query helpers (`listAccounts`, `listTransactions`, `getCurrentProfile`, etc.) that wrap the Supabase server client. These are called directly from Server Components (pages).

### Styling

CSS custom properties are defined in `src/app/globals.css` for the color tokens (`--bg`, `--surface`, `--ink`, `--muted`, `--border`, `--primary`, etc.). Tailwind maps these via `tailwind.config.ts`. Dark mode uses the `class` strategy. `src/lib/cn.ts` is a small `clsx` + `tailwind-merge` helper.

## Required environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
PLAID_CLIENT_ID
PLAID_SECRET
PLAID_ENV                      # sandbox | development | production
PLAID_TOKEN_ENCRYPTION_KEY     # base64-encoded 32-byte AES key
PLAID_WEBHOOK_URL              # public URL for /api/plaid/webhook
```
