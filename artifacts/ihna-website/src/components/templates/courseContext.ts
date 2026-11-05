import type { Course } from '@/payload-types'

// Course data blocks read the course from the render context (20-blocks §2): `<RenderBlocks ctx={{ depth, course }} />`.
// A block with no course renders nothing (and warns once in dev), as the spec says.
export const courseOf = (ctx?: { course?: unknown } | null): Course | null => {
  const c = ctx?.course
  return c && typeof c === 'object' && 'id' in c ? (c as Course) : null
}

const warned = new Set<string>()
export function warnNoCourse(slug: string) {
  if (process.env.NODE_ENV === 'production' || warned.has(slug)) return
  warned.add(slug)
  console.warn(`[course block] ${slug} rendered without a course in the render context`)
}

/** Name of a populated relationship row (depth ≥ 1); ids and missing rows are skipped. */
export const namesOf = (rows: unknown): string[] =>
  (Array.isArray(rows) ? rows : []).flatMap((r) => (r && typeof r === 'object' && 'name' in r && typeof (r as { name: unknown }).name === 'string' ? [(r as { name: string }).name] : []))
