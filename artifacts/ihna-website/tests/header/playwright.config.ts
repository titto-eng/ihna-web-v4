import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

// Header layout e2e (05 §8). Runs against a dev server that is already up; this config never starts or stops one.
// Run: npm run test:e2e:header. Base URL: HEADER_BASE_URL, else PLAYWRIGHT_BASE_URL, else NEXT_PUBLIC_SITE_URL, else http://localhost:3001
// (start the server with `npm run dev -- -p 3001`).
const baseURL = process.env.HEADER_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'

export default defineConfig({
  testDir: '.',
  testMatch: '*.e2e.spec.ts',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL, contextOptions: { reducedMotion: 'reduce' }, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
