import type { Block } from 'payload'
import type { ComponentType } from 'react'
import type { BlockCtx } from './types'
import { HeroBlock } from './hero/config'
import { RichTextBlock } from './richText/config'
import { ImageTextBlock } from './imageText/config'
import { StatsBlock } from './stats/config'
import { CardGridBlock } from './cardGrid/config'
import { AccordionBlock } from './accordion/config'
import { TabsBlock } from './tabs/config'
import { TableBlock } from './table/config'
import { CtaBlock } from './cta/config'
import { TestimonialsBlock } from './testimonials/config'
import { LogoStripBlock } from './logoStrip/config'
import { VideoEmbedBlock } from './videoEmbed/config'
import { IframeEmbedBlock } from './iframeEmbed/config'
import { MapEmbedBlock } from './mapEmbed/config'
import { TeamGridBlock } from './teamGrid/config'
import { GalleryBlock } from './gallery/config'
import { StepsBlock } from './steps/config'
import { PathwaysBlock } from './pathways/config'
import { CurriculumBlock } from './curriculum/config'
import { AdmissionsPanelBlock } from './admissionsPanel/config'
import { EnquiryFormBlock } from './enquiryForm/config'
import { CourseFactsBlock } from './courseFacts/config'
import { StartDatesBlock } from './startDates/config'
import { CensusDatesBlock } from './censusDates/config'
import { FeesTableBlock } from './feesTable/config'
import { IntakeCalendarBlock } from './intakeCalendar/config'
import { RelatedCoursesBlock } from './relatedCourses/config'
import { BrochureDownloadBlock } from './brochureDownload/config'
import { CourseManagersBlock } from './courseManagers/config'

// Registry (20-blocks "Registry"). Add a block here and nowhere else: config for Payload, component for the renderer.
// `blockComponents` is a Record over the slugs of `configs`, so a config without a component fails tsc.
const configs = {
  hero: HeroBlock,
  richText: RichTextBlock,
  imageText: ImageTextBlock,
  stats: StatsBlock,
  cardGrid: CardGridBlock,
  accordion: AccordionBlock,
  tabs: TabsBlock,
  table: TableBlock,
  cta: CtaBlock,
  testimonials: TestimonialsBlock,
  logoStrip: LogoStripBlock,
  videoEmbed: VideoEmbedBlock,
  iframeEmbed: IframeEmbedBlock,
  mapEmbed: MapEmbedBlock,
  teamGrid: TeamGridBlock,
  gallery: GalleryBlock,
  steps: StepsBlock,
  pathways: PathwaysBlock,
  curriculum: CurriculumBlock,
  admissionsPanel: AdmissionsPanelBlock,
  enquiryForm: EnquiryFormBlock,
  courseFacts: CourseFactsBlock,
  startDates: StartDatesBlock,
  censusDates: CensusDatesBlock,
  feesTable: FeesTableBlock,
  intakeCalendar: IntakeCalendarBlock,
  relatedCourses: RelatedCoursesBlock,
  brochureDownload: BrochureDownloadBlock,
  courseManagers: CourseManagersBlock,
} as const satisfies Record<string, Block>

export type BlockSlug = keyof typeof configs

export const blockConfigs: Block[] = Object.values(configs)

type Loader = () => Promise<ComponentType<{ block: never; ctx?: BlockCtx }>>
const lazy = (load: () => Promise<unknown>) => load as unknown as Loader

// Components are resolved lazily to keep server/client boundaries clean.
export const blockComponents: Record<BlockSlug, Loader> = {
  hero: lazy(() => import('./hero/Component').then((m) => m.Hero)),
  richText: lazy(() => import('./richText/Component').then((m) => m.RichText)),
  imageText: lazy(() => import('./imageText/Component').then((m) => m.ImageText)),
  stats: lazy(() => import('./stats/Component').then((m) => m.Stats)),
  cardGrid: lazy(() => import('./cardGrid/Component').then((m) => m.CardGrid)),
  accordion: lazy(() => import('./accordion/Component').then((m) => m.Accordion)),
  tabs: lazy(() => import('./tabs/Component').then((m) => m.Tabs)),
  table: lazy(() => import('./table/Component').then((m) => m.TableBlockView)),
  cta: lazy(() => import('./cta/Component').then((m) => m.Cta)),
  testimonials: lazy(() => import('./testimonials/Component').then((m) => m.Testimonials)),
  logoStrip: lazy(() => import('./logoStrip/Component').then((m) => m.LogoStrip)),
  videoEmbed: lazy(() => import('./videoEmbed/Component').then((m) => m.VideoEmbed)),
  iframeEmbed: lazy(() => import('./iframeEmbed/Component').then((m) => m.IframeEmbed)),
  mapEmbed: lazy(() => import('./mapEmbed/Component').then((m) => m.MapEmbed)),
  teamGrid: lazy(() => import('./teamGrid/Component').then((m) => m.TeamGrid)),
  gallery: lazy(() => import('./gallery/Component').then((m) => m.Gallery)),
  steps: lazy(() => import('./steps/Component').then((m) => m.Steps)),
  pathways: lazy(() => import('./pathways/Component').then((m) => m.Pathways)),
  curriculum: lazy(() => import('./curriculum/Component').then((m) => m.Curriculum)),
  admissionsPanel: lazy(() => import('./admissionsPanel/Component').then((m) => m.AdmissionsPanel)),
  enquiryForm: lazy(() => import('./enquiryForm/Component').then((m) => m.EnquiryForm)),
  courseFacts: lazy(() => import('./courseFacts/Component').then((m) => m.CourseFacts)),
  startDates: lazy(() => import('./startDates/Component').then((m) => m.StartDates)),
  censusDates: lazy(() => import('./censusDates/Component').then((m) => m.CensusDates)),
  feesTable: lazy(() => import('./feesTable/Component').then((m) => m.FeesTable)),
  intakeCalendar: lazy(() => import('./intakeCalendar/Component').then((m) => m.IntakeCalendar)),
  relatedCourses: lazy(() => import('./relatedCourses/Component').then((m) => m.RelatedCourses)),
  brochureDownload: lazy(() => import('./brochureDownload/Component').then((m) => m.BrochureDownload)),
  courseManagers: lazy(() => import('./courseManagers/Component').then((m) => m.CourseManagers)),
}
