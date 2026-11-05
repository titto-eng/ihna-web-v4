import { LEGACY_BASE_URL } from './config'
import { normaliseLegacyPath } from './context'
import { THEME_LEGACY_PREFIX, classify } from './images-select'

/** The old site's host (ihm.edu.au, ihna.edu.au): images on any other host are not ours. */
const SITE_HOST = new URL(LEGACY_BASE_URL).hostname.replace(/^www\./, '')

// What image goes where. Pure: the step passes in a `resolve` over the media that exist and gets media ids back, so the choices can
// be tested without a database. Paths are legacyPaths of `media` rows; `T()` is shorthand for a theme asset.
export const T = (p: string): string => `${THEME_LEGACY_PREFIX}${p}`
export type Resolve = (legacyPath: string) => number | null

/** First candidate that resolves to a media id. */
export const firstOf = (resolve: Resolve, candidates: string[]): { id: number; path: string } | null => {
  for (const path of candidates) {
    const id = resolve(path)
    if (id != null) return { id, path }
  }
  return null
}

// ---- courses -------------------------------------------------------------------------------------------------------------
const GCAN_SPECIALTIES: [RegExp, string[]][] = [
  [/acute-care/, ['acute-care-nursing-img.jpg', 'acute-care-thumb.jpg', 'acute-care-nursing.png']],
  [/critical-care/, ['critical-care-nursing-img.jpg', 'critical-care-thumb.jpg', 'critical-care-nursing.png']],
  [/emergency/, ['emergency-nursing-img.jpg', 'emergency-thumb.jpg']],
  [/gerontology/, ['gerontology-nursing-img.jpg', 'gerontology-thumb.jpg']],
  [/mental-health/, ['mental-health-nursing-img.jpg', 'mental-health-thumb.jpg', 'mental-health-nursing.png']],
  [/neonatal/, ['neonatal-nursing-img.jpg', 'neonatal-thumb.jpg', 'neonatal-nursing.png']],
  [/orthopaedic/, ['orthopaedic-nursing-img.jpg', 'orthopaedics-thumb.jpg', 'orthopaedics-nursing.webp']],
  [/paediatric/, ['paediatric-nursing-img.jpg', 'paediatric-thumb.jpg', 'paediatric-nursing.webp']],
  [/palliative/, ['palliative-care-nursing-img.jpg', 'palliative-care-thumb.jpg', 'palliative-care-nursing.webp']],
  [/perioperative/, ['perioperative-nursing.jpg', 'perioperative-thumb.jpg', 'perioperative-nursing.webp']],
  [/renal/, ['renal-nursing.jpg', 'renal-thumb.jpg', 'ihm-renal-nursing.png']],
  [/diabetes/, ['diabetes-nursing.jpg', 'diabetes-thumb.jpg', 'diabetes-nursing.webp']],
].map(([re, files]) => [re as RegExp, (files as string[]).map((f) => T(`images/${f}`))])

/** Ordered: the first rule whose pattern matches the course slug wins; its candidates are tried in order. */
export const COURSE_RULES: [RegExp, string[]][] = [
  [/^bachelor-of-nursing-international/, ['lp/bachelor-of-nursing-brisbane/assets/nursing-banner-v2.webp', T('images/bon_banner.webp')]],
  [/^bachelor-of-nursing/, ['lp/bachelor-of-nursing-brisbane/assets/nursing-hero.webp', T('images/bon_banner.webp')]],
  [/^bachelor-of-social-work-international/, ['lp/bachelor-of-social-work-melbourne/assets/img/banner-sm.webp', T('images/social-work.webp')]],
  [/^diploma-of-community-service/, ['lp/bachelor-of-social-work-ihm/assets/img/block-img.webp', T('images/social-work.webp')]],
  [/^bachelor-of-social-work/, ['lp/enquiry-ihm/img/bsw.webp', T('images/social-work.webp')]],
  [/^master-of-nursing/, ['lp/enquiry-ihm/img/mon.webp', T('images/master-nursing-online.webp')]],
  [/^nclex/, ['lp/enquiry-ihm/img/nclex.webp', T('images/mnoba-rn.jpg')]],
  [/^osce/, ['lp/enquiry-ihm/img/osce.webp', T('images/gallery/IHM-NURSING-LAB-BED.jpg')]],
  [/to-master-of-nursing$/, ['lp/enquiry-ihm/img/gcan-anp.webp', T('images/nurse-gcan.webp')]],
  [/australian-nursing-practice$/, [T('images/australian-nursing-practice-thumb.jpg'), T('images/nurse-gcan.webp')]],
  ...GCAN_SPECIALTIES,
]

/** Per-school default photograph (nursing, social work; dental and health management when those schools exist), never a logo. */
export const SCHOOL_DEFAULTS: Record<string, string[]> = {
  'school-of-nursing': [T('images/gallery/IHM-NURSING-LAB-BED.jpg'), T('images/nurse-gcan.webp'), T('images/gallery/CBD_6.jpg')],
  'school-of-social-work': ['lp/bachelor-of-social-work-ihm/assets/img/block-img.webp', T('images/social-work.webp')],
  'school-of-dental': [T('images/gallery/IHM-NURSING-LAB.jpg')],
  'school-of-health-management': [T('images/gallery/classroom8.jpg'), T('images/community-benefits.webp')],
}
export const SITE_DEFAULT = [T('images/melbourne-header.webp'), T('images/gallery/IHM-NURSING-LAB.jpg')]

