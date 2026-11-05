import fs from 'node:fs'
import path from 'node:path'
import mysql from 'mysql2/promise'
import { describe, expect, it } from 'vitest'
import { PORTAL_PAYMENT_IP_COLUMN } from '@/lib/portal/payments-write'

// The portal `payments` IP column (45-payments §2): both legacy themes use `ip_address`; the insert names exactly that column.
const src = fs.readFileSync(path.resolve(__dirname, '../../src/lib/portal/payments-write.ts'), 'utf8')

describe('portal payments IP column', () => {
  it('is ip_address, and the pending insert writes it (never ip_addr)', () => {
    expect(PORTAL_PAYMENT_IP_COLUMN).toBe('ip_address')
    const insert = /INSERT INTO payments \(([^)]*)\)/.exec(src.replace(/' \+\s*'/g, ''))?.[1] ?? ''
    expect(insert.split(',').map((c) => c.trim())).toContain(PORTAL_PAYMENT_IP_COLUMN)
    expect(insert).not.toMatch(/\bip_addr\b/)
  })
  it('the fixture table has the column (docker/portal-fixtures/payments.schema.sql)', async () => {
    const c = await mysql.createConnection({ host: '127.0.0.1', port: 3308, user: 'portal_ro', password: 'portal_ro', database: 'ihna_portal' })
    try {
      const [rows] = await c.query('SHOW COLUMNS FROM payments LIKE ?', [PORTAL_PAYMENT_IP_COLUMN])
      expect(rows).toHaveLength(1)
    } finally {
      await c.end()
    }
  })
})
