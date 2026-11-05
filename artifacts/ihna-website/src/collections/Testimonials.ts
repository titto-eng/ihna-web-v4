import type { CollectionConfig } from 'payload'
import { isAdmin, publishedOrStaff, roles, staffOnly } from '@/lib/access'
import { revalidateHooks } from './shared/hooks'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'course', 'featured', 'source', '_status'], group: 'Content' },
  versions: { drafts: { autosave: { interval: 1500 }, schedulePublish: true }, maxPerDoc: 25 },
  access: {
    read: publishedOrStaff,
    create: roles('marketing'),
    update: roles('marketing'),
    delete: isAdmin,
    readVersions: staffOnly,
  },
  hooks: revalidateHooks('testimonials'),
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'course', type: 'relationship', relationTo: 'courses', index: true, admin: { description: 'Old `course_id`.' } },
    { name: 'quote', type: 'textarea', required: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'videoUrl', type: 'text' },
    { name: 'headline', type: 'text', admin: { description: 'Old `meta_title`.' } },
    { name: 'subheadline', type: 'text', admin: { description: 'Old `meta_description`.' } },
    { name: 'featured', type: 'checkbox', defaultValue: false, index: true },
    { name: 'source', type: 'select', options: [{ label: 'MWT plugin', value: 'mwt' }, { label: 'Hard-coded in theme', value: 'hardcoded' }, { label: 'Alumni', value: 'alumni' }] },
    { name: 'legacyId', type: 'number', unique: true, index: true, admin: { position: 'sidebar', readOnly: true } },
  ],
}
