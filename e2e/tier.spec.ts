import { test, expect } from "@playwright/test";
import {
  signIn,
  resetAccount,
  completeOnboarding,
  loadDemoData,
  setTier,
} from "./helpers";

test.describe("Free tier restrictions", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await resetAccount(page);
    await completeOnboarding(page, { income: 5000 });
    await setTier(page, "free");
  });

  test("bank sync is blocked — upgrade prompt shown instead of connect button", async ({
    page,
  }) => {
    await page.goto("/settings/accounts");
    await expect(
      page.getByText(/Bank sync is a paid feature/i),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /See plans/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Connect a bank/i }),
    ).not.toBeVisible();
  });

  test("goals are blocked — upgrade prompt shown instead of add button", async ({
    page,
  }) => {
    await page.goto("/goals");
    await expect(
      page.getByText(/Goals are a paid feature/i),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /See plans/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Add a savings goal/i }),
    ).not.toBeVisible();
  });

  test("income split button is not shown on income transactions", async ({
    page,
  }) => {
    // Add an income transaction.
    await page.locator("header").getByLabel("Add transaction").click();
    await page.getByRole("button", { name: /^Income$/ }).click();
    await page.locator('input[inputmode="decimal"]').first().fill("2000");
    await page.getByLabel("Merchant").fill("Paycheck");
    await page.getByLabel("Account").selectOption({ label: "Bills" });
    await page.getByRole("button", { name: /^Save$/ }).click();

    await page.goto("/transactions");
    await page.getByText("Paycheck").first().click();

    await expect(
      page.getByRole("button", { name: /Split across accounts/i }),
    ).not.toBeVisible();
  });

  test("transaction limit — error shown when adding transaction beyond limit", async ({
    page,
  }) => {
    // loadDemoData seeds ~80 transactions, bypassing the action-level gate.
    await loadDemoData(page);
    await setTier(page, "free");

    await page.goto("/transactions");

    // Limit banner visible because count > 50.
    await expect(
      page.getByText(/Transaction limit reached/i),
    ).toBeVisible();

    // Trying to add a new transaction should show the limit error.
    await page.locator("header").getByLabel("Add transaction").click();
    await page.locator('input[inputmode="decimal"]').first().fill("10");
    await page.getByLabel("Merchant").fill("Blocked transaction");
    await page.getByRole("button", { name: /^Save$/ }).click();
    await expect(
      page.getByText(/Free accounts are limited to 50 transactions/i),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Paid tier — all features accessible", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await resetAccount(page);
    await completeOnboarding(page, { income: 5000 });
    await setTier(page, "paid");
  });

  test("bank sync connect button is visible", async ({ page }) => {
    await page.goto("/settings/accounts");
    await expect(
      page.getByRole("button", { name: /Connect a bank/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/Bank sync is a paid feature/i),
    ).not.toBeVisible();
  });

  test("goals add button is visible", async ({ page }) => {
    await page.goto("/goals");
    await expect(
      page.getByRole("button", { name: /Add a savings goal/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/Goals are a paid feature/i),
    ).not.toBeVisible();
  });

  test("income split button is shown on income transactions", async ({
    page,
  }) => {
    await page.locator("header").getByLabel("Add transaction").click();
    await page.getByRole("button", { name: /^Income$/ }).click();
    await page.locator('input[inputmode="decimal"]').first().fill("2000");
    await page.getByLabel("Merchant").fill("Paycheck");
    await page.getByLabel("Account").selectOption({ label: "Bills" });
    await page.getByRole("button", { name: /^Save$/ }).click();

    await page.goto("/transactions");
    await page.getByText("Paycheck").first().click();

    await expect(
      page.getByRole("button", { name: /Split across accounts/i }),
    ).toBeVisible();
  });
});
