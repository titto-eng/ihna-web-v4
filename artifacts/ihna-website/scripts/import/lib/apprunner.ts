import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { APPRUNNER_API_URL, CACHE_DIR, INVENTORY_DIR } from './config'

// The App Runner content API (blogs, campuses, galleries) behind the old theme (30-import §7.2 `apprunner`).
// Public, GET only, no credentials; at most one request per second (polite pacing, shared with image downloads).
// Every response is snapshotted under ../inventory/data/ihna/apprunner/ (outside the repo), or under
// scripts/import/out/cache/apprunner-api/ when the inventory is read-only (Docker), and re-used until `--refresh`.

export const SNAPSHOT_DIR = resolve(INVENTORY_DIR, 'data/ihna/apprunner')
export const USER_AGENT = 'ihna-web-import/1.0 (content migration; GET only)'
const MIN_GAP_MS = 1000

let next = 0
/** Request starts are at least one second apart, also for concurrent callers (each reserves its slot synchronously). */
export async function pace(): Promise<void> {
  const now = Date.now()
  const at = Math.max(now, next)
  next = at + MIN_GAP_MS
  if (at > now) await new Promise((r) => setTimeout(r, at - now))
}

/** GET with pacing and two retries on network errors / 5xx. */
export async function politeGet(url: string, attempts = 3): Promise<Response> {
  for (let i = 1; ; i++) {
    await pace()
    try {
      const res = await fetch(url, { headers: { 'user-agent': USER_AGENT }, signal: AbortSignal.timeout(30_000) })
      if (res.status < 500 || i === attempts) return res
    } catch (e) {
      if (i === attempts) throw e
    }
  }
}

export type ApiBlog = {
  _id: string
  title: string
  slug: string
  published_date?: string | null
  read_time?: string | number | null
  short_blog?: string | null
  detailed_blog?: string | null
  breaking_blog?: boolean | null
  status?: string | null
  meta_title?: string | null
  meta_description?: string | null
  card_img?: string | null
  page_img?: string | null
  category?: string | null
  category_name?: string | null
  updated_at?: string | null
  card_img_url?: string | null
  page_img_url?: string | null
}
export type ApiCampus = { _id: string; name: string; slug?: string; status?: string }
export type ApiGalleryCategory = { _id: string; title: string; slug?: string; featured?: boolean; gallery_event_date?: string | null; status?: string; cover_img?: string | null; updated_at?: string | null }
export type ApiGalleryItem = { _id: string; title?: string | null; short_description?: string | null; card_img?: string | null; gallery_category?: string | null; gallery_event_date?: string | null; status?: string; updated_at?: string | null }
export type ApiCampusCategory = { id: string; gallery_category_title?: string; gallery_event_date?: string; card_img?: string; featured?: boolean }

/** Where a snapshot is written when the inventory folder is read-only (the Docker dev container mounts it `:ro`). */
export const SNAPSHOT_FALLBACK_DIR = resolve(CACHE_DIR, 'apprunner-api')
const snapshotFile = (name: string) => resolve(SNAPSHOT_DIR, `${name}.json`)
const fallbackFile = (name: string) => resolve(SNAPSHOT_FALLBACK_DIR, `${name}.json`)

/** One endpoint: the snapshot when present (unless `refresh`), else a paced GET that writes the snapshot. */
export async function apiGet<T>(name: string, path: string, opts: { refresh?: boolean; log?: (m: string) => void } = {}): Promise<T> {
  const file = snapshotFile(name)
  if (!opts.refresh) {
    for (const f of [file, fallbackFile(name)]) if (existsSync(f)) return JSON.parse(readFileSync(f, 'utf8')) as T
  }
  const url = `${APPRUNNER_API_URL}${path}`
  opts.log?.(`GET ${path}`)
  const res = await politeGet(url)
  if (!res.ok) throw new Error(`App Runner ${path}: HTTP ${res.status}`)
  const data = (await res.json()) as T
  const json = JSON.stringify(data, null, 1)
  try {
    mkdirSync(SNAPSHOT_DIR, { recursive: true })
    writeFileSync(file, json)
  } catch {
    // read-only inventory (Docker): keep the snapshot in the import cache instead
    mkdirSync(SNAPSHOT_FALLBACK_DIR, { recursive: true })
    writeFileSync(fallbackFile(name), json)
  }
  return data
}

export type ApiSnapshot = {
  blogs: ApiBlog[]
  campuses: ApiCampus[]
  categories: ApiGalleryCategory[]
  items: ApiGalleryItem[]
  /** campus id → the gallery categories the old campus filter shows for it. */
  campusCategories: Record<string, ApiCampusCategory[]>
}

export async function loadApi(opts: { refresh?: boolean; log?: (m: string) => void } = {}): Promise<ApiSnapshot> {
  const blogs = await apiGet<ApiBlog[]>('blogs', '/blogs/', opts)
  const campuses = await apiGet<ApiCampus[]>('campus', '/campus/?status=ACTIVE', opts)
  const categories = await apiGet<ApiGalleryCategory[]>('gallerycategory', '/gallerycategory/', opts)
  const items = await apiGet<ApiGalleryItem[]>('gallery', '/gallery/', opts)
  const campusCategories: Record<string, ApiCampusCategory[]> = {}
  for (const c of campuses) campusCategories[c._id] = await apiGet<ApiCampusCategory[]>(`campus_category_${c._id}`, `/campus_category_get/?related_campus=${c._id}`, opts)
  return { blogs, campuses, categories, items, campusCategories }
}
