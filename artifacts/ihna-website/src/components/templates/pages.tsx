import type { ReactNode } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { OrganizationJsonLd } from '@/components/seo/Organization'
import type { AnyBlock } from '@/components/RenderBlocks'
import { campusContacts } from '@/content/campuses'
import { footer } from '@/content/footer'
import { nav } from '@/content/nav'
import { pagesByTemplate } from '@/content/pages'
import { site } from '@/content/site'
import { getIntakeCalendar, portalToday } from '@/lib/portal'
import type { Course } from '@/payload-types'
import { AlumniHubView, ContactView, LandingView } from './Generic'
import { CalendarView } from './Calendar'
import { CampusListingView, CampusView } from './Campus'
import { EventsListingView, type EventRow } from './EventsListing'
import { HomeView, type HomeData } from './Home'
import { MicroCredentialView, MicroCredentialsHubView } from './MicroCredential'
import { SchoolView } from './School'
import { StaffDirectoryView } from './StaffDirectory'
import { getCampuses, getCounts, getLatestPosts, getListingCourses, getSchools, getStaff, getTestimonials } from './data'
import { findCampus, findSchool, pageMatchesCampus } from './matching'
import type { Contact, HeroProps } from './pageParts'

// The data-driven page templates (05 §4.4), one component per template. A hardcoded route file renders one of these with its
// title, path, hero and its own JSX content as children; the component loads what the template needs from the CMS (courses,
// lookups, staff, posts) and hands everything to a pure view.

export type TemplatePage = { title: string; path: string; hero: HeroProps; children?: ReactNode }

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const contact: Contact = { phone: site.phone, email: site.email }
const defaultFormKey = site.defaultFormKey || 'quick-enquiry'

async function loadEvents(): Promise<EventRow[]> {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'events', where: { startsAt: { greater_than_equal: new Date().toISOString() } }, sort: 'startsAt', limit: 6, depth: 0,
      select: { title: true, startsAt: true, venue: true, joinUrl: true },
    })
    return docs.map((e) => ({ id: e.id, title: e.title, startsAt: e.startsAt, venue: e.venue ?? null, joinUrl: e.joinUrl ?? null }))
  } catch {
    return []
  }
}

async function loadMicroCourse(slug: string, title: string): Promise<Course | null> {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'courses',
      where: { and: [{ _status: { equals: 'published' } }, { or: [{ slug: { equals: slug } }, { title: { like: title } }] }] },
      depth: 1, limit: 1,
    })
    return (docs[0] as Course | undefined) ?? null
  } catch {
    return null
  }
}

async function hasIntakeDates(): Promise<boolean> {
  try {
    const [y0, m0] = portalToday().split('-').map(Number)
    const results = await Promise.all(Array.from({ length: 12 }, (_, i) => getIntakeCalendar(y0 + Math.floor((m0 - 1 + i) / 12), ((m0 - 1 + i) % 12) + 1, null)))
    return results.some((r) => !r.unavailable && r.data.length > 0)
  } catch {
    return false
  }
}

/** `/<campus-slug>/` detail pages, matched by title/path to the campus lookup. */
async function campusPaths(): Promise<Record<string, string>> {
  const campuses = await getCampuses()
  const pages = pagesByTemplate('campus')
  return Object.fromEntries(campuses.flatMap((c) => { const p = pages.find((x) => pageMatchesCampus(x, c)); return p ? [[c.slug, p.path]] : [] }))
}

type HomeExtras = Pick<HomeData, 'latest' | 'featuredLimit' | 'video' | 'highlights' | 'courseTabs' | 'afterCourses' | 'whatsOn' | 'acknowledgement'>

/** Up to `n` upcoming events (CMS `events`) for the home "What's on". */
async function upcomingEvents(n: number): Promise<HomeData['events']> {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'events', where: { startsAt: { greater_than_equal: new Date().toISOString() } }, sort: 'startsAt', limit: n, depth: 0,
      select: { title: true, startsAt: true, timeText: true, joinUrl: true },
    })
    return docs.map((e) => ({ id: e.id, title: e.title, startsAt: e.startsAt, timeText: e.timeText ?? null, joinUrl: e.joinUrl ?? null }))
  } catch {
    return []
  }
}

export async function HomePage({ hero, stats, children, ...extras }: { title?: string; path?: string; hero?: HeroProps | HeroProps[]; stats?: AnyBlock; children?: ReactNode } & HomeExtras) {
  const [courses, schools, campuses, testimonials, posts, counts, events] = await Promise.all([
    getListingCourses(), getSchools(), getCampuses(), getTestimonials(6).catch(() => []), getLatestPosts(3), getCounts(), extras.whatsOn ? upcomingEvents(4) : Promise.resolve([]),
  ])
  return (
    <>
      <OrganizationJsonLd sameAs={footer.social.map((s) => s.href)} />
      <HomeView hero={hero} stats={stats} header={{ primaryCta: nav.primaryCta }} courses={courses} schools={schools} campuses={campuses} testimonials={testimonials} posts={posts} counts={counts} events={events} {...extras}>
        {children}
      </HomeView>
    </>
  )
}

