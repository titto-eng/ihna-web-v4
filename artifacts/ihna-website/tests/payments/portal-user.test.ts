import mysql, { type Connection } from 'mysql2/promise'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { insertPendingPayment, markPortalPaid, readPortalPayment } from '@/lib/portal/payments-write'
import { closePortal, usePaymentsEnv } from './helpers'

// 45 §8 check 8 / 50 §8 check 9: the payments user cannot DELETE, cannot write other tables, cannot touch columns outside its grant;
// the read user cannot write `payments`. Uses the Docker fixture users (throwaway credentials from docker/portal-fixtures/load.sh).
let pay: Connection
let ro: Connection

beforeAll(async () => {
  usePaymentsEnv()
  const base = { host: '127.0.0.1', port: 3308, database: 'ihna_portal' } // ihna-web's portal-mysql
  pay = await mysql.createConnection({ ...base, user: 'portal_pay', password: 'portal_pay' })
  ro = await mysql.createConnection({ ...base, user: 'portal_ro', password: 'portal_ro' })
})
afterAll(async () => { await pay?.end(); await ro?.end(); await closePortal() })

const denied = async (c: Connection, sql: string) => {
  try { await c.query(sql); return null } catch (e) { return (e as { code?: string }).code ?? 'error' }
}

describe('the write-limited payments user', () => {
  it('DELETE is denied', async () => expect(await denied(pay, 'DELETE FROM payments WHERE id = 0')).toBe('ER_TABLEACCESS_DENIED_ERROR'))
  it('TRUNCATE and DROP are denied', async () => {
    expect(await denied(pay, 'TRUNCATE TABLE payments')).toMatch(/DENIED/)
    expect(await denied(pay, 'DROP TABLE payments')).toMatch(/DENIED/)
  })
  it('writes to other tables are denied, and so are reads of them', async () => {
    expect(await denied(pay, "UPDATE courses SET course_name = 'x' WHERE id = 0")).toMatch(/DENIED/)
    expect(await denied(pay, "INSERT INTO campuses (id, campus_name) VALUES (999, 'x')")).toMatch(/DENIED/)
    expect(await denied(pay, 'SELECT * FROM courses LIMIT 1')).toMatch(/DENIED/)
  })
  it('UPDATE is limited to the status columns: amount, email and invoice_number cannot be changed', async () => {
    expect(await denied(pay, 'UPDATE payments SET amount = 1 WHERE id = 0')).toMatch(/DENIED/)
    expect(await denied(pay, "UPDATE payments SET email = 'x' WHERE id = 0")).toMatch(/DENIED/)
    expect(await denied(pay, "UPDATE payments SET invoice_number = 'x' WHERE id = 0")).toMatch(/DENIED/)
    expect(await denied(pay, 'UPDATE payments SET status = 1 WHERE id = 0')).toBeNull()
  })
  it('INSERT and SELECT on payments work through payments-write.ts', async () => {
    const id = await insertPendingPayment({ studentName: 'Grant Check', invoiceNumber: 'GRANT-1', email: 'grant@example.test', paymentFor: 'test', e2payment: false, amountCents: 1234, gateway: 'payway' })
    expect(await readPortalPayment(id)).toMatchObject({ status: 0, invoice_number: 'GRANT-1' })
    expect(await markPortalPaid(id, 1234, { gateway: 'payway', responseCode: '08' })).toBe(true)
    expect(await markPortalPaid(id, 1234)).toBe(false) // already paid: WHERE status = 0
    expect(Number((await readPortalPayment(id))?.paid_amount)).toBe(12.34)
  })
})

describe('the read-only user', () => {
  it('cannot INSERT, UPDATE or DELETE payments', async () => {
    expect(await denied(ro, "INSERT INTO payments (student_name) VALUES ('x')")).toMatch(/DENIED/)
    expect(await denied(ro, 'UPDATE payments SET status = 1 WHERE id = 0')).toMatch(/DENIED/)
    expect(await denied(ro, 'DELETE FROM payments WHERE id = 0')).toMatch(/DENIED/)
  })
})
