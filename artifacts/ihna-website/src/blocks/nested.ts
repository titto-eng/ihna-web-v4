import type { BlockSlug } from 'payload'

// Child block slugs for `blockReferences` (DEC-6, 20-blocks "Nesting"). Blocks are defined once at config level
// (payload.config.ts `blocks: blockConfigs`), so these are slugs only: no config imports, no cycles.
export const courseDataSlugs: BlockSlug[] = [
  'courseFacts', 'startDates', 'censusDates', 'feesTable', 'intakeCalendar', 'relatedCourses', 'brochureDownload', 'courseManagers',
]

// accordion children: richText, imageText, table, embeds, cta, cardGrid, steps and course data (never tabs / accordion).
export const accordionChildren: BlockSlug[] = [
  'richText', 'imageText', 'table', 'videoEmbed', 'iframeEmbed', 'mapEmbed', 'cta', 'cardGrid', 'steps', ...courseDataSlugs,
]

// tabs children: every block except hero and tabs.
export const tabsChildren: BlockSlug[] = [
  ...accordionChildren, 'accordion', 'stats', 'testimonials', 'logoStrip', 'teamGrid', 'gallery',
  'pathways', 'curriculum', 'admissionsPanel', 'enquiryForm',
]
