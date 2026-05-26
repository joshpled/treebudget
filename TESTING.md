# treebudget — manual test plan

Work top-to-bottom. Each section names the area, lists the actions to take, and what you should see. The **🐞** items are the things most likely to be subtly wrong — pay close attention.

Test on **iPhone Safari** primarily; spot-check **desktop Chrome/Firefox** in the responsive sections. Use the demo account credentials in `.notes.local.md` to keep your real data separate. After any destructive flow, you can hit Settings → **Reset account** → **Load demo data** to get back to a known-good state.

---

## Pre-flight

1. **Vercel deploy is current.** vercel.com → your project → Deployments → top entry should be Ready and within the last few minutes. Note the commit hash (`b64bfe6` or later). Hard-reload Safari (long-press refresh → Reload Without Cache) before starting.
2. **Supabase migration is current.** All migrations 0001 through 0005 should be applied. (0005 was applied via MCP this session — no action needed unless you suspect drift.)
3. **Demo account is fresh.** Sign in with demo creds → Settings → Reset → Load demo data. You should land on Home with ~80 transactions, 3 goals, and lived-in balances.

---

## A. Marketing site (public, no login)

Sign out first, or open in a private tab.

1. **Landing — `/`**
   - Hero loads with the headline "Budget without the spreadsheet" and a phone preview to the right (or stacked on mobile).
   - The "Get started — it's $9.99/mo" CTA and "See pricing" button are visible.
   - Scroll down: "How it works" (3 cards), "What you get" with the 4-feature list and feature-card cluster, pricing teaser, footer.
   - Animations: hero text rises in on load (small fade + slide). Cards lift slightly on hover (desktop only).
   - 🐞 Watch for content reflowing awkwardly on small screens, or animations re-triggering on tab focus.

2. **Header nav (signed out)**
   - Logo on the left, "Pricing / Sign in / Get started" on the right.
   - Tap "Pricing" → goes to `/pricing`.
   - Tap "Sign in" → goes to `/sign-in`.
   - Tap "Get started" → goes to `/sign-up`.

3. **Pricing — `/pricing`**
   - Single plan card centered. Default cycle is **Monthly $9.99**.
   - Tap **Yearly** → price changes to **$99/year**, shows "≈ $8.25 / month" subtext, "Save 17%" badge highlights.
   - Tap **Monthly** again → returns to $9.99 cleanly.
   - The "Get started — $9.99/month" / "$99/year" CTA reflects the chosen cycle and links to `/sign-up?plan=monthly` or `/sign-up?plan=yearly`.
   - FAQ accordions — tap each → expands; tap again → collapses. The "+" rotates to "×".

4. **Footer**
   - Logo + tagline on the left, link list on the right.
   - All links navigate correctly.

5. **Signed-in user on `/` or `/pricing`**
   - 🐞 Sign in, then manually navigate to `/`. You should be bounced to `/dashboard` (middleware redirect). If you can sit on `/` while signed in, that's a bug.

---

## B. Auth

1. **Sign up with email**
   - From `/sign-up`: enter your name, a fresh email, password ≥ 8 chars → Create account.
   - You should land on `/check-email` saying a confirmation link was sent.
   - Open the email (mail.tm for demo) and click the verification link.
   - You should land on `/dashboard` (or `/onboarding` if onboarded_at is null).
   - 🐞 If the verification link takes you to localhost or a wrong domain, that's a Supabase URL-config bug.

2. **Sign up with Google**
   - From `/sign-up`: tap **Continue with Google** → Google popup → pick an account.
   - You should land on `/dashboard` (or `/onboarding`).
   - 🐞 If the Google flow fails with "redirect_uri_mismatch," the OAuth client redirect URI doesn't match Supabase's callback URL.

3. **Sign in with email**
   - Sign out → `/sign-in` → email + password → Sign in.
   - You should land on `/dashboard`.

