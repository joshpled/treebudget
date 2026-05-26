import { test, expect } from "@playwright/test";
import {
  signIn,
  resetAccount,
  completeOnboarding,
  readAccountBalance,
} from "./helpers";

test.describe("Transactions — add, edit, delete", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await resetAccount(page);
    await completeOnboarding(page, { income: 5000 });
  });

  test("adds a spend transaction and decreases the source account balance", async ({
    page,
  }) => {
    const before = await readAccountBalance(page, "Spending");

    // Open the Add Transaction sheet via the + button.
    await page.getByLabel("Add transaction").click();
    await page.getByRole("button", { name: /^Spend$/ }).click();
    await page
      .locator('input[inputmode="decimal"]')
      .first()
      .fill("12.50");
    await page.getByLabel("Merchant").fill("Test Coffee");
    await page.getByLabel("Account").selectOption({ label: "Spending" });
    await page.getByRole("button", { name: /^Save$/ }).click();

    // Verify the new row landed.
    await page.goto("/transactions");
    await expect(page.getByText("Test Coffee").first()).toBeVisible();

    const after = await readAccountBalance(page, "Spending");
    expect(Math.round((before - after) * 100) / 100).toBe(12.5);
  });

  test("adds an income transaction and increases the source account balance", async ({
    page,
  }) => {
    const before = await readAccountBalance(page, "Bills");

    await page.getByLabel("Add transaction").click();
    await page.getByRole("button", { name: /^Income$/ }).click();
    await page.locator('input[inputmode="decimal"]').first().fill("250");
    await page.getByLabel("Merchant").fill("Side Gig");
    await page.getByLabel("Account").selectOption({ label: "Bills" });
    await page.getByRole("button", { name: /^Save$/ }).click();

    const after = await readAccountBalance(page, "Bills");
    expect(Math.round((after - before) * 100) / 100).toBe(250);
  });

  test("edits a transaction and balance adjusts to the new amount", async ({
    page,
  }) => {
    // Create one to edit.
    await page.getByLabel("Add transaction").click();
    await page.locator('input[inputmode="decimal"]').first().fill("20");
    await page.getByLabel("Merchant").fill("Edit Me");
    await page.getByLabel("Account").selectOption({ label: "Spending" });
    await page.getByRole("button", { name: /^Save$/ }).click();

    const afterAdd = await readAccountBalance(page, "Spending");

    // Open its detail page.
    await page.goto("/transactions");
    await page.getByText("Edit Me").first().click();
    await expect(page).toHaveURL(/\/transactions\/[a-f0-9-]+$/);

    // Open the edit sheet and change the amount to $5.
    await page.getByLabel("Edit transaction").click();
    const amountField = page.locator('input[inputmode="decimal"]').first();
    await amountField.fill("");
    await amountField.fill("5");
    await page.getByRole("button", { name: /Save changes/i }).click();

    const afterEdit = await readAccountBalance(page, "Spending");
    // We went from -$20 to -$5 → spending balance went up by $15.
    expect(Math.round((afterEdit - afterAdd) * 100) / 100).toBe(15);
  });

  test("deletes a transaction and reverses its balance impact", async ({
    page,
  }) => {
    const before = await readAccountBalance(page, "Spending");

    await page.getByLabel("Add transaction").click();
    await page.locator('input[inputmode="decimal"]').first().fill("33.33");
    await page.getByLabel("Merchant").fill("Delete Me");
    await page.getByLabel("Account").selectOption({ label: "Spending" });
    await page.getByRole("button", { name: /^Save$/ }).click();

    await page.goto("/transactions");
    await page.getByText("Delete Me").first().click();
    await page.getByLabel("Edit transaction").click();
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: /Delete transaction/i }).click();
    await page.waitForURL(/\/transactions$/);

    const after = await readAccountBalance(page, "Spending");
    expect(Math.abs(after - before)).toBeLessThan(0.01);
  });
});
