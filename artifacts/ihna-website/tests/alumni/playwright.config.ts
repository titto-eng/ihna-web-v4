import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

// Alumni e2e. Runs against the dev server already up (PLAYWRIGHT_BASE_URL, else NEXT_PUBLIC_SITE_URL, default http://localhost:3001,
// the app's preview; start it with `npm run dev -- -p 3001`): this config never starts or stops it.
// Run: npm run test:e2e:alumni
// NODE_ENV=test keeps the test process's Payload instance out of schema push mode (it would wait on a prompt); the dev server owns the schema.
;(process.env as Record<string, string | undefined>).NODE_ENV = 'test'
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
