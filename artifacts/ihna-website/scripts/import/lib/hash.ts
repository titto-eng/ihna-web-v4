import { createHash } from 'node:crypto'
import { lexicalText } from './lexical'

export const sha = (value: unknown): string => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex').slice(0, 16)

// Presentation-only keys Payload fills with defaults (or an editor tweaks) and ids it generates: not content.
// Empty arrays, `false` and empty strings are dropped for the same reason: Payload adds them as defaults on save.
const IGNORED = new Set(['id', 'tone', 'spacing', 'anchorId', 'width', 'variant', 'columns', 'headerRow', 'imageSide', 'style'])

/**
 * Content fingerprint of a layout or Lexical document: Lexical states collapse to their text, defaults and ids are dropped.
 * The same function runs on what the importer built and on what the database returns, so an unchanged document hashes the same
 * (Payload adds defaults on save) and an admin edit to any text, link or block changes the hash (30-import "conflict").
 */
export function fingerprint(value: unknown): string {
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>
      if ('root' in o && typeof o.root === 'object') return lexicalText(o)
      return Object.fromEntries(
        Object.entries(o)
          .filter(([k, x]) => !IGNORED.has(k) && x !== null && x !== undefined && x !== '' && x !== false && !(Array.isArray(x) && x.length === 0))
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, x]) => [k, walk(x)]),
      )
    }
    return v
  }
  return sha(walk(value))
}

const UPLOADS = /(\/wp-content\/uploads\/[^"'\s)<>\\]+)/gi

/** Media ids a source document resolves to right now (0 = not imported). Part of the source hash, so importing an image later re-converts the pages that use it. */
export function mediaRefs(html: string | null | undefined, map: Record<string, number>): number[] {
  const out: number[] = []
  for (const m of (html ?? '').matchAll(UPLOADS)) {
    let p = m[1].replace(/&#038;|&amp;/g, '&')
    try {
      p = decodeURI(p)
    } catch {
      /* keep */
    }
    out.push(map[p.replace(/^\/+/, '')] ?? 0)
  }
  return out
}
