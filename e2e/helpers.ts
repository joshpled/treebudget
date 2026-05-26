import { type Page, expect } from "@playwright/test";

const REQUIRED_VARS = ["E2E_EMAIL", "E2E_PASSWORD"] as const;
for (const v of REQUIRED_VARS) {
  if (!process.env[v]) {
    throw new Error(`${v} is required (set as a GitHub secret).`);
  }
}

export const E2E_EMAIL = process.env.E2E_EMAIL as string;
export const E2E_PASSWORD = process.env.E2E_PASSWORD as string;

/**
 * Sign the dedicated test account in. Leaves the page wherever the auth
 * middleware sends us — usually /dashboard, but /onboarding if the account
 * was just reset.
 */
export async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(E2E_EMAIL);
  await page.getByLabel("Password").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: /^Sign in$/ }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
    timeout: 20_000,
  });
}

/**
 * Walk the 4-step onboarding wizard. Internal — assumes we're already on
 * /onboarding. Returns on /dashboard.
 */
async function walkOnboardingWizard(page: Page, income: number) {
  const incomeInput = page.locator('input[inputmode="decimal"]').first();
  await incomeInput.fill("");
  await incomeInput.fill(String(income));
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Looks good" }).click();
  await page.getByRole("button", { name: "Got it" }).click();
  await page.getByRole("button", { name: "Take me in" }).click();
  await page.waitForURL(/\/dashboard$/, { timeout: 20_000 });
}

/**
 * Make sure the test account is onboarded so authenticated pages like
 * /settings are reachable. If the user is still pre-onboarding, walk the
 * wizard with default values.
 */
export async function ensureOnboarded(page: Page) {
  await page.goto("/dashboard");
  if (/\/onboarding/.test(page.url())) {
    await walkOnboardingWizard(page, 5000);
  }
}

/**
 * Wipe the test account back to a fresh state. Walks the UI exactly like a
 * user would. If the account isn't onboarded yet, onboards it first so
 * /settings is reachable. Ends on /onboarding.
 */
export async function resetAccount(page: Page) {
  await ensureOnboarded(page);
  await page.goto("/settings");
  await page.getByRole("button", { name: "Reset account" }).click();
  // Inline confirmation appears with "Yes, wipe everything".
  await page
    .getByRole("button", { name: /Yes, wipe everything/i })
    .click();
  await page.waitForURL("**/onboarding", { timeout: 20_000 });
}

/**
 * Run the 4-step onboarding wizard end-to-end. Leaves the page on /dashboard.
 */
export async function completeOnboarding(
  page: Page,
  opts: { income?: number } = {},
) {
  const income = opts.income ?? 5000;
  await expect(page).toHaveURL(/\/onboarding$/);
  await walkOnboardingWizard(page, income);
}

/**
 * Trigger Load demo data from Settings → Account. Ends on /dashboard with
 * ~80 transactions and 3 goals seeded.
 */
export async function loadDemoData(page: Page) {
  await page.goto("/settings");
  await page.getByRole("button", { name: "Load demo data" }).click();
  // Inline confirmation appears with a second "Load demo data" button.
  await page
    .getByRole("button", { name: "Load demo data" })
    .last()
    .click();
  await page.waitForURL(/\/dashboard$/, { timeout: 30_000 });
}

/**
 * Quickly read a "Total balance" number off the dashboard hero. Returns
 * the numeric value (no $, no commas).
 */
export async function readTotalBalance(page: Page): Promise<number> {
  await page.goto("/dashboard");
  const text = await page
    .getByText("Total balance")
    .locator("xpath=following-sibling::*")
    .first()
    .innerText();
  return Number(text.replace(/[^0-9.-]/g, ""));
}

/**
 * Read an account card's balance by visible name (Bills / Spending /
 * Savings). Returns the numeric value.
 */
export async function readAccountBalance(
  page: Page,
  name: "Bills" | "Spending" | "Savings",
): Promise<number> {
  await page.goto("/dashboard");
  // Card root is a link to /transactions?account=...; the balance is the
  // big tabular number inside it.
  const card = page.getByRole("link", {
    name: new RegExp(`^${name}\\b`, "i"),
  });
  const text = await card.locator(".tabular").first().innerText();
  return Number(text.replace(/[^0-9.-]/g, ""));
}
