import { createHash } from 'node:crypto'

// Pure logic of `npm run import:refresh` (scripts/import/refresh-live.ts): diffing two snapshots of the live WordPress REST data
// and deciding which changed items the importer may touch. No network, no database: tests/import/refresh.test.ts runs on fixtures.

export type SnapItem = {
  id: number
  link: string
  slug?: string
  modified: string
  title?: { rendered: string } | string
  content?: string | null
  [k: string]: unknown
}

export type WpKind = 'pages' | 'posts' | 'courses'
export type ChangeReason = 'modified' | 'url' | 'content'

export type DiffEntry = {
  id: number
  link: string
  path: string
  title: string
  modified: string
  /** changed items only */
  prevModified?: string
  prevLink?: string
  reasons?: ChangeReason[]
}

export type SnapshotDiff = { new: DiffEntry[]; changed: DiffEntry[]; deleted: DiffEntry[]; unchanged: number }

const pathOfLink = (link: string): string => {
  try {
    const p = new URL(link).pathname
    return p.endsWith('/') ? p : `${p}/`
  } catch {
    return link
  }
}

const titleOf = (i: SnapItem): string => (typeof i.title === 'string' ? i.title : i.title?.rendered ?? '').replace(/<[^>]+>/g, '').trim()
const entry = (i: SnapItem): DiffEntry => ({ id: i.id, link: i.link, path: pathOfLink(i.link), title: titleOf(i), modified: i.modified })
const contentHash = (i: SnapItem): string => createHash('sha256').update(i.content ?? '').digest('hex')

/**
 * Diff by `id` + `modified`. A moved link (rule 1: the old URL must still resolve) is a change too. With `compareContent`, a rendered
 * body that differs although `modified` did not move (a shortcode output or theme change) is reported as reason `content`.
 */
export function diffSnapshots(prev: SnapItem[], next: SnapItem[], opts: { compareContent?: boolean } = {}): SnapshotDiff {
  const before = new Map(prev.map((i) => [i.id, i]))
  const after = new Map(next.map((i) => [i.id, i]))
  const out: SnapshotDiff = { new: [], changed: [], deleted: [], unchanged: 0 }
  for (const i of next) {
    const old = before.get(i.id)
    if (!old) {
      out.new.push(entry(i))
      continue
    }
    const reasons: ChangeReason[] = []
    if (old.modified !== i.modified) reasons.push('modified')
    if (old.link !== i.link) reasons.push('url')
    if (opts.compareContent && i.content != null && old.content != null && contentHash(old) !== contentHash(i)) reasons.push('content')
    if (reasons.length) out.changed.push({ ...entry(i), prevModified: old.modified, ...(old.link !== i.link ? { prevLink: old.link } : {}), reasons })
    else out.unchanged++
  }
  for (const i of prev) if (!after.has(i.id)) out.deleted.push(entry(i))
  const byPath = (a: DiffEntry, b: DiffEntry) => a.path.localeCompare(b.path) || a.id - b.id
  out.new.sort(byPath)
  out.changed.sort(byPath)
  out.deleted.sort(byPath)
  return out
}

export type DocState = { reviewStatus?: string | null }

/**
 * A doc a person marked `ok` is never re-imported (their review and manual edits stay); it is listed instead.
 * `docs` maps wpId → the stored doc's import state; an id with no doc is importable (new).
 */
export function partitionByReview<T extends { id: number }>(items: T[], docs: ReadonlyMap<number, DocState>): { importable: T[]; skippedOk: T[] } {
  const importable: T[] = []
  const skippedOk: T[] = []
  for (const it of items) (docs.get(it.id)?.reviewStatus === 'ok' ? skippedOk : importable).push(it)
  return { importable, skippedOk }
}

export type ImportSteps = { staff: number[]; wpPosts: number[]; wpCourses: number[]; /** WordPress pages that are code here: reported, never imported */ pages: number[] }

/**
 * Which import step owns each changed id. Staff profile pages (pages.csv `suggested_page_type`) go to `staff`; every other WordPress
 * page is a route file (DEC-61, no pages collection), so it is listed for a developer (`pages`) and no step runs for it.
 */
export function planSteps(ids: Record<WpKind, number[]>, staffPageIds: ReadonlySet<number>): ImportSteps {
  const plan: ImportSteps = { staff: [], wpPosts: [...ids.posts], wpCourses: [...ids.courses], pages: [] }
  for (const id of ids.pages) (staffPageIds.has(id) ? plan.staff : plan.pages).push(id)
  return plan
}

/** `--only` is comma separated, and an empty value would mean "everything": refuse both. */
export function onlyArg(values: (string | number)[]): { arg: string | null; rejected: string[] } {
  const ok = values.map(String).filter((v) => v && !v.includes(','))
  const rejected = values.map(String).filter((v) => !v || v.includes(','))
  return { arg: ok.length ? `--only=${ok.join(',')}` : null, rejected }
}
