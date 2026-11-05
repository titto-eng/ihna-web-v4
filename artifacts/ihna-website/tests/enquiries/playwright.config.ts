import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

// Enquiry e2e (40 §8). Runs against the dev server already up (PLAYWRIGHT_BASE_URL, else NEXT_PUBLIC_SITE_URL, default
// http://localhost:3001, the app's preview): this config never starts or stops it. Everything is localhost: DRY_RUN=1 means no adapter
// calls a real CRM; email lands in Mailpit. The test process shares the dev Postgres to read the stored rows.
// Run: npm run test:e2e:enquiries
process.env.ENQUIRY_AUTORUN = '0' // this test process must not run the queue; the dev server does
process.env.DISABLE_DB_PUSH = '1' // the dev server owns the schema; a second Payload instance must not push (it waits on a prompt)

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'

export default defineConfig({
  testDir: './e2e',
  timeout: 180_000,
  globalTimeout: 30 * 60_000, // never hang: the whole run stops after 30 minutes
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL, trace: 'retain-on-failure', actionTimeout: 30_000, navigationTimeout: 120_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
