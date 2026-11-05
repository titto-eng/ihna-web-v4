import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// Lint-style checks for payments-write.ts (45 §2, rule 6): no raw string SQL, and it is the ONLY place that writes the portal `payments` table.
const root = path.resolve(__dirname, '../..')
const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : /\.(ts|tsx)$/.test(e.name) ? [path.join(dir, e.name)] : []))
const read = (f: string) => fs.readFileSync(f, 'utf8')
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

const SQL_WORD = /\b(SELECT|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b/i

/** Template-literal SQL, `${}` inside SQL, and a `+` joining SQL to anything but another string literal. */
export function rawSqlFindings(source: string): string[] {
  const code = stripComments(source)
  const out: string[] = []
  for (const m of code.matchAll(/`([^`]*)`/g)) if (SQL_WORD.test(m[1])) out.push(`template literal SQL: ${m[1].slice(0, 60)}`)
  for (const m of code.matchAll(/(["'])((?:(?!\1)[^\\\n]|\\.)*)\1\s*\+\s*([^\s"'])/g)) if (SQL_WORD.test(m[2]) || /\b(FROM|WHERE|SET|VALUES)\b/i.test(m[2])) out.push(`concatenated SQL: ${m[2].slice(0, 60)}`)
  for (const m of code.matchAll(/\+\s*[A-Za-z_(][\w.()]*\s*\+?\s*["'][^"']*\b(FROM|WHERE|AND|SET)\b/gi)) out.push(`concatenated SQL: ${m[0].slice(0, 60)}`)
  for (const m of code.matchAll(/(["'])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) if (/(INSERT INTO|UPDATE \w+ SET|SELECT [\w*, ]+ FROM)/i.test(m[2]) && /\$\{/.test(m[2])) out.push(`interpolated SQL: ${m[2].slice(0, 60)}`)
  return out
}

describe('payments-write.ts', () => {
  const file = path.join(root, 'src/lib/portal/payments-write.ts')

  it('has no raw string SQL: every statement is a constant with ? placeholders', () => {
    expect(rawSqlFindings(read(file))).toEqual([])
    const code = stripComments(read(file))
    expect((code.match(/\?/g) ?? []).length).toBeGreaterThan(20)
  })

  it('the detector catches bad code (it is not vacuous)', () => {
    expect(rawSqlFindings('const q = `UPDATE payments SET status = 1 WHERE id = ${id}`')).toHaveLength(1)
    expect(rawSqlFindings('const q = "UPDATE payments SET status = 1 WHERE id = " + id')).toHaveLength(1)
    expect(rawSqlFindings('const q = "SELECT a FROM b WHERE c = " + req.query.c + " AND d = 1"').length).toBeGreaterThan(0)
    expect(rawSqlFindings("const q = 'SELECT id FROM payments WHERE id = ?'")).toEqual([])
    expect(rawSqlFindings("const q = 'UPDATE payments SET a = ?, ' + 'b = ? WHERE id = ?'")).toEqual([])
  })

  it('uses only the write-limited payments pool (runPayWrite/runPayRead), never the read pool and never mysql2 directly', () => {
    const code = read(file)
    expect(code).toMatch(/runPayWrite/)
    expect(code).not.toMatch(/runQuery/)
    expect(code).not.toMatch(/from ['"]mysql2/)
  })

  it('is the only module that writes the portal payments table; nothing else issues INSERT/UPDATE/DELETE against it', () => {
    const offenders = walk(path.join(root, 'src'))
      .filter((f) => !f.endsWith('payments-write.ts'))
      .filter((f) => /\b(INSERT INTO payments|UPDATE payments SET|DELETE FROM payments)\b/.test(stripComments(read(f))) && /portal|mysql/i.test(read(f)) && !/enum_payments_status/.test(read(f)))
      .map((f) => path.relative(root, f))
    expect(offenders).toEqual([])
  })

  it('runPayWrite and runPayRead are imported by payments-write.ts only', () => {
    const users = walk(path.join(root, 'src')).filter((f) => /\b(runPayWrite|runPayRead)\b/.test(read(f))).map((f) => path.relative(root, f)).sort()
    expect(users).toEqual(['src/lib/portal/client.ts', 'src/lib/portal/payments-write.ts'])
  })

  it('src/lib/payments does not import mysql2 or the read pool, and the PAY credentials are read in client.ts only', () => {
    for (const f of walk(path.join(root, 'src/lib/payments'))) {
      const code = stripComments(read(f))
      expect(code, f).not.toMatch(/from ['"]mysql2/)
      expect(code, f).not.toMatch(/PORTAL_DB_PAY_/)
    }
  })
})

describe('no credential or merchant id is copied from the old theme', () => {
  it('src/lib/payments, src/jobs and the payment pages hold no hard-coded secrets or old-theme ids', () => {
    const files = [...walk(path.join(root, 'src/lib/payments')), ...walk(path.join(root, 'src/jobs')), ...walk(path.join(root, 'src/components/payments')), ...walk(path.join(root, 'src/app/api/payments'))]
    for (const f of files) {
      const code = stripComments(read(f))
      expect(code, f).not.toMatch(/\b(411447|01139211|400118|6970031|5AR0055)\b/) // biller, merchant and SecurePay merchant codes of the old theme
      expect(code, f).not.toMatch(/(?:Basic|Bearer)\s+[A-Za-z0-9+/=_-]{24,}/)
      expect(code, f).not.toMatch(/['"](?!\/)(?=[A-Za-z+/_-]*\d)[A-Za-z0-9+/_-]{40,}={0,2}['"]/) // a quoted literal that looks like a key
    }
  })
})
