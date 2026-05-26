import { test, expect } from "@playwright/test";
import { signIn, E2E_EMAIL } from "./helpers";

test.describe("Auth", () => {
  test("gated route bounces an unauthenticated visitor to /sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in(\?next=.+)?$/);
  });

  test("the marketing landing is public", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Budget without the spreadsheet/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Pricing" }).first(),
    ).toBeVisible();
  });

  test("can sign in with email + password", async ({ page }) => {
    await signIn(page);
    // After sign-in we land on /dashboard (or /onboarding if the test
    // account was reset by a prior run). Either is OK; we just confirm
    // we left the sign-in page.
    expect(page.url()).not.toContain("/sign-in");
  });

  test("rejects a wrong password without leaving /sign-in", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(E2E_EMAIL);
    await page.getByLabel("Password").fill("this-is-not-the-password");
    await page.getByRole("button", { name: /^Sign in$/ }).click();
    await expect(page.getByText(/invalid|credentials|password/i)).toBeVisible({
      timeout: 10_000,
    });
    expect(page.url()).toContain("/sign-in");
  });

  test("sign out clears the session", async ({ page }) => {
    await signIn(page);
    await page.goto("/settings");
    await page.getByRole("button", { name: /Sign out/i }).click();
    await page.waitForURL(/\/sign-in/);
    // Hitting a gated route again should still redirect us.
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
