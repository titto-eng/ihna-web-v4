import type { CollectionConfig, Field } from 'payload'
import { fieldRoles, isAdmin, publishedOrStaff, roles, staffOnly } from '@/lib/access'
import { courseUrl } from '@/lib/paths'
import { previewUrl } from '@/lib/preview-url'
import { FACT_KEYS, FACT_LABELS, type FactKey } from '@/components/course/facts'
import { importGroup, layoutField, lockFields, pathField, seoExtras, slugField } from './shared/fields'
import { assertPathFree, contentHooks, validateEmbedHosts } from './shared/hooks'

const rel = (name: string, relationTo: string, hasMany = true): Field =>
  ({ name, type: 'relationship', relationTo, hasMany } as Field)

// Key facts strip under the hero (`CourseFacts`, src/components/course/CourseFacts.tsx). One sub-group per fact:
// `show` switches it off, `value`/`detail` override the fallback from the course's own fields.
const FACT_HINTS: Record<FactKey, string> = {
  duration: 'Blank = the Durations lookup.', units: 'Blank = the Units number ("24 units").', delivery: 'Blank = the Delivery modes lookup.',
  level: 'Blank = the Levels lookup.', campuses: 'Blank = the campus names.', cricos: 'Blank = the CRICOS code field.',
  fee: 'Blank = Fees > display amount (detail: Fees > note).',
}
const marketingOnly = { create: fieldRoles('marketing'), update: fieldRoles('marketing') }
const financeOnly = { create: fieldRoles('finance'), update: fieldRoles('finance') }
const marketingOrFinance = { create: fieldRoles('marketing', 'finance'), update: fieldRoles('marketing', 'finance') }
const factGroup = (key: FactKey): Field => ({
  name: key,
  type: 'group',
  label: FACT_LABELS[key],
  admin: { description: FACT_HINTS[key] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'show', type: 'checkbox', defaultValue: true, admin: { width: '15%' }, access: marketingOnly },
        // The fee fact is money: finance owns its text, like `fees` (90-security §2); marketing still controls `show`.
        { name: 'value', type: 'text', admin: { width: '35%', placeholder: 'e.g. 3 years full-time' }, access: key === 'fee' ? financeOnly : marketingOnly },
        { name: 'detail', type: 'text', admin: { width: '50%', placeholder: 'e.g. or part-time equivalent' }, access: key === 'fee' ? financeOnly : marketingOnly },
      ],
    },
  ],
})
const keyFacts = (): Field => ({
  type: 'collapsible',
  label: 'Key facts',
  admin: { initCollapsed: false, description: 'The facts strip under the course hero. Untick "show" to hide a fact on this course.' },
  fields: [
    // The groups admit both roles so finance can reach the fee text; every sub-field then narrows to one role.
    { name: 'facts', type: 'group', label: 'Key facts', access: marketingOrFinance, fields: FACT_KEYS.map(factGroup) },
    {
      name: 'factsInternational',
      type: 'group',
      label: 'Key facts: international audience',
      access: marketingOrFinance,
      admin: {
        condition: (data) => data?.studentType === 'both',
        description: 'Used when the page shows the international audience. A fact left blank (and still shown) uses the facts above.',
      },
      fields: FACT_KEYS.map(factGroup),
    },
  ],
})

