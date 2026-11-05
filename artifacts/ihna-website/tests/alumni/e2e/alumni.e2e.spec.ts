import { expect, test } from '@playwright/test'
import type { Payload } from 'payload'
import { Cleanup, boot, makeAlumnus, nonce } from '../../collections/helpers'

// login -> dashboard -> edit profile -> logout, in a real browser against the dev server (plan §7, task 4).
let payload: Payload
const cleanup = new Cleanup()
let email: string
let password: string

test.beforeAll(async () => {
  payload = await boot()
  const a = await makeAlumnus(payload, cleanup, nonce(), true)
  email = a.doc.email
  password = a.password
})
test.afterAll(async () => {
  if (payload) await cleanup.run(payload)
})

test('logged-out dashboard sends you to the login page, then login -> dashboard -> edit -> logout', async ({ page }) => {
  await page.goto('/alumni/dashboard/')
  await expect(page).toHaveURL(/\/alumni\/login\/\?next=%2Falumni%2Fdashboard%2F/)

  // wrong password: inline error, still on the login page
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('definitely-wrong-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.locator('p[role=alert]')).toContainText('do not match')
  await expect(page).toHaveURL(/\/alumni\/login\//)

  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/alumni\/dashboard\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hello, Test')

  // the session cookie is HttpOnly: not visible to page scripts
  expect(await page.evaluate(() => document.cookie)).not.toContain('payload-token')

  // edit the profile
  await page.getByLabel('First name').fill('Renamed')
  await page.getByLabel('Graduation year').fill('2019')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.locator('p[role=status]')).toContainText('saved')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hello, Renamed')

  // logged in: the login page bounces to the dashboard
  await page.goto('/alumni/login/')
  await expect(page).toHaveURL(/\/alumni\/dashboard\/$/)

  // sign out (POST /alumni/logout/)
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/alumni\/login\/$/)
  await page.goto('/alumni/dashboard/')
  await expect(page).toHaveURL(/\/alumni\/login\//)
})

test('a staff login does not open the alumni dashboard', async ({ page, request }) => {
  const tag = nonce()
  const staff = await payload.create({ collection: 'users', data: { email: `t-${tag}-staff@example.test`, password: `Pw-${tag}-staff-0123456789`, roles: ['viewer'] }, overrideAccess: true })
  cleanup.track('users', staff.id)
  await page.goto('/alumni/login/')
  await page.getByLabel('Email').fill(staff.email)
  await page.getByLabel('Password').fill(`Pw-${tag}-staff-0123456789`)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.locator('p[role=alert]')).toContainText('do not match')
  void request
})

test('forgot password page, register page and logout GET', async ({ page, request }) => {
  await page.goto('/alumni/forgot-password/')
  await page.getByLabel('Email').fill(`nobody-${nonce()}@example.test`)
  await page.getByRole('button', { name: 'Email me a reset link' }).click()
  await expect(page.locator('p[role=status]')).toContainText('If an alumni account exists')

  await page.goto('/alumni/register/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Request alumni access')

  expect((await request.get('/alumni/logout/')).status()).toBe(405)
  const hub = await request.get('/alumni/')
  expect(hub.status()).toBe(200) // the CMS hub page still resolves through the catch-all
})
