import { describe, expect, it } from 'vitest'
import { isPaymentsDryRun } from '@/lib/portal/payments-write'
import { isDryRun } from '@/lib/payments/config'

// DEC-50 / 45-payments §6: PAYMENTS_DRY_RUN, else DRY_RUN, else 1. An empty PAYMENTS_DRY_RUN= is "unset", not "dry".
describe('payments dry-run switch (portal writes)', () => {
  it('an empty PAYMENTS_DRY_RUN falls back to DRY_RUN', () => {
    expect(isPaymentsDryRun({ PAYMENTS_DRY_RUN: '', DRY_RUN: '0' })).toBe(false)
    expect(isPaymentsDryRun({ PAYMENTS_DRY_RUN: '  ', DRY_RUN: '0' })).toBe(false)
    expect(isPaymentsDryRun({ PAYMENTS_DRY_RUN: '', DRY_RUN: '1' })).toBe(true)
    expect(isPaymentsDryRun({ PAYMENTS_DRY_RUN: '', DRY_RUN: '' })).toBe(true)
  })
  it('PAYMENTS_DRY_RUN wins when set; everything unset is dry', () => {
    expect(isPaymentsDryRun({ PAYMENTS_DRY_RUN: '1', DRY_RUN: '0' })).toBe(true)
    expect(isPaymentsDryRun({ PAYMENTS_DRY_RUN: '0', DRY_RUN: '1' })).toBe(false)
    expect(isPaymentsDryRun({})).toBe(true)
  })
  it('agrees with the gateways switch in src/lib/payments/config.ts', () => {
    for (const env of [{ PAYMENTS_DRY_RUN: '', DRY_RUN: '0' }, { PAYMENTS_DRY_RUN: '0' }, { DRY_RUN: '0' }, {}, { PAYMENTS_DRY_RUN: ' 1 ', DRY_RUN: '0' }]) {
      expect(isPaymentsDryRun(env)).toBe(isDryRun(env))
    }
  })
})
