import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// The lint rule of 50-portal-data §8 check 8 as a test: no template-literal or concatenated SQL in src/lib/portal,
// `mysql2` is imported only by client.ts, and no `ihmedu_portal.` prefix anywhere in src.
const root = path.resolve(__dirname, '../..')
const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : /\.(ts|tsx)$/.test(e.name) ? [path.join(dir, e.name)] : []))

const SQL_WORD = /\b(SELECT|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b/i
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

/** Findings: backtick strings containing SQL, `+` concatenation next to SQL strings, `${}` inside SQL strings. */
export function rawSqlFindings(source: string): string[] {
  const code = stripComments(source)
  const out: string[] = []
  for (const m of code.matchAll(/`([^`]*)`/g)) if (SQL_WORD.test(m[1])) out.push(`template literal SQL: ${m[1].slice(0, 60)}`)
  for (const m of code.matchAll(/(["'])((?:(?!\1)[^\\\n]|\\.)*)\1\s*\+/g)) if (SQL_WORD.test(m[2]) && !/^\s*$/.test(m[2])) {
    // adjacent string constants joined with + are fine; a + with an identifier/call operand is not
    const after = code.slice((m.index ?? 0) + m[0].length).trimStart()
    if (!/^["']/.test(after)) out.push(`concatenated SQL: ${m[2].slice(0, 60)}`)
  }
  for (const m of code.matchAll(/\+\s*(?!["'])[A-Za-z_(]\w*[^;\n]*\)?\s*\+?\s*["'][^"']*\b(FROM|WHERE|AND)\b/gi)) out.push(`concatenated SQL: ${m[0].slice(0, 60)}`)
  return out
}

describe('portal SQL is parameterised constants only', () => {
  const files = walk(path.join(root, 'src/lib/portal'))

  it('src/lib/portal has no template-literal or concatenated SQL', () => {
    expect(files.length).toBeGreaterThan(4)
    for (const f of files) expect(rawSqlFindings(fs.readFileSync(f, 'utf8')), path.relative(root, f)).toEqual([])
  })

  it('the detector catches bad code (it is not vacuous)', () => {
    expect(rawSqlFindings('const q = `SELECT * FROM courses WHERE id = ${id}`')).toHaveLength(1)
    expect(rawSqlFindings('const q = "SELECT * FROM courses WHERE id = " + id')).toHaveLength(1)
    expect(rawSqlFindings('const q = "SELECT a " + "FROM b WHERE c = ?"')).toEqual([])
    expect(rawSqlFindings("const q = 'SELECT * FROM courses WHERE id = ?'")).toEqual([])
  })

  it('mysql2 is imported only by client.ts', () => {
    const importers = walk(path.join(root, 'src')).filter((f) => /from ['"]mysql2/.test(fs.readFileSync(f, 'utf8')))
    expect(importers.map((f) => path.relative(root, f))).toContain('src/lib/portal/client.ts')
    expect(importers.map((f) => path.relative(root, f)).filter((f) => !f.startsWith('src/lib/portal/') && !f.startsWith('src/lib/payments/'))).toEqual([])
    expect(files.filter((f) => /from ['"]mysql2/.test(fs.readFileSync(f, 'utf8')) && !f.endsWith('client.ts') && !f.endsWith('queries.ts')).map((f) => path.basename(f))).toEqual([])
  })

  it('no ihmedu_portal. or ihna_portal. prefix in src', () => {
    const hits = walk(path.join(root, 'src')).filter((f) => /(ihmedu|ihna)_portal\./.test(stripComments(fs.readFileSync(f, 'utf8'))))
    expect(hits.map((f) => path.relative(root, f))).toEqual([])
  })
})
