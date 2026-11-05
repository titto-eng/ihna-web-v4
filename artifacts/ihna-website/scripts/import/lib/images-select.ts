import { basename, dirname, extname, resolve } from 'node:path'
import { LEGACY_ROOT, LEGACY_THEME } from './config'

// Photo selection rules for the `theme-photos` step (task: home and course pages must use images). Pure functions: the step
// feeds them paths and pixel sizes, tests feed them literals. Nothing here reads a file.

export const THEME_ASSETS_DIR = resolve(LEGACY_THEME, 'assets')
export const UPLOADS_DIR = resolve(LEGACY_ROOT, 'wp-content/uploads')
/** The old public URL prefix of the theme assets; legacyPath = this + the path inside `assets/` (same shape as `media` uses for uploads). */
export const THEME_LEGACY_PREFIX = `wp-content/themes/${basename(LEGACY_THEME)}/assets/`

export const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const
/** A photograph must be at least this wide, after EXIF rotation. */
export const MIN_PHOTO_WIDTH = 600
/** A staff portrait is shown at most 320 px wide and the old profile photos are 250-580 px, so it may be narrower than a general photo. */
export const MIN_PORTRAIT_WIDTH = 200
/** Longest side kept on import: 6000 px camera originals are served unoptimised (DEC-25), so they are downscaled once here. */
export const MAX_IMPORT_SIDE = 2000

export type SkipReason =
  | 'format' | 'svg' | 'too-small' | 'placeholder' | 'logo' | 'partner-logo' | 'ui-asset' | 'flag' | 'pixel' | 'screenshot'
  | 'infographic' | 'promo-graphic' | 'superseded-copy' | 'video-thumbnail' | 'illustration' | 'portrait-not-on-staff-page'
  | 'duplicate' | 'unreadable' | 'missing-file'

export type Verdict = { ok: true; kind: 'photo' | 'portrait'; alt: string } | { ok: false; reason: SkipReason }

