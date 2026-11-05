import type { ArrayField, CollectionConfig, Field } from 'payload'
import { isAdmin, publishedOrStaff, roles, staffField, staffOnly } from '@/lib/access'
import { slugField } from './shared/fields'
import { revalidateHooks } from './shared/hooks'

const profileList = (name: string, keys: readonly string[], dbName: string): ArrayField => ({
  name,
  type: 'array',
  dbName,
  admin: { initCollapsed: true },
  fields: keys.map((k): Field => (k === 'description' || k === 'detail' ? { name: k, type: 'textarea' } : { name: k, type: 'text' })),
})

export const Staff: CollectionConfig = {
  slug: 'staff',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'position', 'school', 'active', 'sortOrder'], group: 'Content' },
  versions: { drafts: { autosave: { interval: 1500 }, schedulePublish: true }, maxPerDoc: 25 },
  defaultSort: 'sortOrder',
  access: {
    read: publishedOrStaff,
    create: roles('marketing'),
    update: roles('marketing'),
    delete: isAdmin,
    readVersions: staffOnly,
  },
  hooks: revalidateHooks('staff', { docTags: (d) => [`staff:${d.slug}`] }),
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField({ from: 'name', unique: true }),
    { name: 'position', type: 'text' },
    { name: 'postNominals', type: 'text', admin: { description: 'Qualifications line shown under the name.' } },
    { name: 'school', type: 'relationship', relationTo: 'categories' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea' },
    {
      // Open question (10 §10 Q3): are staff emails public? Until Allen decides, only staff read it via the API.
      name: 'email', type: 'email',
      access: { read: staffField },
      admin: { description: 'Not exposed publicly until the privacy question is settled.' },
    },
    { type: 'row', fields: [{ name: 'linkedin', type: 'text' }, { name: 'googleScholar', type: 'text' }, { name: 'orcid', type: 'text' }] },
    // Profile tabs (30-import §7.2 step 4): the old pages rendered these client-side from inline script arrays.
    profileList('research', ['category', 'title', 'authors', 'year', 'journal', 'description', 'viewLink', 'articleLink', 'link'], 'staff_research'),
    profileList('grants', ['title', 'amount', 'year', 'description'], 'staff_grants'),
    profileList('activities', ['category', 'title', 'detail', 'year'], 'staff_activities'),
    profileList('supervision', ['role', 'title', 'institution', 'year'], 'staff_supervision'),
    { name: 'active', type: 'checkbox', defaultValue: true, index: true, admin: { position: 'sidebar' } },
    { name: 'sortOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'courses', type: 'relationship', relationTo: 'courses', hasMany: true, admin: { description: 'Courses this person manages (drives CourseManagers).' } },
    // The old `staff_profile` id: the profile answers at /staff-profile/?id=<legacyId> (DEC-111).
    { name: 'legacyId', type: 'number', unique: true, index: true, admin: { position: 'sidebar', readOnly: true } },
  ],
}
