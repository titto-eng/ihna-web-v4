import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { INVENTORY_DIR, SITE } from '../lib/config'
import type { ImportContext } from '../lib/context'
import {
  CAMPUS_IMAGES, DISCIPLINE_IMAGES, SCHOOL_IMAGES, decideWrite, firstOf, imageRefs, planCourseHero, sharedImages, type Current, type Decision, type Resolve,
} from '../lib/images-plan'
import { samePerson } from '../lib/images-staff'
import { THEME_PHOTOS_MAP_PATH, type ThemePhotosMap } from './theme-photos'
import { loadCourseLive } from './course-live'
import { registeredSibling } from '../../../src/content/course-siblings'

// `assign-images`: puts the imported photographs where pages need them. Runs after `theme-photos` (and `media`, whose `lp/...` pictures are
// the old course art). Idempotent, and it never overwrites an image a person chose:
//   - an empty field is filled;
//   - a field holding a media doc WITHOUT a legacyPath was uploaded in /admin by a person: always left alone;
//   - a field holding an imported picture (has a legacyPath) is left alone too, unless --force, which may swap it for the plan's choice.
// Targets: staff.photo, courses.heroImage (IHNA: the page's featured image first, see course-live), campuses/categories/disciplines.image.
export const name = 'assign-images'
export const order = 60

type Id = number | string
const idOf = (v: unknown): number | null => (v && typeof v === 'object' ? Number((v as { id: Id }).id) : v == null ? null : Number(v))

