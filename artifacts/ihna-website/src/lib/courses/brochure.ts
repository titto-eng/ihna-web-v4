import type { Payload } from 'payload'

// DEC-69: a course's brochure is the `documents` row in `courses.brochure` (served at its `publicPath`); `courses.brochureUrl` is the
// legacy fallback. Every reader goes through these helpers so the precedence lives in one place.

type BrochureDoc = { id?: number | string; publicPath?: string | null }
export type BrochureCourse = {
  brochure?: number | string | BrochureDoc | null
  brochureUrl?: string | null
}

const text = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null)

/** The id of `course.brochure`, populated or not; null when unset. */
export const brochureIdOf = (course: BrochureCourse | null | undefined): number | string | null => {
  const b = course?.brochure
  if (b === null || b === undefined || b === '') return null
  if (typeof b === 'object') return b.id ?? null
  return b
}

/** Sync: the href when it is known without a lookup (a populated document, or the legacy URL when no document is set). */
export function brochureHrefOf(course: BrochureCourse | null | undefined): string | null {
  if (!course) return null
  const b = course.brochure
  if (b && typeof b === 'object') {
    const p = text(b.publicPath)
    if (p) return p
  }
  return text(course.brochureUrl)
}

/** Sync: true when the course offers a brochure (a document is set, or the legacy URL is). Gates the BrochureDownload block. */
export const hasBrochure = (course: BrochureCourse | null | undefined): boolean =>
  brochureIdOf(course) !== null || text(course?.brochureUrl) !== null

/**
 * The public URL of the course brochure: the document's `publicPath` when `brochure` is set (fetched when the course was read at
 * depth 0), else `brochureUrl`, else null. A document that cannot be read (deleted, or the lookup fails) falls back to `brochureUrl`.
 */
export async function brochureHrefFor(course: BrochureCourse | null | undefined, opts: { payload?: Payload } = {}): Promise<string | null> {
  if (!course) return null
  const b = course.brochure
  if (b && typeof b === 'object' && text(b.publicPath)) return text(b.publicPath)
  const id = brochureIdOf(course)
  if (id !== null) {
    try {
      const payload = opts.payload ?? (await defaultPayload())
      const doc = (await payload.findByID({ collection: 'documents', id, depth: 0, overrideAccess: true, select: { publicPath: true } })) as BrochureDoc | null
      const p = text(doc?.publicPath)
      if (p) return p
    } catch {
      /* missing document: fall back to the legacy URL */
    }
  }
  return text(course.brochureUrl)
}

async function defaultPayload(): Promise<Payload> {
  const [{ getPayload }, { default: config }] = await Promise.all([import('payload'), import('@payload-config')])
  return getPayload({ config })
}