4. **Sign in with Google**
   - Same as above but tap **Sign in with Google**.

5. **Sign out**
   - Settings → Sign out (red item under the Account section).
   - You should land on `/sign-in`. Hitting any gated route (e.g. `/dashboard`) redirects back to `/sign-in?next=/dashboard`.
   - 🐞 If you can still see authenticated pages after signing out, the cookie isn't being cleared.

6. **Wrong password**
   - From `/sign-in`: enter the right email, wrong password → Sign in.
   - You should see an inline error message under the form. No redirect.

7. **"next" parameter**
   - While signed out, navigate to `/dashboard` directly. You land at `/sign-in?next=/dashboard`.
   - Sign in. You should land on `/dashboard` (not the marketing landing).

---

## C. Onboarding

Reset the demo account to trigger onboarding (or sign up a fresh account).

1. **Step 1 — income**
   - Field is empty/0 by default. The Continue button is **disabled**.
   - Type "4000" → Continue is now active.
   - **🐞 Bug-check the income field**: clear it completely (delete every digit). It should go to empty — NOT show a stuck "0" you can't delete. Type new value freely.
   - Continue → Step 2.

2. **Step 2 — split percentages**
   - Sliders default to 50 / 30 / 20.
   - Drag any slider — total stays at 100 (other sliders auto-adjust).
   - Center value in the donut shows "100%".
   - 🐞 If the total ever shows non-100, the auto-balance logic broke.
   - "Looks good" → Step 3.

3. **Step 3 — confirm**
   - Three rows (Bills / Spending / Savings) with the dollar amount each gets per month and the percentage.
   - Spending row has a "Card" badge.
   - "Got it" → Step 4.

4. **Step 4 — how it tracks (the new one)**
   - Three info cards: "treebudget tracks the three buckets", "To make them real, your money has to move at your bank", "Or just use it as a tracker".
   - "Take me in" → server saves income + split + onboarded_at → redirects to `/dashboard`.

5. **Back navigation**
   - From any step 2+, tap **Back** → returns to previous step without losing values.

6. **Already onboarded**
   - Hit `/onboarding` after onboarding is complete. You should be bounced to `/dashboard`.

---

## D. Dashboard (Home)

After onboarding with demo data loaded, you should be at `/dashboard`.

1. **Greeting + total balance**
   - Time-aware greeting ("Good morning, …") with first name.
   - Total balance is the sum of the three account balances.
   - On desktop only: a secondary "Monthly income" stat in the top-right.

2. **Account cards (3)**
   - Bills / Spending / Savings, in order.
   - Each shows: name, allocation % chip, current balance, monthly allocation, small sparkline.
   - 🐞 **Sparklines should be drawn** (a small green wave) — not empty. If they're flat or absent, the balance-history compute is broken.
   - Tap a card → goes to `/transactions?account=<id>`.

3. **Bucket vs. bank drift indicator**
   - Visible only when an account is Plaid-linked AND the bucket balance differs from the bank balance by > $0.01.
   - Reads "Bank says $X · bucket is $Y".
   - After applying a split (see section H), the source bucket's balance changes but Plaid's number doesn't — the line should appear.

4. **Income split donut**
   - 3-segment donut (Bills/Spending/Savings) with percentages.
   - "Edit" link → `/settings/split`.

5. **Recent activity**
   - 5 most recent transactions, newest first.
   - Tapping any → its detail page.
   - "See all" → `/transactions`.

6. **Setup progress card**
   - Green banner above the cards: "Make it real at your bank — 0/5 (or N/5) steps."
   - Tap it → `/setup`.
   - Tap the **X** to dismiss → reload → it stays dismissed.
   - When all 5 steps are done → card automatically hides.

