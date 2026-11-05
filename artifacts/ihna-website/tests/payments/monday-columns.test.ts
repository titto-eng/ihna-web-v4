import { describe, expect, it } from 'vitest'
import { mondayColumnValues } from '@/lib/payments/after'

// 45 §6 step 4: the E2 item's column_values come from the payment row, under board column ids set in env.
const row = { payerName: 'Ana Lee', payerEmail: 'ana@example.test', studentId: 'S123' }

describe('monday.com E2 column values', () => {
  it('maps the payment row to the configured column ids', () => {
    const env = { MONDAY_E2_NAME_COLUMN: 'text', MONDAY_E2_EMAIL_COLUMN: 'email', MONDAY_E2_STUDENT_ID_COLUMN: 'text7', MONDAY_E2_STATUS_COLUMN: 'status_1', MONDAY_E2_STATUS_LABEL: 'IHM' }
    expect(mondayColumnValues(row, env)).toEqual({ text: 'Ana Lee', email: { email: 'ana@example.test', text: 'ana@example.test' }, text7: 'S123', status_1: { label: 'IHM' } })
  })

  it('leaves out columns whose id (or value) is not set', () => {
    expect(mondayColumnValues(row, {})).toEqual({})
    expect(mondayColumnValues({ ...row, studentId: null }, { MONDAY_E2_STUDENT_ID_COLUMN: 'text7', MONDAY_E2_STATUS_COLUMN: 'status_1' })).toEqual({})
  })
})
