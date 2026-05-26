# End-to-end tests

Playwright drives a real browser against a deployed URL. Tests live in
`e2e/` and run in **GitHub Actions** — there's no local dev environment
needed.

## How to run

1. Open github.com → `joshpled/treebudget` → **Actions** tab.
2. In the left sidebar, select **E2E tests**.
3. Tap **Run workflow** (top right). Optionally type a base URL to test;
   otherwise the secret `E2E_BASE_URL` is used.
4. Tap the green **Run workflow** button. Refresh in ~3–5 min — green check
   means all tests passed, red X means something failed.
5. To see *what* failed: click into the failed run, scroll to **Artifacts**
   at the bottom, download **playwright-report**. Unzip and open
   `index.html` — screenshots and video clips of each failure included.

## What's covered

| File                       | Covers                                                                           |
| -------------------------- | -------------------------------------------------------------------------------- |
| `auth.spec.ts`             | Gated-route redirect, public landing, email sign-in, wrong-password rejection, sign-out |
| `onboarding.spec.ts`       | 4-step wizard, income-field stuck-zero regression, already-onboarded redirect    |
| `transactions.spec.ts`     | Add spend, add income, edit (with balance correction), delete (with reversal)    |
| `auto-split.spec.ts`       | Apply split (verifies all 3 bucket balances), undo split, reject editing a split-applied income |
| `goals.spec.ts`            | Create, edit, delete, empty state, validation errors                             |
| `setup-guide.spec.ts`      | Toggle a checklist step + verify it persists, dismiss Home progress card         |

## What's *not* covered (manual only — see `TESTING.md`)

- **Email-confirmation links** (mail.tm/maildrop) — uses a pre-confirmed test account.
- **Google OAuth** — Google blocks browser bots.
- **Plaid Link iframe** — too iframe-heavy and noisy to automate reliably.
- **iOS-specific behavior** — haptics, PWA mode, the iOS keyboard pushing
  sheets — has to be tested on a real device.
- **Visual regressions** (e.g. "this animation looks janky") — would need a
  separate tool like Percy or Chromatic.

## How tests are set up

Every test:

1. Signs in as the dedicated E2E account (`E2E_EMAIL` / `E2E_PASSWORD`).
2. Resets that account (Settings → Reset account) so the test starts from
   a known-empty state.
3. Walks the onboarding wizard so the account is "ready."
4. Runs the assertion.

Auth, gated-route, and landing tests skip the reset step where appropriate.

## Secrets the workflow needs

Set these in **GitHub → repo → Settings → Secrets and variables → Actions**:

| Secret           | Value                                                 |
| ---------------- | ----------------------------------------------------- |
| `E2E_BASE_URL`   | Your production URL (e.g. `https://treebudget.vercel.app`) |
| `E2E_EMAIL`      | Email of the dedicated E2E test account              |
| `E2E_PASSWORD`   | Password of that account                              |

## Concurrency

Tests share a single account, so they run **serially** (workers: 1). Two
workflow runs in flight at the same time would collide. The workflow uses
a concurrency group so back-to-back runs on the same branch will queue,
not overlap.

## Adding new tests

When new features land:

1. Add a spec file under `e2e/` named after the feature.
2. Use `signIn` / `resetAccount` / `completeOnboarding` / `loadDemoData`
   from `e2e/helpers.ts` for setup.
3. Prefer **role + accessible name** locators (`getByRole`, `getByLabel`)
   over class/CSS selectors so tests stay resilient to visual tweaks.

## Tradeoffs / known limits

- One persistent test account → no parallelism; ~3 min wall clock per run.
- Tests run against **production** by default. Each run wipes the test
  account's data. Make sure it's truly a throwaway account, not anything
  you care about.
- A test failure on production *means production is broken*. Use the manual
  trigger to verify a fix before merging.
