import { test, expect } from "@playwright/test";
import { signIn, resetAccount, completeOnboarding } from "./helpers";

test.describe("Goals CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await resetAccount(page);
    await completeOnboarding(page, { income: 5000 });
  });

  test("creates, edits, and deletes a goal", async ({ page }) => {
    await page.goto("/goals");

    // Empty state visible.
    await expect(page.getByText(/No goals yet/i)).toBeVisible();

    // Create.
    await page.getByRole("button", { name: /Add a savings goal/i }).click();
    await page.getByLabel("Name").fill("Iceland trip");
    await page.getByLabel("Target ($)").fill("3500");
    await page.getByLabel("Saved so far ($)").fill("1200");
    await page.getByRole("button", { name: /Create goal/i }).click();

    await expect(page.getByText("Iceland trip")).toBeVisible({
      timeout: 10_000,
    });

    // Edit — tap the card.
    await page.getByText("Iceland trip").click();
    const targetField = page.getByLabel("Target ($)");
    await targetField.fill("");
    await targetField.fill("4000");
    await page.getByRole("button", { name: /Save changes/i }).click();

    // Reopen to confirm the value persisted.
    await page.getByText("Iceland trip").click();
    await expect(page.getByLabel("Target ($)")).toHaveValue("4000");

    // Delete.
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: /Delete goal/i }).click();
    await expect(page.getByText("Iceland trip")).not.toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/No goals yet/i)).toBeVisible();
  });

  test("rejects invalid input", async ({ page }) => {
    await page.goto("/goals");
    await page.getByRole("button", { name: /Add a savings goal/i }).click();
    // Missing name + target.
    await page.getByRole("button", { name: /Create goal/i }).click();
    await expect(page.getByText(/Name is required/i)).toBeVisible();

    await page.getByLabel("Name").fill("Bad goal");
    await page.getByRole("button", { name: /Create goal/i }).click();
    await expect(
      page.getByText(/Target must be a positive number/i),
    ).toBeVisible();
  });
});
