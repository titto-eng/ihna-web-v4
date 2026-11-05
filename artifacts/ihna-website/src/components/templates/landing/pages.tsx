import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { landingAt, type LandingEntry } from '@/content/landing'
import { site } from '@/content/site'
import { buildMetadata } from '@/lib/seo/metadata'
import type { Campus, Course } from '@/payload-types'
import { CampusBachelor } from './CampusBachelor'
import { CampusMaster } from './CampusMaster'
import { CourseLanding } from './CourseLanding'
import { EnquiryPage } from './EnquiryPage'
import { EventInvite } from './EventInvite'
import { NursingCity } from './NursingCity'
import { Regional } from './Regional'
import { WalkIn } from './WalkIn'
import type { LandingDoc, LandingSlots } from './shared'

// The landing page components a route file renders (60-landing §4). Each looks its registry row up by path, loads the course and
// campus it names from the CMS (cached under the course tags), and renders the template with the route file's JSX slots.

const siteUrl = (): string => process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

/** The registry row for a path; a route file for a path that is not registered is a programming error. */
export function entryFor(path: string): LandingEntry {
  const entry = landingAt(path)
  if (!entry) throw new Error(`landing page ${path} is not in src/content/landing.ts`)
  return entry
}

const loadCourse = (slug: string) =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({ collection: 'courses', where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] }, limit: 1, depth: 1 })
      return (docs[0] as Course | undefined) ?? null
    },
    ['landing-course', slug],
    { tags: [`course:${slug}`, 'collection:courses', 'courses'], revalidate: 300 },
  )()

const loadCampus = (slug: string) =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({ collection: 'campuses', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
      return (docs[0] as Campus | undefined) ?? null
    },
    ['landing-campus', slug],
    { tags: ['collection:campuses', 'campuses'], revalidate: 300 },
  )()

/** Registry row + its CMS relations. Shared by the page, thank-you, campaign and application routes. */
export async function loadLanding(path: string): Promise<LandingDoc | null> {
  const entry = landingAt(path)
  if (!entry) return null
  const [course, campus] = await Promise.all([entry.course ? loadCourse(entry.course).catch(() => null) : null, entry.campus ? loadCampus(entry.campus).catch(() => null) : null])
  return { entry, course, campus }
}

/** Metadata for a landing route file (60 §5): the row's `noindex` (only `false` indexes; `extra.noindex` forces noindex), canonical from the row. */
export function landingMetadata(path: string, extra: { noindex?: boolean; path?: string } = {}): Metadata {
  const entry = entryFor(path)
  const meta = buildMetadata(
    { title: entry.title, path: entry.path, meta: { title: entry.metaTitle, description: entry.description }, noindex: extra.noindex ? true : entry.noindex },
    { path: extra.path },
    { settings: site },
  )
  if (entry.canonical) meta.alternates = { canonical: /^https?:\/\//.test(entry.canonical) ? entry.canonical : `${siteUrl()}${entry.canonical}` }
  return meta
}

type Props = { path: string } & LandingSlots

const page = (Template: (p: { doc: LandingDoc } & LandingSlots) => React.ReactNode) =>
  async function LandingRoute({ path, ...slots }: Props) {
    const doc = await loadLanding(path)
    if (!doc) throw new Error(`landing page ${path} is not in src/content/landing.ts`)
    return <Template doc={doc} {...slots} />
  }

export const CourseLandingPage = page(CourseLanding)
export const CampusBachelorPage = page(CampusBachelor)
export const CampusMasterPage = page(CampusMaster)
export const EnquiryLandingPage = page(EnquiryPage)
export const EventInvitePage = page(EventInvite)
export const NursingCityPage = page(NursingCity)
export const RegionalPage = page(Regional)
export const WalkInPage = page(WalkIn)