export async function run(ctx: ImportContext) {
  const { payload, report } = ctx
  if (!existsSync(THEME_PHOTOS_MAP_PATH)) throw new Error('run `npm run import -- theme-photos` first (no theme-photos map found)')
  const photos = JSON.parse(readFileSync(THEME_PHOTOS_MAP_PATH, 'utf8')) as ThemePhotosMap
  const force = ctx.args.force

  // every media doc: legacyPath -> id, id -> legacyPath (so a person's upload, which has none, is recognisable)
  const all = await payload.find({ collection: 'media', limit: 0, depth: 0, pagination: false, overrideAccess: true, select: { legacyPath: true } })
  const byPath = new Map<string, number>()
  const pathOf = new Map<number, string | null>()
  for (const d of all.docs) {
    pathOf.set(Number(d.id), d.legacyPath ?? null)
    if (d.legacyPath) byPath.set(d.legacyPath, Number(d.id))
  }
  const resolveId: Resolve = (p) => byPath.get(p) ?? byPath.get(photos.aliases[p] ?? '') ?? null
  const portraits = new Set(photos.portraits)

  const tally: Record<string, Record<Decision, number>> = {}
  const count = (group: string, d: Decision) => {
    tally[group] ??= { set: 0, 'keep-same': 0, 'keep-existing': 0, 'replace-auto': 0 }
    tally[group][d]++
  }
  const current = (v: unknown): Current => {
    const id = idOf(v)
    return id == null ? null : { id, legacyPath: pathOf.get(id) ?? null }
  }
  /** Decide and (unless dry) write one image field. Returns what was decided. */
  async function assign(group: string, collection: 'staff' | 'courses' | 'campuses' | 'categories' | 'disciplines', doc: { id: Id }, field: string, now: unknown, planned: number | null, label: string): Promise<Decision | null> {
    if (planned == null) {
      report.reviewQueue.push({ id: `${collection}/${doc.id}`, path: label, reasons: ['no-image-available'] })
      return null
    }
    const d = decideWrite(current(now), planned, force)
    count(group, d)
    if ((d === 'set' || d === 'replace-auto') && !ctx.dry) {
      try {
        await payload.update({ collection, id: doc.id, data: { [field]: planned } as never, ...ctx.opts })
      } catch (e) {
        report.failed.push({ id: `${collection}/${doc.id}`, reason: e instanceof Error ? e.message : String(e) })
        return null
      }
    }
    if (d === 'set' || d === 'replace-auto') report.updated++
    else report.skipped++
    return d
  }

  // ---- staff -----------------------------------------------------------------------------------------------------------
  const unmatched: string[] = []
  const staff = await payload.find({ collection: 'staff', limit: 0, depth: 0, pagination: false, overrideAccess: true, draft: false })
  for (const s of staff.docs) {
    if (!ctx.wanted(s.slug ?? '', s.id)) continue
    const hit = photos.staff[s.slug ?? '']
    const planned = hit ? (byPath.get(hit.legacyPath) ?? null) : null
    if (planned == null) {
      unmatched.push(s.name)
      count('staff', 'keep-existing')
      continue
    }
    await assign('staff', 'staff', s, 'photo', s.photo, planned, s.name)
  }

  // ---- courses ---------------------------------------------------------------------------------------------------------
  const wpCourses = JSON.parse(readFileSync(resolve(INVENTORY_DIR, `data/${SITE}/courses.json`), 'utf8')) as { slug: string; content: string | null }[]
  const refsBySlug = new Map(wpCourses.map((c) => [c.slug, imageRefs(c.content ?? '')]))
  const shared = sharedImages([...refsBySlug.values()])
  // a portrait never stands in for a course, even when an old page used it as its first picture
  const courseResolve: Resolve = (p) => (portraits.has(p) ? null : resolveId(p))
  const schools = await payload.find({ collection: 'categories', limit: 0, depth: 0, pagination: false, overrideAccess: true })
  const schoolSlug = new Map(schools.docs.map((c) => [Number(c.id), c.slug ?? '']))
  const courses = await payload.find({ collection: 'courses', limit: 0, depth: 0, pagination: false, overrideAccess: true, draft: false })
  // IHNA: the featured image of the page (course-live), then of its other-audience page
  const live = loadCourseLive()
  const featuredOf = (slug: string): string[] => {
    const sib = registeredSibling(slug)?.slug
    return [live[slug]?.heroImage, sib ? live[sib]?.heroImage : null].filter((x): x is string => Boolean(x))
  }
  const heroSources: Record<string, number> = {}
  const heroList: { slug: string; source: string; path: string }[] = []
  for (const c of courses.docs) {
    if (!ctx.wanted(c.slug, c.id)) continue
    const plan = planCourseHero({ slug: c.slug, school: schoolSlug.get(idOf(c.school) ?? -1) ?? null, refs: refsBySlug.get(c.slug) ?? [], featured: featuredOf(c.slug) }, shared, courseResolve)
    if (plan) {
      heroSources[plan.source] = (heroSources[plan.source] ?? 0) + 1
      heroList.push({ slug: c.slug, source: plan.source, path: plan.path })
    }
    await assign('courses', 'courses', c, 'heroImage', c.heroImage, plan?.id ?? null, c.slug)
  }

  // ---- campuses, schools, disciplines ----------------------------------------------------------------------------------
  const lookups = [
    ['campuses', CAMPUS_IMAGES], ['categories', SCHOOL_IMAGES], ['disciplines', DISCIPLINE_IMAGES],
  ] as const
  const lookupResult: Record<string, string[]> = {}
  for (const [collection, plan] of lookups) {
    const docs = await payload.find({ collection, limit: 0, depth: 0, pagination: false, overrideAccess: true })
    for (const d of docs.docs) {
      const slug = (d as { slug?: string }).slug ?? ''
      const wanted = plan[slug] ?? (collection === 'categories' ? plan['school-of-nursing'] : undefined)
      const pick = wanted ? firstOf(courseResolve, wanted) : null
      const res = await assign(collection, collection, d as { id: Id }, 'image', (d as { image?: unknown }).image, pick?.id ?? null, slug)
      if (pick && res) (lookupResult[collection] ??= []).push(`${slug} -> ${pick.path.replace(/^wp-content\/themes\/mwt-ihm\/assets\//, '')} (${res})`)
    }
  }

  // The Home page and /our-people/ are code (src/app/(site)/page.tsx, our-people/page.tsx): their images are written there by hand
  // (`img({...})`), so nothing is seeded for them here.

  report.staffUnmatched = unmatched
  report.heroSources = heroSources
  report.heroes = heroList
  report.lookups = lookupResult
  report.decisions = tally
  report.coursesWithoutHero = courses.docs.length - Object.values(heroSources).reduce((a, b) => a + b, 0)
}

