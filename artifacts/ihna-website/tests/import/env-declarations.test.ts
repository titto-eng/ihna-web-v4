import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// DEC-24: src/env.ts is the master list of env names and .env.example mirrors it. Every `process.env.X` (or `process.env['X']`)
// read in src/ or scripts/ must be a key of the env.ts schema and appear in .env.example (as `X=` or, for a platform-set name, in a comment).
const ROOT = resolve(__dirname, '../..')
const SKIP = new Set(['node_modules', 'out', '.next'])

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    if (SKIP.has(d.name)) return []
    const p = join(dir, d.name)
    if (d.isDirectory()) return sourceFiles(p)
    return /\.(ts|tsx|mts|js|mjs)$/.test(d.name) ? [p] : []
  })
}

function readNames(): Map<string, string> {
  const found = new Map<string, string>()
  const re = /process\.env(?:\.([A-Z_][A-Z0-9_]*)|\[\s*['"]([A-Z_][A-Z0-9_]*)['"]\s*\])/g
  for (const f of [...sourceFiles(join(ROOT, 'src')), ...sourceFiles(join(ROOT, 'scripts'))]) {
    for (const m of readFileSync(f, 'utf8').matchAll(re)) {
      const name = m[1] ?? m[2]
      if (!found.has(name)) found.set(name, f.slice(ROOT.length + 1))
    }
  }
  return found
}

describe('env declarations (DEC-24)', () => {
  const names = readNames()
  const envTs = readFileSync(join(ROOT, 'src/env.ts'), 'utf8')
  const example = readFileSync(join(ROOT, '.env.example'), 'utf8')

  it('finds the names src/ and scripts/ read', () => {
    expect(names.size).toBeGreaterThan(10)
    expect([...names.keys()]).toEqual(expect.arrayContaining(['DISABLE_DB_PUSH', 'PORTAL_TZ', 'STUDENT_PORTAL_EMBED_ORIGIN', 'PORTAL_DB_PAYMENTS_USER']))
  })

  it('declares every process.env name in the src/env.ts schema', () => {
    const missing = [...names].filter(([n]) => !new RegExp(`^\\s+${n}:`, 'm').test(envTs)).map(([n, f]) => `${n} (${f})`)
    expect(missing).toEqual([])
  })

  it('lists every process.env name in .env.example', () => {
    const missing = [...names].filter(([n]) => !new RegExp(`\\b${n}\\b`).test(example)).map(([n, f]) => `${n} (${f})`)
    expect(missing).toEqual([])
  })
})
