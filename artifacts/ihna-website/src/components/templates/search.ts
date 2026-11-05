import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'
import { pages, type PageEntry } from '@/content/pages'
import { HIDDEN_COURSE_SLUGS } from './courseFilters'
import { MIN_QUERY, cleanQuery, type SearchHit, type SearchResults } from './searchTypes'

export { MIN_QUERY, cleanQuery }
export type { SearchHit, SearchResults }

type Row = { title: string; path: string; snippet: string | null; rank: number | string }
type Db = { execute: (q: unknown) => Promise<{ rows: Row[] }> }

const toHits = (type: SearchHit['type'], rows: Row[]): SearchHit[] =>
  rows.filter((r) => r.path).map((r) => ({ type, title: r.title, path: r.path, snippet: r.snippet ? r.snippet.slice(0, 220) : null, rank: Number(r.rank) }))

// --- hardcoded pages: an in-memory index over src/content/pages.ts (title weighs most, then description, then body text) ---

const SKIP_TEMPLATES = new Set(['receipt', 'payOnline', 'staffProfile'])
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
const terms = (q: string) => norm(q).replace(/"/g, ' ').split(/\s+/).map((t) => t.replace(/^-/, '')).filter((t) => t.length >= 2)

const indexed = pages
  .filter((p) => !SKIP_TEMPLATES.has(p.template) && !p.noindex && !p.path.startsWith('/thanks'))
  .map((p) => ({ p, title: norm(p.title), description: norm(p.description ?? ''), text: norm(p.text ?? '') }))

function snippetFor(p: PageEntry, t: string[]): string | null {
  if (p.description) return p.description.slice(0, 220)
  const text = p.text ?? ''
  const i = t.map((w) => text.toLowerCase().indexOf(w)).filter((x) => x >= 0).sort((a, b) => a - b)[0]
  if (i === undefined) return text ? text.slice(0, 220) : null
  const start = Math.max(0, i - 60)
  return `${start ? '…' : ''}${text.slice(start, start + 200)}…`
}

export function searchPages(q: string, limit: number): SearchHit[] {
  const t = terms(q)
  if (!t.length) return []
  const scored = indexed.flatMap(({ p, title, description, text }) => {
    let rank = 0
    for (const w of t) {
      if (title.includes(w)) rank += 10
      if (description.includes(w)) rank += 4
      if (text.includes(w)) rank += 1
    }
    // every term must appear somewhere
    return t.every((w) => title.includes(w) || description.includes(w) || text.includes(w)) ? [{ p, rank }] : []
  })
  return scored
    .sort((a, b) => b.rank - a.rank || a.p.title.localeCompare(b.p.title))
    .slice(0, limit)
    .map(({ p, rank }) => ({ type: 'page' as const, title: p.title, path: p.path, snippet: snippetFor(p, t), rank }))
}

// --- courses and posts: Postgres full-text search (`english`, websearch syntax) over titles, excerpts and content ---

async function fullText(q: string, limit: number): Promise<Omit<SearchResults, 'q' | 'total' | 'pages'>> {
  const payload = await getPayload({ config })
  const db = (payload.db as unknown as { drizzle: Db }).drizzle
  const hidden = sql.join(HIDDEN_COURSE_SLUGS.map((s) => sql`${s}`), sql`, `)
  const [courses, posts] = await Promise.all([
    db.execute(sql`
      select c.title, c.path, c.excerpt as snippet, ts_rank(d.doc, query) as rank
      from courses c
      cross join websearch_to_tsquery('english', ${q}) query
      cross join lateral (select
        setweight(to_tsvector('english', coalesce(c.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(c.excerpt, '')), 'B') ||
        setweight(to_tsvector('english', coalesce((select string_agg(s.layout::text, ' ') from courses_sections s where s._parent_id = c.id), '')), 'C') as doc) d
      where c._status = 'published' and c.slug not in (${hidden}) and coalesce(c.seo_noindex, false) = false and d.doc @@ query
      order by rank desc, c.title limit ${limit}`),
    db.execute(sql`
      select p.title, p.path, p.excerpt as snippet, ts_rank(d.doc, query) as rank
      from posts p
      cross join websearch_to_tsquery('english', ${q}) query
      cross join lateral (select
        setweight(to_tsvector('english', coalesce(p.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(p.excerpt, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(p.content::text, '')), 'C') as doc) d
      where p._status = 'published' and coalesce(p.seo_noindex, false) = false and d.doc @@ query
      order by rank desc, p.published_at desc limit ${limit}`),
  ])
  return { courses: toHits('course', courses.rows), posts: toHits('post', posts.rows) }
}

// Fallback when the SQL path is unavailable: title `like` through the Local API.
async function titleLike(q: string, limit: number): Promise<Omit<SearchResults, 'q' | 'total' | 'pages'>> {
  const payload = await getPayload({ config })
  const where = (extra: Where = {}): Where => ({ and: [{ _status: { equals: 'published' } }, { title: { like: q } }, extra] })
  const [courses, posts] = await Promise.all([
    payload.find({ collection: 'courses', where: where({ slug: { not_in: [...HIDDEN_COURSE_SLUGS] } }), depth: 0, limit, select: { title: true, path: true, excerpt: true } }),
    payload.find({ collection: 'posts', where: where(), depth: 0, limit, select: { title: true, path: true, excerpt: true } }),
  ])
  const hits = (type: SearchHit['type'], docs: { title: string; path?: string | null; excerpt?: string | null }[]) =>
    docs.flatMap((d) => (d.path ? [{ type, title: d.title, path: d.path, snippet: d.excerpt ?? null, rank: 0 }] : []))
  return { courses: hits('course', courses.docs), posts: hits('post', posts.docs) }
}

export async function searchContent(raw: unknown, limit = 20): Promise<SearchResults> {
  const q = cleanQuery(raw)
  if (q.length < MIN_QUERY) return { q, courses: [], pages: [], posts: [], total: 0 }
  let r: Omit<SearchResults, 'q' | 'total' | 'pages'>
  try {
    r = await fullText(q, limit)
  } catch (err) {
    console.error('[search] full-text query failed, falling back to title match', err)
    r = await titleLike(q, limit)
  }
  const found = searchPages(q, limit)
  return { q, ...r, pages: found, total: r.courses.length + found.length + r.posts.length }
}
