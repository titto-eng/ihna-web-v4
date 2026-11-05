import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from '@/components/blocks/MediaImage'
import type {
  AccordionBlock, AdmissionsPanelBlock, BrochureDownloadBlock, CardGridBlock, CensusDatesBlock, CourseFactsBlock, CourseManagersBlock, CtaBlock,
  CurriculumBlock, EnquiryFormBlock, FeesTableBlock, GalleryBlock, HeroBlock, IframeEmbedBlock, ImageTextBlock, IntakeCalendarBlock, LogoStripBlock,
  MapEmbedBlock, PathwaysBlock, RelatedCoursesBlock, StartDatesBlock, StatsBlock, StepsBlock, TableBlock, TabsBlock, TeamGridBlock, TestimonialsBlock,
  VideoEmbedBlock,
} from '@/payload-types'
import { AccordionClient } from '@/blocks/accordion/AccordionClient'
import { ImageTextView } from '@/blocks/imageText/Component'
import { TabsClient } from '@/blocks/tabs/TabsClient'
import type { SectionProps } from '@/blocks/sectionFields'
import type { HeroLook } from '@/blocks/hero/looks'
import { safeJsonLd } from '@/components/blocks/lexicalText'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { Prose, proseClassName } from '@/components/layout/Prose'
import { Section } from '@/components/layout/Section'
import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import { EmptyNotice as EmptyNoticeView } from '@/components/templates/pageParts'
import { site } from '@/content/site'
import { cn } from '@/lib/cn'

// The authoring kit for hardcoded pages (src/app/(site)/**/page.tsx): one component per block, same props as the block's
// fields, rendered by the same block components the courses still use. `depth` > 0 for a block nested in Tabs/Accordion.

export type BlockInput<T> = Omit<T, 'blockType' | 'id' | 'blockName'> & { depth?: number }

function wrap<T extends { blockType: string }>(blockType: T['blockType']) {
  const Block = ({ depth, ...rest }: BlockInput<T>) => <RenderBlocks blocks={[{ blockType, ...rest } as AnyBlock]} ctx={{ depth: depth ?? 0 }} />
  Block.displayName = blockType
  return Block
}

const HeroBlockView = wrap<HeroBlock & { look?: HeroLook }>('hero')
/** The page hero. `look` picks one of the image-hero designs (src/blocks/hero/looks.tsx). */
export const Hero = (props: BlockInput<HeroBlock> & { look?: HeroLook }) => <HeroBlockView {...props} />
export const Cta = wrap<CtaBlock>('cta')
export const CardGrid = wrap<CardGridBlock>('cardGrid')
export const Table = wrap<TableBlock>('table')
export const VideoEmbed = wrap<VideoEmbedBlock>('videoEmbed')
export const IframeEmbed = wrap<IframeEmbedBlock>('iframeEmbed')
export const MapEmbed = wrap<MapEmbedBlock>('mapEmbed')
export const Stats = wrap<StatsBlock>('stats')
export const Steps = wrap<StepsBlock>('steps')
export const Testimonials = wrap<TestimonialsBlock>('testimonials')
export const LogoStrip = wrap<LogoStripBlock>('logoStrip')
export const Gallery = wrap<GalleryBlock>('gallery')
export const TeamGrid = wrap<TeamGridBlock>('teamGrid')
export const Pathways = wrap<PathwaysBlock>('pathways')
export const Curriculum = wrap<CurriculumBlock>('curriculum')
export const AdmissionsPanel = wrap<AdmissionsPanelBlock>('admissionsPanel')
export const EnquiryForm = wrap<EnquiryFormBlock>('enquiryForm')
export const CourseFacts = wrap<CourseFactsBlock>('courseFacts')
export const StartDates = wrap<StartDatesBlock>('startDates')
export const CensusDates = wrap<CensusDatesBlock>('censusDates')
export const FeesTable = wrap<FeesTableBlock>('feesTable')
export const IntakeCalendar = wrap<IntakeCalendarBlock>('intakeCalendar')
export const RelatedCourses = wrap<RelatedCoursesBlock>('relatedCourses')
export const BrochureDownload = wrap<BrochureDownloadBlock>('brochureDownload')
export const CourseManagers = wrap<CourseManagersBlock>('courseManagers')

type SectionInput = SectionProps & { depth?: number }