/**
 * A school page (`/school-of-nursing/` …): the page's own content, then the school's courses and staff from the CMS. The school is
 * the `categories` lookup whose slug is `school`, else the one whose name or slug matches the page (`findSchool`). Its courses are
 * the published courses whose `school` is that lookup; its staff are the people the `staff` collection links to the school or to
 * one of those courses.
 */
export async function SchoolPage({ title, path, hero, children, school: slug }: TemplatePage & { school?: string }) {
  const [schools, courses] = await Promise.all([getSchools(), getListingCourses()])
  const school = (slug ? schools.find((s) => s.slug === slug) : undefined) ?? findSchool({ title, path }, schools)
  const courseIds = school ? courses.filter((c) => c.school?.slug === school.slug).map((c) => c.id) : []
  const staff = school ? await getStaff(school.id, courseIds).catch(() => []) : []
  return <SchoolView title={title} hero={hero} school={school} courses={courses} staff={staff}>{children}</SchoolView>
}

export async function CampusPage({ title, path, hero, children, formKey = defaultFormKey }: TemplatePage & { formKey?: string }) {
  const [campuses, courses] = await Promise.all([getCampuses(), getListingCourses()])
  const campus = findCampus({ title, path }, campuses)
  return (
    <CampusView title={title} hero={hero} campus={campus} contacts={campus ? (campusContacts[campus.slug] ?? []) : []} courses={courses} contact={contact} formKey={formKey}>
      {children}
    </CampusView>
  )
}

export async function CampusListingPage({ hero, children }: TemplatePage) {
  const [campuses, paths] = await Promise.all([getCampuses(), campusPaths()])
  const cards = campuses.map((campus) => ({ campus, contacts: campusContacts[campus.slug] ?? [], path: paths[campus.slug] ?? null }))
  return <CampusListingView hero={hero} cards={cards}>{children}</CampusListingView>
}

export async function CalendarPage({ hero, children }: TemplatePage) {
  return <CalendarView hero={hero} hasDates={await hasIntakeDates()}>{children}</CalendarView>
}

export async function ContactPage({ title, hero, children, formKey = defaultFormKey, ownForm }: TemplatePage & { formKey?: string; ownForm?: boolean }) {
  const [campuses, paths] = await Promise.all([getCampuses(), campusPaths()])
  return <ContactView title={title} hero={hero} campuses={campuses} campusPaths={paths} formKey={formKey} ownForm={ownForm}>{children}</ContactView>
}

export async function StaffDirectoryPage({ hero, children }: TemplatePage) {
  return <StaffDirectoryView hero={hero} staff={await getStaff()}>{children}</StaffDirectoryView>
}

export async function MicroCredentialPage({ title, slug, hero, children }: TemplatePage & { slug: string }) {
  const course = await loadMicroCourse(slug, title)
  return <MicroCredentialView hero={hero} course={course} contact={contact} empty={!children}>{children}</MicroCredentialView>
}

export async function MicroCredentialsHubPage({ path, hero, children }: TemplatePage) {
  const items = pagesByTemplate('microCredential').filter((m) => m.path.startsWith(path) && m.path !== path)
  return <MicroCredentialsHubView hero={hero} items={items} contact={contact} empty={!children}>{children}</MicroCredentialsHubView>
}

export async function EventsPage({ hero, children, ownForm }: TemplatePage & { ownForm?: boolean }) {
  const [posts, events] = await Promise.all([getLatestPosts(6), loadEvents()])
  return <EventsListingView hero={hero} posts={posts} events={events} ownForm={ownForm}>{children}</EventsListingView>
}

/** Old "landing" pages at a normal URL (e.g. /bachelor-of-nursing/): the content plus courses whose title matches. */
export async function LandingSectionPage({ title, hero, children }: TemplatePage) {
  const courses = (await getListingCourses()).filter((c) => norm(title).includes(norm(c.title)) || norm(c.title).includes(norm(title))).slice(0, 6)
  return <LandingView title={title} hero={hero} courses={courses}>{children}</LandingView>
}

export async function AlumniHubPage({ title, hero, children, ownForms }: TemplatePage & { ownForms?: string[] }) {
  return <AlumniHubView title={title} hero={hero} ownForms={ownForms} empty={!children}>{children}</AlumniHubView>
}
