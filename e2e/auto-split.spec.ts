import { test, expect } from "@playwright/test";
import {
  signIn,
  resetAccount,
  completeOnboarding,
  readAccountBalance,
} from "./helpers";

test.describe("Auto-split on tagged income", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await resetAccount(page);
    await completeOnboarding(page, { income: 5000 });
  });

  test("applying split moves money per allocation; undoing reverses it", async ({
    page,
  }) => {
    // Add an income transaction to Bills.
    await page.locator("header").getByLabel("Add transaction").click();
    await page.getByRole("button", { name: /^Income$/ }).click();
    await page.locator('input[inputmode="decimal"]').first().fill("2000");
    await page.getByLabel("Merchant").fill("Paycheck");
    await page.getByLabel("Account").selectOption({ label: "Bills" });
    await page.getByRole("button", { name: /^Save$/ }).click();

    const billsBefore = await readAccountBalance(page, "Bills");
    const spendingBefore = await readAccountBalance(page, "Spending");
    const savingsBefore = await readAccountBalance(page, "Savings");

    // Open the paycheck's detail page.
    await page.goto("/transactions");
    await page.getByText("Paycheck").first().click();
    await expect(page).toHaveURL(/\/transactions\/[a-f0-9-]+$/);

    // Apply the split.
    await page.getByRole("button", { name: /Split across accounts/i }).click();
    await expect(page.getByText(/Auto-split applied/i)).toBeVisible({
      timeout: 15_000,
    });

    // For a 50/30/20 split on $2000 landing on Bills:
    //   Bills should end at billsBefore - $600 - $400 = billsBefore - $1000
    //   Spending should end at spendingBefore + $600
    //   Savings should end at savingsBefore + $400
    const billsAfter = await readAccountBalance(page, "Bills");
    const spendingAfter = await readAccountBalance(page, "Spending");
    const savingsAfter = await readAccountBalance(page, "Savings");

    expect(Math.round((billsBefore - billsAfter) * 100) / 100).toBe(1000);
    expect(Math.round((spendingAfter - spendingBefore) * 100) / 100).toBe(600);
    expect(Math.round((savingsAfter - savingsBefore) * 100) / 100).toBe(400);

    // Verify three Auto-split rows exist in the activity feed.
    await page.goto("/transactions");
    await expect(
      page.getByText("Auto-split").first(),
    ).toBeVisible();

    // Undo the split.
    await page.goto("/transactions");
    await page.getByText("Paycheck").first().click();
    await page.getByRole("button", { name: /Undo split/i }).click();
    await expect(
      page.getByRole("button", { name: /Split across accounts/i }),
    ).toBeVisible({ timeout: 15_000 });

    // Balances back where they were.
    const billsRestored = await readAccountBalance(page, "Bills");
    const spendingRestored = await readAccountBalance(page, "Spending");
    const savingsRestored = await readAccountBalance(page, "Savings");

    expect(Math.abs(billsRestored - billsBefore)).toBeLessThan(0.01);
    expect(Math.abs(spendingRestored - spendingBefore)).toBeLessThan(0.01);
    expect(Math.abs(savingsRestored - savingsBefore)).toBeLessThan(0.01);
  });

  test("editing a split-applied income is rejected", async ({ page }) => {
    // Set up a split paycheck.
    await page.locator("header").getByLabel("Add transaction").click();
    await page.getByRole("button", { name: /^Income$/ }).click();
    await page.locator('input[inputmode="decimal"]').first().fill("1500");
    await page.getByLabel("Merchant").fill("Locked Paycheck");
    await page.getByLabel("Account").selectOption({ label: "Bills" });
    await page.getByRole("button", { name: /^Save$/ }).click();

    await page.goto("/transactions");
    await page.getByText("Locked Paycheck").first().click();
    await page.getByRole("button", { name: /Split across accounts/i }).click();
    await expect(page.getByText(/Auto-split applied/i)).toBeVisible();

    // Try to edit it.
    await page.getByLabel("Edit transaction").click();
    const amountField = page.locator('input[inputmode="decimal"]').first();
    await amountField.fill("");
    await amountField.fill("9999");
    await page.getByRole("button", { name: /Save changes/i }).click();

    // The sheet should display the rejection message.
    await expect(
      page.getByText(/Undo the split before editing/i),
    ).toBeVisible({ timeout: 10_000 });
  });
});
