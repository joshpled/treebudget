import { test, expect } from "@playwright/test";
import { signIn, resetAccount, completeOnboarding } from "./helpers";

test.describe("Setup guide checklist", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await resetAccount(page);
    await completeOnboarding(page, { income: 5000 });
  });

  test("toggling a step persists across reload", async ({ page }) => {
    await page.goto("/setup");

    // Tick the first step's checkbox (aria-label flips between "Mark
    // complete" and "Mark incomplete").
    const firstCheckbox = page
      .getByRole("button", { name: /Mark complete/i })
      .first();
    await firstCheckbox.click();

    // Progress should now reflect 1/5 in the eyebrow.
    await expect(page.getByText(/Progress · 1\/5/i)).toBeVisible({
      timeout: 10_000,
    });

    // Reload the page.
    await page.reload();
    await expect(page.getByText(/Progress · 1\/5/i)).toBeVisible();

    // Untoggle and reload — back to 0/5.
    await page.getByRole("button", { name: /Mark incomplete/i }).first().click();
    await expect(page.getByText(/Progress · 0\/5/i)).toBeVisible();
    await page.reload();
    await expect(page.getByText(/Progress · 0\/5/i)).toBeVisible();
  });

  test("Home setup card reflects progress and dismissal persists", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("link", { name: /Make it real at your bank/i }),
    ).toBeVisible();

    // Dismiss.
    await page.getByRole("button", { name: /^Dismiss$/i }).click();
    await expect(
      page.getByRole("link", { name: /Make it real at your bank/i }),
    ).not.toBeVisible({ timeout: 10_000 });

    // Reload — still hidden.
    await page.reload();
    await expect(
      page.getByRole("link", { name: /Make it real at your bank/i }),
    ).not.toBeVisible();
  });
});
