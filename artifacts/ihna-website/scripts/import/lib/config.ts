import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Shared constants for every import step (30-import §6). No secrets here (rule 3).
const here = dirname(fileURLToPath(import.meta.url))

/** Which site's inventory, theme and rules the import uses (ihm-web: 'ihm'). Typed as the union so site branches type-check in both repos. */
export const SITE = 'ihna' as 'ihm' | 'ihna'
export const ROOT = resolve(here, '../../..')
export const OUT_DIR = resolve(ROOT, 'scripts/import/out')
export const CACHE_DIR = resolve(OUT_DIR, 'cache')
export const INVENTORY_DIR = resolve(ROOT, '../inventory')
/** The old repo on disk (read-only; rule 3/4). ihm-web points this at ../ihmv3. */
export const LEGACY_ROOT = resolve(ROOT, '../ihna-web-2.0')
export const LEGACY_THEME = resolve(LEGACY_ROOT, 'wp-content/themes/mwt-ihna')
export const APPRUNNER_API_URL = (process.env.APPRUNNER_API_URL ?? 'https://dgcmciesfx.ap-southeast-2.awsapprunner.com').replace(/\/$/, '')
export const LEGACY_BASE_URL = (process.env.LEGACY_BASE_URL ?? 'https://ihna.edu.au').replace(/\/$/, '')

/** Pages (and posts) below this confidence get `reviewStatus: check` (30-import "Confidence"; tuned only in the validation loop). */
export const CONFIDENCE_THRESHOLD = 0.85
/** Extracted text / source text below this is `check` too. */
export const COVERAGE_THRESHOLD = 0.98

/** Embed hosts the extractor always keeps an iframe for, besides YouTube, Vimeo and Google Maps (DEC-5). A subset of `site.allowedEmbedHosts` (src/content/site.ts). */
export const SEED_EMBED_HOSTS = ['my.matterport.com', 'forms.monday.com', 'ihna.online', 'healthcareers.elmotalent.com.au']

/** Media allowlist (task, AGENTS.md rule 3/4): no svg, no theme assets. */
export const MEDIA_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'] as const
export const MEDIA_MAX_BYTES = 25 * 1024 * 1024
export const CONCURRENCY = 4

/**
 * The steps `npm run import -- all` runs, in this order, per site. `null` = every discovered step by ascending `order` (ihm-web's run).
 * IHNA leaves out `wp-posts` (its 4 WordPress posts are route files at the site root, DEC-42; the step would add 4 posts at
 * /blog/<slug>/) and `wp-json-check` (a report on the live site, run by name). `link-course-brochures` runs after `documents`.
 */
export const ALL_STEPS_BY_SITE: Record<'ihm' | 'ihna', readonly string[] | null> = {
  ihm: null,
  ihna: [
    'course-live', 'media', 'theme-photos', 'lookups', 'apprunner', 'wp-courses', 'staff', 'assign-images', 'link-course-managers',
    'static', 'live-files', 'documents', 'link-course-brochures',
  ],
}
export const ALL_STEPS = ALL_STEPS_BY_SITE[SITE]

/**
 * Whether WordPress posts become `posts` docs on this site: only where its run includes `wp-posts`. On IHNA the 4 WordPress posts
 * are route files at the site root (DEC-42) and the blog comes from App Runner (DEC-105), so the `wp-posts` step and
 * `npm run import:refresh` never write them.
 */
export const WP_POSTS_IMPORTED = ALL_STEPS === null || ALL_STEPS.includes('wp-posts')

/** The local dev server the CLI asks to clear its page cache when NEXT_PUBLIC_SITE_URL is unset (ihm-web :3000, ihna-web :3001). */
export const DEV_SITE_URL = SITE === 'ihna' ? 'http://localhost:3001' : 'http://localhost:3000'

export const reportPath = (step: string) => resolve(OUT_DIR, `${SITE}-${step}.report.json`)
/** Any other file a script writes to scripts/import/out/, named for the site (`ihna-import-smoke.json`). */
export const outPath = (name: string) => resolve(OUT_DIR, `${SITE}-${name}`)
export const MEDIA_MAP_PATH = resolve(OUT_DIR, `${SITE}-media-map.json`)

/** Bumped when the extractor's output changes on purpose, so every document is re-evaluated on the next run. */
export const EXTRACTOR_VERSION = 1

/**
 * Rule 4: a `mailto:` whose local part is not a role mailbox, and a `tel:` that is a mobile number, is a person's contact detail.
 * The link is removed (the visible words stay) and counted without its value. Role inboxes and organisation lines are kept.
 */
export const ROLE_MAILBOXES = [
  'enquiry', 'enquiries', 'info', 'admissions', 'support', 'ihmstudentsupport', 'studentsupport', 'governance', 'events', 'partner',
  'researchethics', 'hr', 'itsupport', 'visasuccess', 'ihmaccounts', 'accounts', 'complaints', 'appeals', 'careers', 'library', 'privacy',
]
