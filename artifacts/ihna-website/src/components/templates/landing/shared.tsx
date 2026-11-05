import type { ReactNode } from 'react'
import type { Campus, Course } from '@/payload-types'
import { EnquiryFormClient } from '@/components/forms/EnquiryFormClient'
import { Section } from '@/components/layout/Section'
import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getFormView } from '@/lib/enquiries/formView'
import type { LandingEntry } from '@/content/landing'
import { cn } from '@/lib/cn'
import type { BlockCtx } from '@/blocks/types'
import type { HeroProps } from '../pageParts'

// Pieces the five landing templates share (60-landing §4). A template is a fixed slot order; the route file fills the slots with JSX
// (`lead`, `body`, `trail`) and gives the hero as props. The form is never part of the content: it is the `enquiryForm{formKey}` block
// each template places itself, unless the page carries its own (`ownForm`).

export const FORM_ANCHOR = 'enquiry' // sticky sidebar form (lg and up)
export const FORM_END_ANCHOR = 'enquiry-end' // inline form after the content, the target of every "Enquire now" button

/** What a landing template receives: the registry row, its CMS relations, the hero and the JSX slots. */
export type LandingDoc = { entry: LandingEntry; course: Course | null; campus: Campus | null }
export type LandingSlots = { hero: HeroProps; lead?: ReactNode; body?: ReactNode; trail?: ReactNode; ownForm?: boolean; /** Block types the page provides itself (startDates, brochureDownload), so the template adds none. */ has?: string[] }
export type LandingProps = { doc: LandingDoc } & LandingSlots

const ctxFor = (doc: LandingDoc, depth = 0): BlockCtx => ({ depth, course: doc.course ?? undefined })

export const landingCtx = (doc: LandingDoc) => ctxFor(doc, 0)
export const nestedCtx = (doc: LandingDoc) => ctxFor(doc, 1)

/** The hero block for a template: variant fixed by the template, one "Enquire now" button when the page has none. */
export function heroBlock(hero: HeroProps, opts: { variant: 'split' | 'compact' | 'full'; eyebrow?: string | null }): AnyBlock {
  const hasImage = Boolean(hero.image && typeof hero.image === 'object')
  // BON's split hero is sized for short headings; landing headlines run long, so those use the compact hero
  const long = String(hero.heading ?? '').length > 48
  const variant = opts.variant === 'full' && !hasImage ? 'compact' : opts.variant === 'split' && (!hasImage || long) ? 'compact' : opts.variant
  return {
    ...hero,
    blockType: 'hero',
    variant,
    eyebrow: hero.eyebrow || opts.eyebrow || undefined,
    audienceSwitch: false,
    ctas: hero.ctas?.length ? hero.ctas : [{ label: 'Enquire now', href: `#${FORM_END_ANCHOR}`, style: 'primary' }],
  } as AnyBlock
}

export function formBlock(doc: LandingDoc, o: FormOpts): AnyBlock {
  return { blockType: 'enquiryForm', formKey: doc.entry.formKey, variant: o.variant, anchorId: o.anchorId, heading: o.heading, tone: o.tone ?? 'muted', spacing: o.spacing ?? 'default' } as AnyBlock
}

type FormOpts = { variant: 'card' | 'inline' | 'sidebar'; anchorId: string; heading?: string; tone?: 'default' | 'muted' | 'card'; spacing?: 'none' | 'default' }

/**
 * The page's enquiry form. A row with `formFields` shows only those fields of its form, and `fieldOptions` narrows a select's options
 * (the definition keeps the superset and the server validates against it); otherwise it is the ordinary `enquiryForm` block.
 */
export async function LandingForm({ doc, depth = 0, ...o }: { doc: LandingDoc; depth?: number } & FormOpts) {
  const only = doc.entry.formFields
  const narrow = doc.entry.fieldOptions
  if (!only?.length && !narrow) return <RenderBlocks blocks={[formBlock(doc, o)]} ctx={depth ? nestedCtx(doc) : landingCtx(doc)} />
  const view = await getFormView(doc.entry.formKey)
  if (!view) return null
  const fields = view.def.fields
    .filter((f) => !only?.length || only.includes(f.name) || f.type === 'hidden')
    .map((f) => (narrow?.[f.name] && f.options ? { ...f, options: f.options.filter((x) => narrow[f.name].includes(x.value)) } : f))
  const def = { ...view.def, fields }
  return (
    <Section tone={o.tone ?? 'muted'} spacing={o.spacing ?? 'default'} anchorId={o.anchorId} depth={depth}>
      <Card className={o.variant === 'sidebar' ? 'mx-auto max-w-md bg-card py-0' : 'mx-auto max-w-3xl bg-card py-0'} data-form-key={doc.entry.formKey}>
        <CardContent className="relative p-8 md:p-12">
          <EnquiryFormClient def={def} heading={o.heading} campuses={view.campuses} courses={view.courses} presetCourseId={doc.course ? String(doc.course.id) : null} layout={o.variant} />
        </CardContent>
      </Card>
    </Section>
  )
}

/** Body column with the sticky enquiry form beside it on lg+. Content renders nested (no bands), as in CourseDetail. */
export function BodyWithForm({ doc, children, heading = 'Enquire now' }: { doc: LandingDoc; children?: ReactNode; heading?: string }) {
  if (!children) return null
  return (
    <Section spacing="default">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="min-w-0 space-y-6" data-landing-slot="body">
          {children}
        </div>
        <aside className="hidden lg:sticky lg:top-24 lg:block" data-landing-slot="form" aria-label="Enquiry form">
          <LandingForm doc={doc} depth={1} variant="sidebar" anchorId={FORM_ANCHOR} heading={heading} spacing="none" />
        </aside>
      </div>
    </Section>
  )
}

/** Fixed bar on small screens: one button that scrolls to the inline form. */
export function StickyEnquiryCta({ label = 'Enquire now' }: { label?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden" data-landing-slot="sticky-cta">
      <Button asChild className="w-full" size="lg">
        <a href={`#${FORM_END_ANCHOR}`}>{label}</a>
      </Button>
    </div>
  )
}

export function LandingArticle({ doc, template, children, className }: { doc: LandingDoc; template: string; children: ReactNode; className?: string }) {
  return (
    <article className={cn('pb-20 lg:pb-0', className)} data-landing={template} data-landing-path={doc.entry.path}>
      {children}
    </article>
  )
}
