import type { CollectionConfig, Field } from 'payload'
import { activeOrStaff, fieldRoles, isAdmin, roles, staffOnly } from '@/lib/access'
import { slugField } from './shared/fields'
import { revalidateHooks } from './shared/hooks'

// The seven course lookups (10-content-model §2). Public read of active rows; admin + marketing write.
const lookup = (
  slug: string,
  opts: { label: string; singular: string; extra?: Field[]; useAsTitle?: string },
): CollectionConfig => ({
  slug,
  labels: { plural: opts.label, singular: opts.singular },
  admin: { useAsTitle: opts.useAsTitle ?? 'name', defaultColumns: ['name', 'slug', 'active', 'sortOrder'], group: 'Course data' },
  access: {
    read: activeOrStaff,
    create: roles('marketing'),
    update: roles('marketing'),
    delete: isAdmin,
    readVersions: staffOnly,
  },
  hooks: revalidateHooks(slug, { alsoCollections: ['courses'] }),
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField({ from: 'name', unique: true }),
    { name: 'active', type: 'checkbox', defaultValue: true, index: true, admin: { position: 'sidebar', description: 'Old `status`. Inactive rows are hidden from the public API.' } },
    { name: 'sortOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'legacyId', type: 'number', unique: true, index: true, admin: { position: 'sidebar', readOnly: true, description: 'Row id in the old mwt_* table (import key).' } },
    ...(opts.extra ?? []),
  ],
})

// Routing addresses are not public: admin + marketing read and write.
const enquiryEmail: Field = {
  name: 'enquiryEmail',
  type: 'email',
  access: { read: fieldRoles('marketing'), create: fieldRoles('marketing'), update: fieldRoles('marketing') },
  admin: { description: 'Where enquiries for this row are routed. Never shown publicly.' },
}
const image: Field = { name: 'image', type: 'upload', relationTo: 'media' }
const detailPage: Field = { name: 'detailPath', type: 'text', admin: { description: 'Path of this school/campus page in the code, e.g. /brisbane-campus/.' } }

export const Levels = lookup('levels', { label: 'Levels', singular: 'Level' })
export const DeliveryModes = lookup('deliveryModes', { label: 'Delivery modes', singular: 'Delivery mode' })
export const Durations = lookup('durations', {
  label: 'Durations', singular: 'Duration',
  extra: [{ name: 'months', type: 'number', required: true, min: 0, admin: { description: 'Old `name` (int).' } }],
})
export const Universities = lookup('universities', { label: 'Universities', singular: 'University', extra: [image, detailPage, enquiryEmail] })
export const Campuses = lookup('campuses', {
  label: 'Campuses', singular: 'Campus',
  extra: [
    image, detailPage, enquiryEmail,
    { name: 'portalCampusId', type: 'number', index: true, admin: { description: 'Campus id in the admissions portal.' } },
    { name: 'hubspotCampusValue', type: 'text' },
  ],
})
export const Disciplines = lookup('disciplines', {
  label: 'Disciplines', singular: 'Discipline',
  extra: [
    { name: 'description', type: 'textarea' },
    image,
    { name: 'color', type: 'text', validate: (v: unknown) => !v || (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)) || 'Hex colour such as #1a73e8' },
    { name: 'parent', type: 'relationship', relationTo: 'disciplines' },
  ],
})
export const Categories = lookup('categories', {
  label: 'Categories (Schools)', singular: 'Category',
  extra: [
    { name: 'description', type: 'textarea' },
    image,
    { name: 'color', type: 'text', validate: (v: unknown) => !v || (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)) || 'Hex colour such as #1a73e8' },
    { name: 'parent', type: 'relationship', relationTo: 'categories' },
    enquiryEmail,
  ],
})

export const lookups: CollectionConfig[] = [Levels, DeliveryModes, Durations, Universities, Campuses, Disciplines, Categories]