/** `<img>` and CSS `url()` references inside an old course page, normalised to legacyPaths, in document order. */
export function imageRefs(html: string): string[] {
  const out: string[] = []
  const add = (src: string) => {
    if (!src || /^data:/.test(src)) return
    let host = ''
    try { host = new URL(src, `https://${SITE_HOST}`).hostname } catch { return }
    if (host !== SITE_HOST && !host.endsWith(`.${SITE_HOST}`)) return // youtube thumbnails, github, anmac logos: not ours
    const p = normaliseLegacyPath(src.replace(/&#038;|&amp;/g, '&'))
    if (!out.includes(p)) out.push(p)
  }
  for (const m of html.matchAll(/<img\b[^>]*?\bsrc=["']([^"']+)["']/gi)) add(m[1])
  for (const m of html.matchAll(/url\(\s*["']?([^)"']+\.(?:jpe?g|png|webp))/gi)) add(m[1])
  return out
}

/** How many courses use each image: one used by many is page furniture (related-post cards, logos), not this course's own picture. */
export function sharedImages(pages: string[][], maxCourses = 4): Set<string> {
  const count = new Map<string, number>()
  for (const refs of pages) for (const r of new Set(refs)) count.set(r, (count.get(r) ?? 0) + 1)
  return new Set([...count].filter(([, n]) => n > maxCourses).map(([p]) => p))
}

/** The page's own picture: first reference that is a plain photograph (not a portrait, logo or graphic) and not shared furniture. */
export function ownImage(refs: string[], shared: Set<string>, resolve: Resolve): { id: number; path: string } | null {
  for (const ref of refs) {
    if (shared.has(ref)) continue
    const rel = ref.startsWith(THEME_LEGACY_PREFIX) ? ref.slice(THEME_LEGACY_PREFIX.length) : ref.startsWith('wp-content/uploads/') ? `uploads:${ref.slice('wp-content/uploads/'.length)}` : null
    if (!rel) continue
    const verdict = classify(rel, 10_000)
    if (!verdict.ok || verdict.kind !== 'photo') continue
    const id = resolve(ref)
    if (id != null) return { id, path: ref }
  }
  return null
}

export type CourseHeroSource = 'featured' | 'own-page' | 'rule' | 'school-default' | 'site-default'
export type CourseHeroPlan = { id: number; path: string; source: CourseHeroSource } | null

export function planCourseHero(
  course: { slug: string; school?: string | null; refs: string[]; featured?: string[] },
  shared: Set<string>, resolve: Resolve,
): CourseHeroPlan {
  // the page's featured image (IHNA: `og:image`, step course-live), then its sibling page's
  const featured = firstOf(resolve, course.featured ?? [])
  if (featured) return { ...featured, source: 'featured' }
  const own = ownImage(course.refs, shared, resolve)
  if (own) return { ...own, source: 'own-page' }
  const rule = COURSE_RULES.find(([re]) => re.test(course.slug))
  const byRule = rule ? firstOf(resolve, rule[1]) : null
  if (byRule) return { ...byRule, source: 'rule' }
  const bySchool = firstOf(resolve, SCHOOL_DEFAULTS[course.school ?? ''] ?? [])
  if (bySchool) return { ...bySchool, source: 'school-default' }
  const site = firstOf(resolve, SITE_DEFAULT)
  return site ? { ...site, source: 'site-default' } : null
}

// ---- lookups, home -------------------------------------------------------------------------------------------------------
/** Campus photographs from the theme: header skylines for the city, Brisbane from the January 2026 home carousel slide that announced it. */
export const CAMPUS_IMAGES: Record<string, string[]> = {
  melbourne: [T('images/melbourne-header.webp'), T('images/mel-1.webp')],
  sydney: [T('images/sydney-header.webp'), T('images/sydney-1.webp')],
  perth: [T('images/perth-header.webp'), T('images/perth-1.webp')],
  brisbane: [T('images/carousel-2026/10.webp')],
}
export const SCHOOL_IMAGES: Record<string, string[]> = SCHOOL_DEFAULTS
export const DISCIPLINE_IMAGES: Record<string, string[]> = { nursing: SCHOOL_DEFAULTS['school-of-nursing'], 'social-work': SCHOOL_DEFAULTS['school-of-social-work'] }

export const HOME_IMAGES = {
  hero: [T('images/ihm-alumni/ihm-alumni-img-14.webp'), T('images/carousel-2026/3.webp')],
  facilities: [T('images/gallery/IHM-NURSING-LAB-BED.jpg'), T('images/gallery/CBD_6.jpg')],
  graduates: [T('images/ihm-alumni/ihm-alumni-img-5.webp'), T('images/gallery/1.webp')],
}

// ---- write decision ------------------------------------------------------------------------------------------------------
export type Current = { id: number; legacyPath: string | null } | null
export type Decision = 'set' | 'keep-same' | 'keep-existing' | 'replace-auto'

/**
 * Never overwrite a person's choice. An empty field is filled. A field holding an image that carries a `legacyPath` was put there by
 * an import (a person's upload through /admin has none): `--force` may swap it, otherwise it is left. Re-running changes nothing.
 */
export function decideWrite(current: Current, plannedId: number, force: boolean): Decision {
  if (!current) return 'set'
  if (current.id === plannedId) return 'keep-same'
  if (current.legacyPath && force) return 'replace-auto'
  return 'keep-existing'
}
