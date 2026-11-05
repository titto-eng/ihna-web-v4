import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { landingRoutes } from '@/content/landing-routes'
import { ApplicationEmbed, embedCourseId, enquirySource } from './ApplicationEmbed'
import { CampaignCookie } from './CampaignCookie'
import { ThankYou } from './ThankYou'
import { landingMetadata, loadLanding } from './pages'

// The dynamic companions of the hardcoded landing pages (60-landing §4 "Routes"): /lp/<slug>/<campaign>/, /lp/<slug>/{thanks.php,
// thankyou.php,thankyou}, /lp/<slug>/application_form.php, /lp/<slug>/index.php. Each `render*` returns null when the slug is not in
// the registry; the route then 404s. The landing pages themselves are route files under src/app/(site)/lp/<slug>/.

export const lpPath = (slug: string) => `/lp/${slug}/`

/** Campaign codes in the URL: letters, digits, `_` and `-`, 2 to 64 characters (60 §4). */
export const CAMPAIGN_RE = /^[A-Za-z0-9_-]{2,64}$/

/** Segments that are pages of their own; every other second segment is a campaign code. Thank-you handlers keep their `.php` name for GTM. */
export const THANK_YOU_SEGMENTS = ['thanks.php', 'thankyou.php', 'thankyou'] as const
export const RESERVED_SEGMENTS = [...THANK_YOU_SEGMENTS, 'application_form.php', 'index.php'] as const

const siteUrl = (): string => process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// --- thank-you view --------------------------------------------------------------------------------------------------------

/** Old handler URLs: every page serves `thanks.php`; event invites (F9) also `thankyou.php` and `thankyou` (60 §5). */
async function thankYouDoc(path: string, segment: string) {
  const doc = await loadLanding(path)
  if (!doc) return null
  return segment === 'thanks.php' || doc.entry.template === 'EventInvite' ? doc : null
}

export async function thankYouMetadata(path: string, segment: string): Promise<Metadata> {
  const doc = await thankYouDoc(path, segment)
  if (!doc) return {}
  return { title: `Thank you | ${doc.entry.title}`, robots: { index: false, follow: false }, alternates: { canonical: `${siteUrl()}${path}${segment}` } }
}

export async function renderThankYou(path: string, segment: string): Promise<ReactNode | null> {
  const doc = await thankYouDoc(path, segment)
  return doc ? <ThankYou doc={doc} /> : null
}

/**
 * The thank-you view of any registered page at its old handler URL (IHNA: `<page>thanks.php`, `<name>-int-thanks.php` and their
 * extensionless aliases). `url` is the URL being served, used as the canonical. Noindex.
 */
export async function landingThankYouMetadata(pagePath: string, url: string): Promise<Metadata> {
  const doc = await loadLanding(pagePath)
  if (!doc) return {}
  return { title: `Thank you | ${doc.entry.title}`, robots: { index: false, follow: false }, alternates: { canonical: `${siteUrl()}${url}` } }
}

export async function renderLandingThankYou(pagePath: string): Promise<ReactNode> {
  const doc = await loadLanding(pagePath)
  if (!doc) throw new Error(`landing page ${pagePath} is not in src/content/landing.ts`)
  return <ThankYou doc={doc} />
}

/** `<page>/index.php` (self-post pages, old links): 308 to the page with the query kept (60 §4). */
export function redirectIndexPhp(base: string, search: Record<string, string | string[] | undefined>): never {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(search)) for (const x of Array.isArray(v) ? v : v === undefined ? [] : [v]) q.append(k, x)
  const qs = q.toString()
  permanentRedirect(`${base}${qs ? `?${qs}` : ''}`)
}

// --- /lp/<slug>/<campaign-code>/ -------------------------------------------------------------------------------------------

export function campaignMetadata(path: string): Metadata {
  // canonical is the base page; suffix URLs are never indexed (60 §5)
  return landingRoutes[path] ? landingMetadata(path, { noindex: true }) : {}
}

/** Renders the base landing page with the code in the attribution cookie. An unknown slug or a malformed code is a 404. */
export async function renderCampaign(path: string, code: string): Promise<ReactNode | null> {
  const load = landingRoutes[path]
  if (!load) return null
  if (!CAMPAIGN_RE.test(code)) notFound()
  const { default: Page } = await load()
  return (
    <>
      <CampaignCookie code={code} />
      <Page />
    </>
  )
}

// --- application_form.php --------------------------------------------------------------------------------------------------

export async function applicationMetadata(path: string): Promise<Metadata> {
  const doc = await loadLanding(path)
  return doc && embedCourseId(doc.entry) ? { title: `Apply | ${doc.entry.title}`, robots: { index: false, follow: false } } : {}
}

export async function renderApplication(path: string, search: { enquiry_src?: string | string[] }): Promise<ReactNode | null> {
  const doc = await loadLanding(path)
  const courseId = doc ? embedCourseId(doc.entry) : null
  if (!doc || !courseId) return null
  const src = Array.isArray(search.enquiry_src) ? search.enquiry_src[0] : search.enquiry_src
  return <ApplicationEmbed doc={doc} courseId={courseId} source={enquirySource(src)} />
}
