import type { GlobalConfig } from 'payload'
import { anyone, roles, staffOnly } from '@/lib/access'
import { layoutField } from '@/collections/shared/fields'
import { revalidateGlobalAfterChange } from '@/collections/shared/hooks'

// DEC-22: the section every course page shares is stored once here.
// CourseDetail renders `layout` after a course's own blocks and `stats` as a band before the enquiry form, so marketing edits both in one
// place. An empty `stats` renders no band.
export const CourseShared: GlobalConfig = {
  slug: 'courseShared',
  label: 'Shared course section',
  admin: { group: 'Settings', description: 'Rendered at the end of every course page.' },
  versions: { drafts: { autosave: { interval: 1500 }, schedulePublish: true }, max: 25 },
  access: { read: anyone, update: roles('marketing'), readVersions: staffOnly },
  hooks: { afterChange: [revalidateGlobalAfterChange('courseShared', ['collection:courses', 'courses'])] },
  fields: [
    layoutField(),
    {
      name: 'stats', type: 'array', label: 'Stats band', maxRows: 6,
      labels: { singular: 'Figure', plural: 'Figures' },
      admin: { description: 'Figures shown as a band on every course page, above the enquiry form. Leave empty for no band.' },
      fields: [
        { name: 'value', type: 'text', required: true, admin: { description: 'e.g. 300+, 35,000+' } },
        { name: 'label', type: 'text', required: true },
      ],
    },
  ],
}
