import { defineConfig, devices } from "@playwright/test";
import { env } from "node:process";

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  forbidOnly: Boolean(env.CI),
  retries: env.CI ? 1 : 0,
  workers: env.CI ? 2 : undefined,
  reporter: [
    ["list"],
    [
      "html",
      { open: "never" },
    ],
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "pnpm preview --host 127.0.0.1 --port 4173 --strictPort",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: false,
    },
    {
      command: "pnpm dev --host 127.0.0.1 --port 5174 --strictPort",
      url: "http://127.0.0.1:5174",
      env: { VITE_SHOW_DRAFTS: "true" },
      reuseExistingServer: false,
    },
  ],
  projects: [
    {
      name: "chromium",
      testIgnore: "writing.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-webkit",
      testIgnore: "writing.spec.ts",
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "writing",
      testMatch: "writing.spec.ts",
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:5174" },
    },
  ],
});
