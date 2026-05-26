import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for treebudget E2E.
 *
 * Tests run against a deployed URL (production by default), not a local
 * dev server. Set E2E_BASE_URL in env (or in GitHub Secrets for CI).
 *
 * Concurrency is forced to 1: all tests share a single dedicated test
 * account that gets reset between tests, so parallel runs would collide.
 */
const baseURL = process.env.E2E_BASE_URL;
if (!baseURL) {
  throw new Error(
    "E2E_BASE_URL is required (set to your production or preview URL).",
  );
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI
    ? [["html", { open: "never" }], ["github"]]
    : [["html", { open: "never" }], ["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
