// Seeds two CMS values marketing owns with what the live site shows today (cached live renders of 2026-10-21):
//   1. the home page's course cards: `courses.featured` + `featuredOrder` on the courses the live home lists, in its order
//      (HomeView shows the flagged courses by `featuredOrder`). Live cards with no course in the CMS are left out: CHC30121
//      (its course page is 404 on live) and the NCLEX / OSCE cards (ihm.edu.au courses).
//   2. the course stats band: `courseShared.stats` (CourseDetail renders it above the enquiry form; empty = no band), the
//      "300+ / 3,000+ / 35,000+" band of the live course pages.
// Idempotent: a value that already matches is left alone. A value marketing has changed (another set of featured courses, other
// figures) is kept and reported unless --force is given.
// Usage: npx tsx scripts/dev/seed-live-figures.ts [--dry] [--force]
import 'dotenv/config'
import { getPayload } from 'payload'
import { DEV_SITE_URL } from '../import/lib/config'

if (process.env.NODE_ENV === 'production') throw new Error('seed-live-figures is dev only')
process.env.DISABLE_DB_PUSH ??= '1' // the dev server owns schema push (DEC-46); the config reads the flag when it loads
const DRY = process.argv.includes('--dry')
const FORCE = process.argv.includes('--force')

/** The live home's course cards, in order, as course slugs. */
const LIVE_HOME_COURSES = [
  'certificate-iii-in-individual-support-ageing-and-disability',
  'hlt33115-certificate-iii-in-health-services-assistance-assisting-in-nursing-work-in-acute-care',
  'certificate-iii-pathology-collection',
  'hlt37525-certificate-iii-in-pathology-collection',
  'certificate-iii-in-sterilisation-services',
  'hlt35021-certificate-iii-in-dental-assisting',
  'chc52021-diploma-of-community-services-case-management',
  'diploma-community-services-case-management',
  'diploma-of-nursing',
  'hlt57921-diploma-of-anaesthetic-technology-and-practices',
  'provide-first-aid',
  'provide-cardiopulmonary-resuscitation',
  'hltpat005-collect-specimens-for-drugs-of-abuse-testing',
  'provide-basic-emergency-life-support',
]

/** The live course pages' stats band. */
const LIVE_COURSE_STATS = [
  { value: '300+', label: 'Industry partnerships' },
  { value: '3,000+', label: 'IHNA shapes 3,000+ healthcare leaders annually' },
  { value: '35,000+', label: 'Students studied with IHNA' },
]

const { default: config } = await import('../../src/payload.config')
const payload = await getPayload({ config })
const opts = { overrideAccess: true, context: { disableRevalidate: true } } as const
const tags = new Set<string>()

// 1. featured courses
const { docs } = await payload.find({ collection: 'courses', limit: 0, pagination: false, depth: 0, select: { slug: true, featured: true, featuredOrder: true } })
const want = new Map(LIVE_HOME_COURSES.map((slug, i) => [slug, i + 1]))
const missing = LIVE_HOME_COURSES.filter((s) => !docs.some((d) => d.slug === s))
if (missing.length) console.log(`[featured] not in the CMS, skipped: ${missing.join(', ')}`)
const current = docs.filter((d) => d.featured).map((d) => d.slug).sort()
const custom = current.length > 0 && current.join() !== [...want.keys()].filter((s) => !missing.includes(s)).sort().join()
if (custom && !FORCE) {
  console.log(`[featured] ${current.length} courses already featured by hand; left alone (--force to reset to the live set)`)
} else {
  let changed = 0
  for (const d of docs) {
    const order = want.get(d.slug)
    const data = order ? { featured: true, featuredOrder: order } : { featured: false, featuredOrder: null }
    if (Boolean(d.featured) === data.featured && (d.featuredOrder ?? null) === data.featuredOrder) continue
    changed++
    if (!DRY) await payload.update({ collection: 'courses', id: d.id, data: data as never, draft: false, depth: 0, ...opts })
  }
  console.log(`[featured] ${want.size - missing.length} live courses; ${changed} updated${DRY ? ' (dry run)' : ''}`)
  if (changed) tags.add('collection:courses').add('courses')
}

// 2. course stats band
const shared = await payload.findGlobal({ slug: 'courseShared', depth: 0, overrideAccess: true })
const have = (shared.stats ?? []).map((s) => ({ value: s.value, label: s.label }))
if (JSON.stringify(have) === JSON.stringify(LIVE_COURSE_STATS)) {
  console.log('[stats] courseShared.stats already holds the live figures')
} else if (have.length && !FORCE) {
  console.log(`[stats] courseShared.stats holds ${have.length} other figures; left alone (--force to reset to the live figures)`)
} else {
  if (!DRY) await payload.updateGlobal({ slug: 'courseShared', data: { stats: LIVE_COURSE_STATS } as never, draft: false, depth: 0, ...opts })
  console.log(`[stats] courseShared.stats set to ${LIVE_COURSE_STATS.map((s) => s.value).join(' / ')}${DRY ? ' (dry run)' : ''}`)
  tags.add('global:courseShared').add('collection:courses')
}

// A running site caches courses and the global (DEC-33); the hooks were skipped, so tell it.
if (tags.size && !DRY) {
  const secret = process.env.REVALIDATE_SECRET
  const base = process.env.NEXT_PUBLIC_SITE_URL || DEV_SITE_URL
  if (!secret) console.log('REVALIDATE_SECRET not set; restart the site or POST /api/revalidate/')
  else {
    const res = await fetch(`${base}/api/revalidate/`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ tags: [...tags] }), signal: AbortSignal.timeout(10_000),
    }).catch(() => null)
    console.log(res ? `cache cleared (${[...tags].join(', ')}): ${res.status}` : `site not reachable at ${base}; cache not cleared`)
  }
}
process.exit(0)
