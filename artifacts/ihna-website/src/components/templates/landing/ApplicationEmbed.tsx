import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { IframeEmbedView } from '@/blocks/iframeEmbed/Component'
import type { LandingEntry } from '@/content/landing'
import { site } from '@/content/site'
import { LandingArticle, type LandingDoc } from './shared'

// `/lp/<slug>/application_form.php` (60 §5, DEC-55): the old wrapper was a bare iframe of the student portal's auto-enrol form. The iframe URL is
// built here from the portal origin and the portal course id kept in the landing registry; no URL is stored or taken from the visitor.
const DEFAULT_ORIGIN = site.studentPortalOrigin

export function portalOrigin(): string {
  const raw = process.env.STUDENT_PORTAL_EMBED_ORIGIN?.trim()
  try {
    const u = new URL(raw || DEFAULT_ORIGIN)
    return u.protocol === 'https:' ? u.origin : DEFAULT_ORIGIN
  } catch {
    return DEFAULT_ORIGIN
  }
}

export function embedCourseId(entry: LandingEntry): number | null {
  const id = entry.applicationCourseId
  return typeof id === 'number' && Number.isInteger(id) && id > 0 ? id : null
}

/** `enqiry_src` (sic, the portal's parameter): digits only, as the old wrapper defaulted to 540. */
export const enquirySource = (raw: string | undefined): string => (raw && /^\d{1,6}$/.test(raw) ? raw : '540')

export function ApplicationEmbed({ doc, courseId, source }: { doc: LandingDoc; courseId: number; source: string }) {
  const origin = portalOrigin()
  const url = `${origin}/CrmEnquiries/application_form_auto_enrol?course_id=${courseId}&enqiry_src=${source}`
  const hero = { blockType: 'hero', variant: 'compact', eyebrow: doc.entry.title, heading: 'Apply *now*' } as AnyBlock
  return (
    <LandingArticle doc={doc} template="ApplicationEmbed" className="pb-0">
      <RenderBlocks blocks={[hero]} />
      <IframeEmbedView block={{ blockType: 'iframeEmbed', url, title: `Application form: ${doc.entry.title}`, height: 970 } as never} allowedHosts={[new URL(origin).hostname]} />
    </LandingArticle>
  )
}
