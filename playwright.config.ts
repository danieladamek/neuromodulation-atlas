import { defineConfig, devices } from '@playwright/test';

/**
 * Two servers: the real build, and a second build from a fixture pack that adds a volume. The volume-rebuild test
 * writes a note against the first and replays the same browser storage against the second.
 *
 * The ports default to 4173/4174 and can be moved with PREVIEW_PORT / FIXTURE_PORT — `reuseExistingServer` will
 * otherwise happily test whatever else is already listening there (another app's preview, say).
 */
export const PREVIEW_PORT = Number(process.env.PREVIEW_PORT ?? 4173);
export const FIXTURE_PORT = Number(process.env.FIXTURE_PORT ?? 4174);

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PREVIEW_PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: `npm run preview -- --port ${PREVIEW_PORT} --strictPort`,
      url: `http://localhost:${PREVIEW_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `npm run build:fixture-volume && npx vite preview --outDir dist-volume-fixture --port ${FIXTURE_PORT} --strictPort`,
      url: `http://localhost:${FIXTURE_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 600_000,
    },
  ],
});
