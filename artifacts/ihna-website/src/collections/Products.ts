import type { CollectionConfig } from 'payload'
import { activeOrStaff, fieldRoles, isAdmin, roles, staffOnly } from '@/lib/access'
import { revalidateHooks } from './shared/hooks'

export const GATEWAYS = ['payway', 'securepay', 'airwallex', 'convera', 'flywire'] as const

// English-test products (E2): 6 prep packages + 6 mock tests. Prices are set here and read by the server only (rule 6).
export const Products: CollectionConfig = {
  slug: 'products',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'sku', 'kind', 'priceCents', 'active'], group: 'Payments' },
  versions: { maxPerDoc: 25 },
  defaultSort: 'sortOrder',
  access: {
    read: activeOrStaff,
    create: roles('finance'),
    update: roles('marketing', 'finance'),
    delete: isAdmin,
    readVersions: staffOnly,
  },
  hooks: revalidateHooks('products', { docTags: (d) => [`product:${d.sku}`] }),
  fields: [
    { name: 'sku', type: 'text', required: true, unique: true, index: true },
    { name: 'legacyE2Btn', type: 'number', unique: true, min: 1, max: 12, admin: { description: 'Old ?e2btn= value (1-12). Keeps old links working.' } },
    { name: 'name', type: 'text', required: true },
    { name: 'kind', type: 'select', required: true, options: [{ label: 'Prep package', value: 'prep-package' }, { label: 'Mock test', value: 'mock-test' }] },
    { name: 'description', type: 'textarea' },
    // Finance and admin only. Marketing edits everything else on a product.
    { name: 'priceCents', type: 'number', required: true, min: 1, access: { create: fieldRoles('finance'), update: fieldRoles('finance') }, admin: { step: 1, description: 'Cents, e.g. 15000 = $150.00' } },
    { name: 'currency', type: 'select', defaultValue: 'AUD', options: ['AUD'], access: { create: fieldRoles('finance'), update: fieldRoles('finance') } },
    { name: 'studentDiscountPercent', type: 'number', defaultValue: 50, min: 0, max: 100, access: { create: fieldRoles('finance'), update: fieldRoles('finance') } },
    { name: 'accessMonths', type: 'number', min: 0 },
    { name: 'gateways', type: 'select', hasMany: true, defaultValue: ['securepay', 'airwallex'], options: [...GATEWAYS], admin: { description: 'Gateways offered for this product (server-enforced).' } },
    { name: 'active', type: 'checkbox', defaultValue: true, index: true },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
}
