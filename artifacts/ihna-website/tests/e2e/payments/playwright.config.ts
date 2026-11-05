import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

// Payments e2e (45 §8). Runs against the dev server already up (PLAYWRIGHT_BASE_URL, else NEXT_PUBLIC_SITE_URL, default http://localhost:3001,
// the app's preview): this config never starts or stops it. The gateway test secrets (tests/payments/helpers.ts usePaymentsEnv) live in the
// test process only; the dev server's .env needs none of them.
// Gateways are the in-memory FakeGateway (PAYMENTS_GATEWAY_MODE=fake), the portal is the Docker fixture, DRY_RUN=1, email lands in Mailpit.
// The dev server must have been (re)started after the payment routes were added: Next only registers new `(site)` pages at start.
// Run: npm run test:e2e:payments
process.env.ENQUIRY_AUTORUN = '0' // this test process must not run the job queue; the dev server does
process.env.DISABLE_DB_PUSH = '1' // the dev server owns the schema; a second Payload instance must not push (it waits on a prompt)

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.pay\.e2e\.spec\.ts/,
  timeout: 180_000,
  globalTimeout: 20 * 60_000, // never hang
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001', trace: 'retain-on-failure', actionTimeout: 30_000, navigationTimeout: 120_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
