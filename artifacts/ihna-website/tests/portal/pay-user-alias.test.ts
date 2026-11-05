import { afterEach, describe, expect, it } from 'vitest'
import { payConfig } from '@/lib/portal/client'

// 50-portal-data §6: PORTAL_DB_PAY_USER / PORTAL_DB_PAY_PASSWORD, with the aliases PORTAL_DB_PAYMENTS_USER / _PASSWORD. An empty
// value falls back to the alias.
const NAMES = ['PORTAL_DB_PAY_USER', 'PORTAL_DB_PAYMENTS_USER', 'PORTAL_DB_PAY_PASSWORD', 'PORTAL_DB_PAYMENTS_PASSWORD'] as const
const saved = Object.fromEntries(NAMES.map((n) => [n, process.env[n]]))
afterEach(() => { for (const n of NAMES) { if (saved[n] === undefined) delete process.env[n]; else process.env[n] = saved[n] } })

describe('payConfig user alias', () => {
  it('an empty PORTAL_DB_PAY_USER falls back to PORTAL_DB_PAYMENTS_USER (and the password likewise)', () => {
    process.env.PORTAL_DB_PAY_USER = ''
    process.env.PORTAL_DB_PAYMENTS_USER = 'portal_pay'
    process.env.PORTAL_DB_PAY_PASSWORD = ''
    process.env.PORTAL_DB_PAYMENTS_PASSWORD = 'secret'
    expect(payConfig().user).toBe('portal_pay')
    expect(payConfig().password).toBe('secret')
  })
  it('PORTAL_DB_PAY_USER wins when set; nothing set gives an empty user', () => {
    process.env.PORTAL_DB_PAY_USER = 'pay_a'
    process.env.PORTAL_DB_PAYMENTS_USER = 'pay_b'
    expect(payConfig().user).toBe('pay_a')
    for (const n of NAMES) delete process.env[n]
    expect(payConfig().user).toBe('')
  })
})
