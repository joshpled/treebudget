import { test, expect } from "@playwright/test";
import { signIn, resetAccount, completeOnboarding } from "./helpers";

test.describe("Onboarding", () => {
  test("walks the 4-step wizard end-to-end", async ({ page }) => {
    await signIn(page);
    await resetAccount(page);
    await completeOnboarding(page, { income: 5000 });
    await expect(page).toHaveURL(/\/dashboard$/);
    // Account cards should all be present at $0 with the default split.
    await expect(
      page.getByRole("link", { name: /Bills/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Spending/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Savings/i }).first(),
    ).toBeVisible();
  });

  test("income input can be cleared and retyped without a stuck zero", async ({
    page,
  }) => {
    await signIn(page);
    await resetAccount(page);
    const incomeInput = page.locator('input[inputmode="decimal"]').first();
    await incomeInput.fill("4000");
    await expect(incomeInput).toHaveValue("4000");
    await incomeInput.fill("");
    await expect(incomeInput).toHaveValue("");
    await incomeInput.fill("4500");
    await expect(incomeInput).toHaveValue("4500");
  });

  test("already-onboarded users are bounced away from /onboarding", async ({
    page,
  }) => {
    await signIn(page);
    await resetAccount(page);
    await completeOnboarding(page, { income: 5000 });
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
