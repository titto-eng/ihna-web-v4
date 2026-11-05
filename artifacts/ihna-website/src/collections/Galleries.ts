import type { CollectionConfig } from 'payload'
import { activeOrStaff, fieldRoles, isAdmin, roles, staffOnly } from '@/lib/access'
import { galleryCampuses } from '@/content/campuses'
import { slugField } from './shared/fields'
import { revalidateHooks } from './shared/hooks'

// Event galleries (10-content-model §2): one doc per event ("gallery category" in the old App Runner API) with its photos.
// Rendered by /all-events/ (filter `?campus=`) and the campus pages. Marketing edits, orders and hides them.
const system = { create: fieldRoles(), update: fieldRoles() }

export const Galleries: CollectionConfig = {
  slug: 'galleries',
  labels: { plural: 'Galleries', singular: 'Gallery' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'eventDate', 'campuses', 'featured', 'active'], group: 'Content' },
  defaultSort: '-eventDate',
  access: { read: activeOrStaff, create: roles('marketing', 'events'), update: roles('marketing', 'events'), delete: isAdmin, readVersions: staffOnly },
  hooks: revalidateHooks('galleries'),
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField({ unique: true }),
    { name: 'eventDate', type: 'date', index: true, admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } } },
    {
      name: 'campuses',
      type: 'select',
      hasMany: true,
      index: true,
      options: galleryCampuses.map((c) => ({ label: c.name, value: c.key })),
      admin: { position: 'sidebar', description: 'Campus pages and the /all-events/ campus filter show this gallery.' },
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, index: true, admin: { position: 'sidebar' } },
    { name: 'active', type: 'checkbox', defaultValue: true, index: true, admin: { position: 'sidebar', description: 'Unticked = hidden from the site.' } },
    { name: 'sortOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar', description: 'Lower first; same order → newest event first.' } },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Photo', plural: 'Photos' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'title', type: 'text' },
        { name: 'caption', type: 'textarea' },
        { name: 'apprunnerId', type: 'text', access: system, admin: { readOnly: true } },
      ],
    },
    { name: 'apprunnerId', type: 'text', unique: true, index: true, access: system, admin: { position: 'sidebar', readOnly: true, description: 'Id in the old App Runner API (import key).' } },
    { name: 'sourceUpdatedAt', type: 'text', access: system, admin: { hidden: true } },
  ],
}