// Everything except `fees` is marketing-only; `fees` is finance-only (90-security §2).
const content: Field[] = [
  { name: 'title', type: 'text', required: true },
  slugField({ required: true, unique: true }),
  pathField(),
  {
    type: 'row',
    fields: [
      { name: 'code', type: 'text', index: true },
      { name: 'cricosCode', type: 'text' },
      { name: 'courseStatus', type: 'text', admin: { description: 'As in the old course record (e.g. current, teach-out).' } },
    ],
  },
  {
    type: 'row',
    fields: [
      { name: 'studentType', type: 'select', options: ['domestic', 'international', 'both'], defaultValue: 'both' },
      { name: 'courseType', type: 'select', options: [{ label: 'Award', value: 'award' }, { label: 'Non-award', value: 'non-award' }], defaultValue: 'award' },
    ],
  },
  keyFacts(),
  {
    type: 'row',
    fields: [
      { name: 'khId', type: 'number', index: true, admin: { description: 'Portal course id (DEC-8). Dates, census dates and intakes are read from the portal by this id.' } },
      { name: 'khIdSource', type: 'select', options: ['dump', 'scrape'], admin: { readOnly: true } },
    ],
  },
  { name: 'showStartDates', type: 'checkbox', defaultValue: false, admin: { description: 'DEC-7: render the StartDates block. Off = CourseDetail shows census dates only.' } },
  { ...rel('school', 'categories', false), required: true, admin: { description: 'The school that owns the course.' } } as Field,
  rel('categories', 'categories'),
  rel('disciplines', 'disciplines'),
  rel('levels', 'levels'),
  rel('campuses', 'campuses'),
  rel('deliveryModes', 'deliveryModes'),
  rel('durations', 'durations'),
  rel('universities', 'universities'),
  { ...rel('relatedCourses', 'courses'), filterOptions: ({ id }: { id?: number | string | null }) => (id ? { id: { not_equals: id } } : true) } as Field,
  { name: 'heroImage', type: 'upload', relationTo: 'media' },
  { name: 'excerpt', type: 'textarea' },
  { name: 'accreditation', type: 'text' },
  { name: 'units', type: 'number' },
  { name: 'applyLink', type: 'text' },
  // DEC-69: the brochure is a `documents` row (category brochure) served at its `publicPath`; `brochureUrl` is the legacy fallback.
  // Read it through `brochureHrefFor` / `hasBrochure` (src/lib/courses/brochure.ts), never the fields directly.
  {
    ...rel('brochure', 'documents', false),
    filterOptions: () => ({ category: { in: ['brochure'] } }),
    admin: { description: 'The course brochure PDF, picked from Documents with category "brochure". A new brochure is a document with that category; replacing its file keeps the URL.' },
  } as Field,
  {
    name: 'brochureUrl',
    type: 'text',
    admin: { condition: (data) => !data?.brochure, description: 'Legacy. Prefer the Brochure document.' },
  },
  { name: 'handbookUrl', type: 'text' },
  { name: 'hubspotCourseId', type: 'text' },
  { name: 'dynamicsCourseOption', type: 'text' },
  { name: 'splId', type: 'text' },
  { name: 'featured', type: 'checkbox', defaultValue: false, index: true },
  { name: 'featuredOrder', type: 'number' },
  {
    name: 'sections',
    type: 'array',
    labels: { singular: 'Section', plural: 'Sections' },
    admin: { description: 'One section per slot. CourseDetail renders them in slot order.' },
    validate: (rows: unknown) => {
      const slots = ((rows as { slot?: string }[] | null | undefined) ?? []).map((r) => r.slot)
      return new Set(slots).size === slots.length || 'Each slot may be used once per course.'
    },
    fields: [
      { name: 'slot', type: 'select', required: true, options: ['overview', 'entry', 'structure', 'careers', 'placements', 'pathways', 'faq', 'fees', 'additional'] },
      { name: 'title', type: 'text' },
      layoutField(),
    ],
  },
  seoExtras(),
  importGroup(),
]

// Fees: finance and admin only. Visible on the public page, so read stays open.
const fees: Field = {
  name: 'fees',
  type: 'group',
  access: { create: fieldRoles('finance'), update: fieldRoles('finance') },
  admin: { description: 'Finance and admin only.' },
  fields: [
    { name: 'displayAmount', type: 'text', admin: { description: 'As shown on the site, e.g. "$31,500 per year".' } },
    { name: 'note', type: 'textarea' },
  ],
}

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'code', 'studentType', 'featured', '_status', 'import.reviewStatus', 'updatedAt'],
    group: 'Content',
    livePreview: { url: ({ data }) => previewUrl(data?.path ?? '/courses/') },
  },
  versions: { drafts: { autosave: { interval: 1500 }, schedulePublish: true }, maxPerDoc: 25 },
  access: {
    read: publishedOrStaff,
    create: roles('marketing'),
    update: roles('marketing', 'finance'), // finance reaches `fees` only: every other field is locked below
    delete: isAdmin,
    readVersions: staffOnly,
  },
  hooks: {
    beforeValidate: [
      validateEmbedHosts('courses', 'sections'), // DEC-29: iframe hosts inside sections[].layout
      async ({ data, req, originalDoc }) => {
        if (!data) return data
        const slug = String(data.slug ?? originalDoc?.slug ?? '').trim()
        if (!slug) return data
        const path = courseUrl(slug)
        await assertPathFree({ req, collection: 'courses', path, id: originalDoc?.id })
        data.path = path
        return data
      },
    ],
    ...contentHooks('courses', { docTags: (d) => [`course:${d.slug}`] }),
  },
  fields: [...lockFields(content, fieldRoles('marketing')), fees],
}
