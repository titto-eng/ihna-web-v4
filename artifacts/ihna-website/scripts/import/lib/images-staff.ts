import { basename, extname } from 'node:path'
import { THEME_LEGACY_PREFIX } from './images-select'

// Matching a staff member to a theme photograph. The old profile page carried an <img> of the person (staff-parse `photoSrc`);
// the repo copy of the theme lacks about half of those files, so the order of preference is
//   1. the exact file the page used, in the repo copy of the theme (case-insensitive)
//   2. that same URL on the live site (GET only; skipped with --offline)
//   3. a file in the theme whose name matches the person's name (typo-tolerant), for people whose page file is gone everywhere
export type StaffRef = { slug: string; name: string; photoSrc: string }
export type LocalMatch = { rel: string; method: 'exact' | 'case-insensitive' | 'name-tokens' }

/** `https://ihm.edu.au/wp-content/themes/mwt-ihm/assets/images/a%20b.png` -> `images/a b.png`; null for anything outside the theme. */
export function themeRelOf(src: string): string | null {
  let path = src.trim()
  try { path = new URL(path, 'https://ihm.edu.au').pathname } catch { /* keep */ }
  try { path = decodeURI(path) } catch { /* keep */ }
  path = path.replace(/^\/+/, '')
  return path.startsWith(THEME_LEGACY_PREFIX) ? path.slice(THEME_LEGACY_PREFIX.length) : null
}

export const isPlaceholderSrc = (src: string): boolean => /(placeholder|dummy)/i.test(src)

const TITLES = new Set(['dr', 'prof', 'professor', 'assoc', 'associate', 'adjunct', 'emeritus', 'mrs', 'mr', 'ms', 'miss', 'phd', 'md'])

/** First and last name tokens of a display name, titles and initials removed: "Assoc. Prof. Helen Mary Almond" -> ["helen", "almond"]. */
export function nameTokens(name: string): [string, string] | null {
  const parts = name.replace(/,.*$/, '').toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 1 && !TITLES.has(w))
  return parts.length >= 2 ? [parts[0], parts[parts.length - 1]] : null
}

export function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}

const near = (a: string, b: string) => a === b || (Math.min(a.length, b.length) >= 5 && editDistance(a, b) <= (Math.min(a.length, b.length) >= 8 ? 2 : 1))

/** Does a file name mention this person (first and last name, typos of one or two letters allowed)? */
export function fileMentions(file: string, name: string): boolean {
  const want = nameTokens(name)
  if (!want) return false
  const stem = basename(file, extname(file)).toLowerCase()
  const squashed = stem.replace(/[^a-z]/g, '')
  if (squashed.includes(want[0]) && squashed.includes(want[1])) return true
  const have = stem.split(/[^a-z]+/).filter(Boolean)
  return have.some((t) => near(t, want[0])) && have.some((t) => near(t, want[1]))
}

/** Same person by first and last name, titles ignored and a one- or two-letter typo allowed ("Mckeever" / "McKeever"). */
export function samePerson(a: string, b: string): boolean {
  const x = nameTokens(a)
  const y = nameTokens(b)
  return !!x && !!y && near(x[0], y[0]) && near(x[1], y[1])
}

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i

/** Local candidates for one person, `rels` being every path under the theme's `assets/`. */
export function matchLocal(ref: StaffRef, rels: string[]): LocalMatch | null {
  const want = isPlaceholderSrc(ref.photoSrc) ? null : themeRelOf(ref.photoSrc)
  if (want) {
    if (rels.includes(want)) return { rel: want, method: 'exact' }
    const ci = rels.find((r) => r.toLowerCase() === want.toLowerCase())
    if (ci) return { rel: ci, method: 'case-insensitive' }
  }
  return null
}

/** Name-based fallback. Several files can mention one person; the caller picks the widest. */
export function matchByName(ref: StaffRef, rels: string[]): string[] {
  return rels.filter((r) => IMAGE_EXT.test(r) && /^(images|bootstrap\/images)\//.test(r) && fileMentions(r, ref.name))
}

/** The staff docs of the old `/<person>/` profile pages (IHM: 51; IHNA has none, DEC-65), with the photo each page showed. Same grouping as the `staff` step (DEC-9: the `-2` twin shares one doc). */
export async function loadStaffRefs(): Promise<StaffRef[]> {
  const [{ groupPages }, { decodeTitle, loadPageRows, loadPages }, { parseStaffPage }] = await Promise.all([
    import('../steps/staff'), import('./data'), import('./staff-parse'),
  ])
  const ids = new Set(loadPageRows().filter((r) => r.wp_type === 'page' && r.suggested_page_type === 'staff-profile').map((r) => r.wp_id))
  const pages = loadPages().filter((p) => ids.has(String(p.id)))
  return groupPages(pages).map((g) => {
    const s = parseStaffPage(g.primary.content ?? '', decodeTitle(g.primary.title.rendered))
    return { slug: g.key.split('/').filter(Boolean).pop() as string, name: s.name, photoSrc: s.photoSrc }
  })
}