/** Rich text as plain JSX (`<p>`, `<h2>`, `<ul>`, `<Link>`), styled exactly like the CMS rich text. */
export function Rich({ children, width, tone, spacing, anchorId, depth }: SectionInput & { children: ReactNode; width?: 'prose' | 'wide' }) {
  return (
    <Section tone={tone ?? 'default'} spacing={spacing ?? 'default'} anchorId={anchorId} depth={depth}>
      <div className={cn(proseClassName, width === 'wide' && 'max-w-none')}>{children}</div>
    </Section>
  )
}

/** An image inside `<Rich>`: next/image for pictures, a download link for anything else. */
export function Pic({ src, alt, width, height, mimeType }: { src: string; alt?: string; width?: number; height?: number; mimeType?: string }) {
  if (mimeType && !mimeType.startsWith('image/')) return <a href={src} rel="noopener noreferrer">{alt || 'Download'}</a>
  // small images (logos, badges) keep their own size instead of being stretched to the column width
  // a wide logo file (a brand logo or a logo strip) is shown at the header logo's height, never stretched
  if (/logo|\/brand\//i.test(src) && (width ?? 1200) >= 560) {
    return <Image src={src} alt={alt ?? ''} width={width ?? 1200} height={height ?? 300} sizes="480px" className="h-12 w-auto max-w-full md:h-[52px]" />
  }
  const small = (width ?? 1200) < 560
  return <Image src={src} alt={alt ?? ''} width={width ?? 1200} height={height ?? 800} sizes={small ? `${width}px` : '(min-width: 1024px) 70ch, 100vw'} className={small ? 'h-auto w-auto max-w-full rounded-xl' : 'h-auto w-full rounded-xl'} />
}

export type TabInput = { label: string; anchorId?: string | null; content: ReactNode }

export function Tabs({ tabs, variant = 'underline', tone, spacing, anchorId, depth = 0 }: SectionInput & { tabs: TabInput[]; variant?: TabsBlock['variant'] }) {
  if (!tabs.length) return null
  const entries = tabs.map((t, i) => ({ id: `tab-${i}`, label: t.label, anchorId: t.anchorId, content: t.content }))
  return (
    <Section tone={tone ?? 'default'} spacing={spacing ?? 'default'} anchorId={anchorId} depth={depth}>
      <TabsClient tabs={entries} variant={variant ?? 'underline'} />
    </Section>
  )
}

export type AccordionItemInput = { title: string; content: ReactNode; /** Plain-text answer for the FAQPage JSON-LD. */ text?: string }

export function Accordion({ items, heading, intro, variant = 'faq', tone, spacing, anchorId, depth = 0 }: SectionInput & { items: AccordionItemInput[]; heading?: string | null; intro?: string | null; variant?: AccordionBlock['variant'] }) {
  if (!items.length) return null
  const entries = items.map((it, i) => ({ id: `item-${i}`, title: it.title, content: it.content }))
  const mainEntity = variant !== 'plain' ? items.filter((it) => it.text).map((it) => ({ '@type': 'Question', name: it.title, acceptedAnswer: { '@type': 'Answer', text: it.text } })) : []
  const side = Boolean(heading || intro)
  return (
    <Section tone={tone ?? 'default'} spacing={spacing ?? 'default'} anchorId={anchorId} depth={depth}>
      <div className={cn('grid gap-12', side && depth === 0 && 'lg:grid-cols-[0.8fr_1.2fr]')}>
        {side && (
          <div>
            <SectionHeader heading={heading} className="mb-0" />
            {intro && <p className="mt-6 text-muted-foreground">{intro}</p>}
          </div>
        )}
        <AccordionClient items={entries} />
      </div>
      {mainEntity.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity }) }} />}
    </Section>
  )
}

/** Image beside text; the text is JSX children. */
export function ImageText({ children, depth = 0, ...block }: Omit<BlockInput<ImageTextBlock>, 'content'> & { children: ReactNode }) {
  return <ImageTextView block={{ blockType: 'imageText', ...block } as ImageTextBlock} ctx={{ depth }}>{children}</ImageTextView>
}

/** "This page is being updated" with the site's phone and email. */
export function EmptyNotice({ title }: { title?: string }) {
  return <EmptyNoticeView contact={{ phone: site.phone, email: site.email }} title={title} />
}

export { Link, Prose }
