import type { CollectionConfig } from 'payload'
import { activeOrStaff, isAdmin, roles, staffOnly } from '@/lib/access'
import { slugField } from './shared/fields'
import { revalidateHooks } from './shared/hooks'

// Blog categories (10-content-model §2): the labels the old App Runner blog carried (`category` code + `category_name`).
// Shown on posts and cards; there are no category archive URLs (every old /blog/category/… answers 404 on live).
export const BlogCategories: CollectionConfig = {
  slug: 'blogCategories',
  labels: { plural: 'Blog categories', singular: 'Blog category' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'active', 'sortOrder'], group: 'Content' },
  access: { read: activeOrStaff, create: roles('marketing'), update: roles('marketing'), delete: isAdmin, readVersions: staffOnly },
  hooks: revalidateHooks('blogCategories', { alsoCollections: ['posts'] }),
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField({ from: 'name', unique: true }),
    { name: 'active', type: 'checkbox', defaultValue: true, index: true, admin: { position: 'sidebar' } },
    { name: 'sortOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'legacyCode', type: 'text', unique: true, index: true, admin: { position: 'sidebar', readOnly: true, description: 'Category code in the old App Runner API (import key), e.g. NURSING.' } },
  ],
}