7. **Empty state**
   - Reset the account (don't load demo data this time). Land on Home → expect a "Get started in 30 seconds" card with three buttons: Add transaction (+), Connect a bank, Load demo data.
   - 🐞 If the empty state appears when you have data, the gating check is wrong.

8. **TopBar (mobile)** — logo, "+" Add transaction button, avatar.
   **AppSidebar (desktop ≥1024px)** — logo + nav + your avatar at the bottom. Bottom nav hidden.

---

## E. Activity (Transactions)

1. **List**
   - Transactions grouped by day, newest day first.
   - Each row: icon (by category), merchant, category · account name, amount, relative date.
   - 🐞 Income rows are **green** with a "+" sign; spends are dark with the minus baked into formatting.

2. **Filter chips**
   - "All" + one chip per core account.
   - Tap "Bills" → URL becomes `/transactions?account=…`, only Bills-account txns show.
   - Tap "All" → back to all.

3. **Empty state**
   - Apply a filter with no matching rows (or reset). "No transactions" message + "Tap + to add your first one."

4. **Transaction detail**
   - Tap any row → `/transactions/{id}`.
   - Big amount, merchant, date · account name at the top.
   - Info section: Account / Category / Date / Note (if any) / Source.

---

## F. Add Transaction

1. **Open sheet**
   - From Home or Activity TopBar, tap the **"+"** button. Sheet slides up with a dark backdrop.
   - Behind it: the page is locked, doesn't scroll.

2. **Spend / Income toggle**
   - Default is **Spend**. Toggle to **Income** — selected pill turns green.

3. **Fields**
   - Amount: type "4.50" — only digits and one dot accepted.
   - Merchant: free text.
   - Account: dropdown of your 3 accounts.
   - Category: dropdown of categories.
   - Note: optional.

4. **Save (Spend)**
   - Enter $4.50, Blue Bottle, Spending, Coffee → Save.
   - Sheet closes, route progress bar flashes, page refreshes.
   - Activity → new row at top with **−$4.50**, Spending account.
   - Home → Spending balance dropped by $4.50.

5. **Save (Income)**
   - Enter $2000, Acme Payroll, Bills, Salary → Save.
   - Activity → new row at top with **+$2,000.00** (green).
   - Home → Bills balance went up by $2000.

6. **Validation**
   - Empty amount → "Enter a valid amount."
   - Empty merchant → "Merchant is required."
   - Amount = 0 (just typing "0") → "Enter a valid amount."

7. **Cancel**
   - Tap **X** or backdrop or press Escape → sheet closes without saving.
   - 🐞 The save button shows a spinner during the action. If it doesn't, the spinner integration broke.

8. **iOS sheet behavior**
   - The sheet must not extend past the top of the screen. The Save button must remain visible.
   - When the keyboard appears (focus a field), the sheet shouldn't get pushed off-screen.

---

## G. Edit + Delete Transaction (new this turn)

1. **Open edit**
   - Open any non-split transaction's detail page.
   - Tap the **pencil** icon in the TopBar (top right).
   - Sheet opens pre-filled with merchant, amount (positive), account, category, note, with the correct **Spend/Income toggle** set.

2. **Edit amount**
   - Change amount to a different value → Save changes.
   - 🐞 The source account's balance must adjust by (new amount − old amount). Verify on Home.

3. **Move to a different account**
   - Change the account dropdown → Save.
   - 🐞 Old account's balance reverses by old amount; new account's balance gets new amount. Net: money "moved" between buckets.

4. **Flip direction**
   - Edit a spend transaction → toggle to Income → Save.
   - 🐞 Account balance should swing by 2× the amount (e.g. -$10 becomes +$10 → balance increases by $20).

5. **Delete**
   - Inside the edit sheet, tap the **Delete transaction** button → browser confirm dialog.
   - Cancel → nothing happens.
   - OK → row removed, balance reversed, you land on `/transactions`.

6. **Editing a split-applied income (should fail)**
   - Apply a split on an income (see section H), then try to edit that income.
   - 🐞 Should error with "Undo the split before editing this income." No silent success.

7. **Editing a split-generated transfer (should fail)**
   - Open a transaction whose Source = "split" (one of the rows auto-generated when you applied a split).
   - The pencil icon should **not appear** on its detail page. Instead a "Part of a split" card explains it.

---

## H. Auto-split on tagged income — **the headline feature**

This is the most important section to test thoroughly.

Set up: with demo data loaded, find an unsplit **Salary** transaction (4 of them in the demo) on the Bills account. Tap it.

1. **Apply split**
   - The "Split this as income" card is visible above the info section, showing the expected distribution ("Bills keeps $1,250 / → Spending $750 / → Savings $500" for a $2500 paycheck with 50/30/20).
   - Tap **Split across accounts**. The button shows a spinner. Brief delay → page refreshes.
   - The card flips to a green "Auto-split applied" panel with the breakdown and an **Undo split** button.

2. **Verify the split landed**
   - Activity feed → three new rows on the same date as the paycheck:
     - **Bills · Auto-split · −$1,250** (consolidated debit on the source)
     - **Spending · Auto-split · +$750**
     - **Savings · Auto-split · +$500**
   - Home balances: Bills changed by `+income − consolidated_debit` = +$1250 (kept its 50%); Spending +$750; Savings +$500.
   - 🐞 If the numbers don't add up cleanly to the original income, the rounding is off.

3. **Tap a split child**
   - Tap one of the auto-generated rows.
   - Its detail page shows "Part of a split" with a link to the parent paycheck.
   - No pencil icon (can't edit a child directly).

4. **Undo split**
   - Back on the parent paycheck's detail → tap **Undo split**.
   - Spinner → page refreshes → card goes back to the original "Split this as income" prompt.
   - Activity feed: the 3 auto-generated rows are gone.
   - Home balances: back to where they were before the split.

5. **Re-apply** — tap Split again to confirm idempotency. Should work cleanly.

6. **Drift indicator**
   - If the source account is Plaid-linked, after split is applied the Account card on Home shows a "Bank says X · bucket is Y" line. Y is the post-split number; X is what Plaid reported.
   - 🐞 If both numbers match exactly, either no Plaid link, or Plaid is wrong somehow.

7. **Edge cases (should all error gracefully — no silent success, no crash)**
   - Try to split a **negative** transaction (a spend) — pencil/sheet doesn't expose the split UI; if you somehow trigger the action, it errors with "Only positive (income) transactions can be split."
   - Try to split an **already-split** income — error "Already split."
   - Try to split a **split-generated transfer** — no UI to do this; if forced, "Can't split a split-generated transfer."

---

## I. Goals (CRUD — new this turn)

1. **View existing goals**
   - Bottom-nav Goals → 3 demo goals (Emergency fund, Trip to Lisbon, New laptop) with progress bars and percent chips.

2. **Add a goal**
   - Tap **+ Add a savings goal** (dashed button at the bottom).
   - Sheet slides up: Name, Target ($), Saved so far ($), Target date (optional).
   - Enter "Iceland trip" / 4000 / 600 / pick a date 3 months out → Create goal.
   - Sheet closes, page refreshes, new goal card appears.

3. **Edit a goal**
   - Tap any goal card → same sheet opens pre-filled.
   - Change target to a larger number → Save changes.
   - Progress bar / percent updates accordingly.

4. **Delete a goal**
   - In the edit sheet, scroll to the bottom → tap **Delete goal** → confirm.
   - Card disappears.

5. **Validation**
   - Empty name → "Name is required."
   - Target = 0 → "Target must be a positive number."
   - Saved-so-far > Target — allowed (over 100% is fine).

6. **Empty state**
   - Delete all goals → page shows "No goals yet. Plant your first goal below."

---

## J. Setup guide ("Make it real at your bank")

1. **Enter the guide**
   - From the green progress card on Home, OR Settings → "Make it real at your bank".

2. **How it works section** — read it. Should be 2 short paragraphs.

3. **Checklist**
   - 5 numbered steps. Each step has a circular checkmark control on the left.
   - Tap any step's row body (not the checkbox) → expands inline with detailed instructions.
   - Tap the checkbox → toggles done (filled green) / not done. Strikethrough on the title when done.
   - 🐞 Refresh the page after toggling — your toggle state should persist (server-side via `profiles.setup_steps`).

4. **Step 3 deep link**
   - Expand step 3 ("Connect all three accounts in treebudget").
   - Tap the green **Go to Connect a bank** button → routes to `/settings/accounts`.

5. **Payroll snippet**
   - Should display your **actual** percentages (e.g. "50% to my Bills checking account...").
   - Tap **Copy** → button briefly shows "Copied ✓". Paste somewhere — text should be exactly the snippet you saw.

6. **Bank recommendations**
   - SoFi, Ally, Capital One 360 — each opens its real website in a new tab.

7. **Big banks**
   - Chase / BoA / Wells — each has "Open a second checking" + "Set up split direct deposit" instructions.

8. **Progress reflects on Home**
   - Toggle one step → Home progress card shows "1/5" etc.
   - Toggle all 5 → Home setup card automatically hides.
   - Dismiss the Home card without finishing → it stays hidden across reloads.

---

## K. Settings

1. **Header**
   - Shows your name + email.

2. **Money section**
   - Income & split → `/settings/split`
   - Accounts → `/settings/accounts`
   - Connect a bank → `/settings/accounts`
   - Make it real at your bank → `/setup`

3. **App section** — all disabled in muted styling: Notifications, Appearance, Privacy & security, Help & feedback. They shouldn't navigate anywhere yet.

4. **Account section**
   - Sign out (red) — works.
   - Load demo data — confirms inline, fills account, redirects to Home.
   - Reset account (red) — confirms inline, wipes data, redirects to onboarding.

5. **Footer** — "treebudget · v0.2" version line.

---

## L. Income & Split editor — `/settings/split`

1. **Loads pre-filled** with current monthly income + split.

2. **Edit income**
   - 🐞 **Same income-field bug to retest here**: clear the field completely → it should show empty placeholder, not a stuck 0. Type new value.

3. **Adjust sliders** — auto-balance to 100. Bottom button shows "Total X% — must be 100%" when invalid.

4. **Save split** — button shows spinner → returns to Settings → new split reflected on Home donut + account allocation chips.

---

## M. Accounts page — `/settings/accounts`

1. **Core accounts list** — 3 rows (Bills / Spending / Savings) with kind, allocation %, current balance. Spending has a "Card" badge.

2. **If you've connected Plaid** — accounts with `plaid_account_id` show a "Linked" badge.

3. **Bank sync section**
   - If 0 banks linked → "Connect a bank" button only.
   - If linked → each bank as a row with **Sync now** + **Change accounts** + trash icon. Below: "Connect another bank" + (in sandbox) "Fire test webhook".

4. **Add more** — three dashed buttons for Investment / Additional checking / Sub-savings. **Not yet functional** — they don't do anything yet (deferred).

---

## N. Plaid (sandbox)

1. **Connect**
   - Tap **Connect a bank** → Plaid Link opens.
   - Search "First Platypus Bank" (not "Balance Bank"). Pick it.
   - Login `user_good` / `pass_good`.

2. **Mapping sheet**
   - Multiple accounts shown with balances and "checking/savings/CD/credit card" subtype labels.
   - Map Plaid Checking → Bills, Plaid Saving → Savings, Skip the rest. Link & sync.

3. **Verify import**
   - Activity feed shows Plaid transactions (categorized).
   - The mapped accounts on Home show non-zero balances.

4. **Sync now**
   - Settings → Accounts → Sync now → message reads "Imported N transactions" / "Up to date" / "Plaid returned 0 transactions" / "Plaid sent X but none on a mapped account."
   - 🐞 Should NEVER silently report success when nothing happened.

5. **Change accounts**
   - Tap **Change accounts** on the bank row. Sheet reopens with the current mapping pre-filled.
   - Re-map → Link & sync. The prior mappings clear and the new ones apply.

6. **Fire test webhook (sandbox only)**
   - Tap the dashed "Fire test webhook" button.
   - In Vercel Logs (Live), see `/api/plaid/webhook` return **200**. Bank row's last-synced timestamp updates without you tapping Sync.

7. **Unlink**
   - Trash icon on the bank row → confirm → row disappears, accounts are unmapped (linked badge gone, balance retained).

---

## O. Responsive layout

1. **Mobile (< 1024px)**
   - Bottom nav: Home / Activity / Goals / Settings.
   - TopBar shows the treebudget logo.
   - All content in a single column at max-w-md.

2. **Desktop (≥ 1024px)**
   - Left sidebar (~256px) with the logo, 5 nav items (Home, Activity, Goals, Setup, Settings), avatar at the bottom.
   - Bottom nav hidden.
   - TopBar's logo hidden (sidebar has it). Page title visible.
   - Content uses the full width (max-w-6xl), with multi-column layouts:
     - Home: 3-column account cards, then 2:3 donut + activity
     - Setup: checklist | payroll+banks side by side, big banks in a 3-col row
     - Settings: Money | App side by side, Account full-width
     - Goals: 2-column grid

3. **Transition**
   - Resize the browser across the 1024px boundary. The layout should swap cleanly. No content lost, no broken alignment.
   - 🐞 The 768–1024 range stays mobile-style. If it looks awkwardly narrow, that's a known gap (tablet polish is deferred).

---

## P. Loading + feedback

1. **Route progress bar**
   - Tap any link. A thin green bar streaks across the top of the screen and snaps off when the new page paints.

2. **Skeletons**
   - Navigate from a slow connection or with cache cleared. You should see a shimmering placeholder for ~½ second before the page paints.

3. **Button spinners**
   - Save in Add Transaction, Save split, Link & sync, Create goal, Sign in — all show a spinning icon while pending.

4. **Tap feedback**
   - Every button + link briefly dims and shrinks (~97%) on press.
   - 🐞 If a button doesn't visually respond, the global active-state CSS isn't applying.

5. **Sheet animations**
   - Add Transaction, Edit Transaction, Goal, Account Mapping — all slide up from the bottom with a fading backdrop.

6. **Haptic taps** (iOS PWA, otherwise no-op)
   - Add to Home Screen on iOS, open from there.
   - Add a transaction, fire a sync, undo a split → feel a soft tap.

---

## Q. Edge cases / "things to look for"

- Long merchant names: should truncate with ellipsis, not push amount off-row.
- Many transactions on the same day: all show under the same day header.
- Account with 0 balance: shows "$0.00" not blank.
- Transaction with `amount = 0`: blocked at input. Should never exist in DB.
- Reset → Load demo data → Reset again: shouldn't error. Idempotent.
- Sign in on another device: same session should resume.
- Open the app in two tabs at once, modify in one (e.g. add a transaction), refresh the other: changes appear.

---

## R. After testing — what to report back

For each section, note one of:
- **OK** — works as expected
- **Bug** — describe what happened vs what should have happened. Screenshot helpful.
- **UX** — works but feels wrong (e.g. confusing label, weird animation, layout off)

Prioritize 🐞-marked items. I'll triage and fix in order:
1. Anything that loses data or shows wrong numbers (auto-split balances, edit/delete reversals, sync results).
2. Auth flow blockers.
3. Visual issues / awkward UX.
4. Nice-to-haves.

Once we've burned through the bug list, we'll move on to the **pending-transfers checklist** (the natural next slice) and then the polish queue (toasts → dark mode → reconcile action → accessibility).
