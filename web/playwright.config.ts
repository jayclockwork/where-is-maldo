import { defineConfig, devices } from "@playwright/test";

// Use a dedicated port for E2E so we don't accidentally attach to a user-running dev server.
const port = Number(process.env.PORT ?? 3100);

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  webServer: {
    // Use production mode for E2E to ensure a single, consistent in-memory repo instance.
    // (Next dev can fan out work and cause separate module instances in some setups.)
    command: `npm run build && npx next start -p ${port}`,
    url: `http://localhost:${port}`,
    // Always start our own server for determinism.
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