/** Name-based exclusions, tested in order against the lowercase path relative to `assets/` (or the uploads path). */
const NAME_RULES: [SkipReason, RegExp][] = [
  ['placeholder', /(placeholder|dummy|default-avatar|blank-avatar)/],
  ['pixel', /(\bpixel|1x1|spacer|tracking)/],
  ['flag', /(^|[\W_])flag([\W_]|$)/],
  ['screenshot', /(screenshot|screen-shot|web-design|mockup|capture)/],
  ['video-thumbnail', /^images\/testimonials\//],
  ['illustration', /^(micro-credentials|nursing-pathway)\/|(^|\/)rishi([_\-/]|\.)|santa_hat|academic_staff-banner|cover-3-1|home-banner-img/],
  ['logo', /(logo|affiliate|badge|favicon|hci australia|ihm-tagline|bijo-awards|aasw|teqsa|anmac|aqf|neas_|qilt|ramsay|(^|\/)asu[.\-_]|convera|flywire|securepay|payway|e2\.avif|indian-express)/],
  ['partner-logo', /(acelern|edusystems|eduation-hub|healthovation|ihna-banner|ihm-banner|skilldemy|hci-banner|innovation-hub|spaceimax|robotics|cintana)/],
  ['ui-asset', /(icon|arrow|bullet|footer-line|slider-mask|hero-bg|blob|gradient|loader|loading|sprite|(^|\/)ic\d|quote|tick|dropdown|_circle|clndr|linkedin|heart|owl|three-star|(^|\/)arc[.\-_]|layered|package-line|bioicon|^images\/lms\/|^bootstrap\/images\/melbourne-skyline)/],
  ['infographic', /(chart|^images\/g[1-6]\.|flow|diagram|pathway|orgchart|stream_img|osce-journey|mcap|ncap|ahpra|(^|\/)reg_\d|hand-(rub|wash)|assessment-guide|locations\.|locator|world-map|aqf_levels|timeline|how-to|search-tips|academic-integrity|referencing|bibliography|copyright|three-)/],
  ['promo-graphic', /((^|\/)ihm_|popup|pop-up|fbadvt|scholorship|news-thumb|news-details|-news[.\-]|nursesday|welcome|naidoc-banner|covid-disaster|joint-media|vaccine|mon-first-batch|freeseminar|_bnr|ihm-popup|emailer|ihm-logo-stmt|yellow-logos|ihm-ranking|webinar|^images\/new\/)/],
  ['superseded-copy', /(_old|-old|\bold\b|_bkp|\bbkp\b|backup|_oldd|-copy| \(\d\)\.)/],
]

/** Words that mark a root-level image as a subject photo rather than a person; used to tell portraits from stock images. */
const TOPIC_WORDS = new Set([
  'about', 'top', 'img', 'image', 'banner', 'career', 'growth', 'community', 'benefits', 'social', 'work', 'gcan', 'gte', 'global', 'health',
  'melbourne', 'sydney', 'perth', 'brisbane', 'skyline', 'header', 'nursing', 'nurse', 'care', 'thumb', 'news', 'student', 'students', 'mental',
  'master', 'online', 'library', 'banner', 'locations', 'people', 'events', 'partner', 'with', 'us', 'our', 'bon', 'hero', 'mel', 'stream', 'arc',
  'home', 'scholarship', 'ranking', 'photo', 'rn', 'campus', 'class', 'classroom', 'lab', 'graduation', 'alumni', 'gallery', 'carousel', 'lms', 'top',
])

const tokens = (name: string) => name.toLowerCase().replace(/\.[a-z]+$/, '').split(/[^a-z]+/).filter(Boolean)

/** True for `Firstname_Lastname.jpg`, `lisa.jpeg`, `academic-staff/x.webp`: a photograph of one person, by file name. */
export function looksLikePortrait(rel: string): boolean {
  const lower = rel.toLowerCase()
  if (/(^|\/)academic-staff\//.test(lower)) return true
  const [dir, file] = [dirname(rel), basename(rel)]
  if (dir !== 'images' && dir !== 'bootstrap/images') return false
  if (/[0-9]/.test(file.replace(/\.[a-z]+$/i, ''))) return false
  const t = tokens(file)
  if (!t.length || t.length > 4 || t.some((w) => TOPIC_WORDS.has(w))) return false
  return true
}

const CAMPUS_GALLERY: [RegExp, string][] = [
  [/^images\/gallery\/cbd_/i, 'Melbourne CBD campus'],
  [/^images\/gallery\/perth-/i, 'Perth campus'],
  [/^images\/gallery\/sydney-graduation/i, 'Sydney graduation ceremony'],
  [/^images\/gallery\/nmc-/i, 'IHM campus'],
  [/^images\/ihm-alumni\//i, 'IHM graduation ceremony'],
  [/^images\/gallery\/(\d+)\.webp/i, 'IHM graduation ceremony'],
  [/^images\/ihm-aboriginal-events\//i, 'IHM cultural event'],
  [/^images\/cultural-workshops\//i, 'IHM cultural workshop'],
  [/^images\/carousel-2026\//i, 'IHM'],
  [/^images\/(melbourne|mel-)/i, 'Melbourne'],
  [/^images\/(sydney)/i, 'Sydney'],
  [/^images\/(perth)/i, 'Perth'],
]

/** A sensible alt text from the path. There is no `tags` field on media, so the subject goes into `alt`. */
export function altFromPath(rel: string): string {
  const stem = basename(rel, extname(rel))
  const words = stem
    .replace(/-(scaled|e\d{10,})$/g, '').replace(/-\d+x\d+$/, '').replace(/\(\d+\)/g, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
  const prefix = CAMPUS_GALLERY.find(([re]) => re.test(rel))?.[1]
  const human = words.replace(/^(cbd|nmc|perth) /i, '').replace(/\b(img|image|dsc|mg)\b/gi, '').replace(/\d{5,}/g, '').replace(/\s+/g, ' ').trim()
  const subject = /^[\d\s]*$/.test(human) || human.length < 3 ? '' : human.charAt(0).toUpperCase() + human.slice(1)
  if (prefix && subject) return subject.toLowerCase().startsWith(prefix.toLowerCase().split(' ')[0]) ? subject : `${prefix}: ${subject}`
  return prefix ?? (subject || 'IHM photo')
}

/**
 * Decides whether one file enters `media`. `rel` is the path inside `assets/` (theme) or `uploads/<y>/<m>/..` prefixed with `uploads:`;
 * `width` is the pixel width after EXIF rotation. `staffName` is set when a staff profile page uses this file as the person's photo.
 */
export function classify(rel: string, width: number | null, opts: { staffName?: string } = {}): Verdict {
  const ext = extname(rel).slice(1).toLowerCase()
  if (ext === 'svg') return { ok: false, reason: 'svg' }
  if (!(PHOTO_EXTENSIONS as readonly string[]).includes(ext)) return { ok: false, reason: 'format' }
  const path = rel.replace(/^uploads:/, '').toLowerCase()
  if (opts.staffName) {
    if (/(placeholder|dummy)/.test(path)) return { ok: false, reason: 'placeholder' }
    if (width == null) return { ok: false, reason: 'unreadable' }
    if (width < MIN_PORTRAIT_WIDTH) return { ok: false, reason: 'too-small' }
    return { ok: true, kind: 'portrait', alt: opts.staffName }
  }
  for (const [reason, re] of NAME_RULES) if (re.test(path)) return { ok: false, reason }
  if (width == null) return { ok: false, reason: 'unreadable' }
  if (width < MIN_PHOTO_WIDTH) return { ok: false, reason: 'too-small' }
  if (looksLikePortrait(rel)) return { ok: false, reason: 'portrait-not-on-staff-page' }
  return { ok: true, kind: 'photo', alt: altFromPath(rel) }
}

export const legacyPathOf = (rel: string): string =>
  rel.startsWith('uploads:') ? `wp-content/uploads/${rel.slice('uploads:'.length)}` : `${THEME_LEGACY_PREFIX}${rel}`

/** Hamming distance of two 64-bit difference hashes given as 16-char hex. */
export function hashDistance(a: string, b: string): number {
  let d = 0
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16)
    while (x) { d += x & 1; x >>= 1 }
  }
  return d
}

export type HashedFile = { rel: string; sha: string; dhash: string; width: number; height: number }

/**
 * Keeps one file per picture. Exact duplicates (same bytes) and visual duplicates (same aspect ratio, dhash distance <= 3)
 * collapse onto the widest file, ties broken by path. Returns the kept files and `alias[dropped] = kept`.
 */
export function dedupe(files: HashedFile[]): { kept: HashedFile[]; alias: Record<string, string> } {
  const sorted = [...files].sort((a, b) => b.width - a.width || a.rel.localeCompare(b.rel))
  const kept: HashedFile[] = []
  const alias: Record<string, string> = {}
  for (const f of sorted) {
    const twin = kept.find((k) => k.sha === f.sha || (Math.abs(k.width / k.height - f.width / f.height) < 0.03 && hashDistance(k.dhash, f.dhash) <= 3))
    if (twin) alias[f.rel] = twin.rel
    else kept.push(f)
  }
  return { kept: kept.sort((a, b) => a.rel.localeCompare(b.rel)), alias }
}
