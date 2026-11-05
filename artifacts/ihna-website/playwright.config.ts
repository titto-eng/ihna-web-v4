import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

// Smoke e2e (tests/e2e). Base URL: PLAYWRIGHT_BASE_URL, else NEXT_PUBLIC_SITE_URL, else http://localhost:3001 (ihna-web's dev port;
// ihm-web owns :3000). A dev server already up there is reused; otherwise this config starts one with `npm run dev -- -p 3001`.
// Run: npm run test:e2e
process.env.DISABLE_DB_PUSH = '1' // the dev server owns the schema; the admin spec's seeding Payload instance must not push (DEC-46)

const baseURL = (process.env.PLAYWRIGHT_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001').replace(/\/+$/, '')

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: '**/payments/**', // payments e2e has its own config: npm run test:e2e:payments
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: { baseURL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chromium' } }],
  webServer: {
    command: 'npm run dev -- -p 3001',
    reuseExistingServer: true,
    url: baseURL,
    timeout: 180_000,
  },
})
