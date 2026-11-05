import type { CollectionConfig } from 'payload'
import { denyAll, roles } from '@/lib/access'

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded', 'flagged', 'cancelled', 'expired'] as const

// Read-only mirror of the portal `payments` rows our flows create (database `PORTAL_DB_NAME`: `ihna_portal` on IHNA). Written only by 45-payments code through the
// Local API (overrideAccess); the portal row stays authoritative. Nobody edits amounts or deletes (DEC-3).
export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: 'paymentId',
    defaultColumns: ['createdAt', 'paymentId', 'kind', 'payerEmail', 'amountCents', 'gateway', 'status'],
    listSearchableFields: ['paymentId', 'invoiceNo', 'payerEmail', 'gatewayRef'],
    group: 'Payments',
  },
  access: {
    read: roles('finance'),
    create: denyAll,
    update: denyAll,
    delete: denyAll,
  },
  fields: [
    { name: 'paymentId', type: 'text', required: true, unique: true, index: true, admin: { description: 'uuid; the only id exposed outside the server.' } },
    { type: 'row', fields: [
      { name: 'kind', type: 'select', options: ['invoice', 'product', 'sae', 'portalReturn'] },
      { name: 'product', type: 'relationship', relationTo: 'products' },
      { name: 'paymentFor', type: 'text' },
    ] },
    { type: 'row', fields: [
      { name: 'invoiceNo', type: 'text', index: true },
      { name: 'studentId', type: 'text', index: true },
      { name: 'payerName', type: 'text' },
      { name: 'payerEmail', type: 'email', index: true },
    ] },
    { type: 'row', fields: [
      { name: 'amountCents', type: 'number', required: true },
      { name: 'baseCents', type: 'number' },
      { name: 'surchargeCents', type: 'number' },
      { name: 'currency', type: 'text', defaultValue: 'AUD' },
    ] },
    { type: 'row', fields: [
      { name: 'gateway', type: 'text', index: true },
      { name: 'gatewayRef', type: 'text', index: true },
      { name: 'status', type: 'select', required: true, defaultValue: 'pending', index: true, options: [...PAYMENT_STATUSES] },
    ] },
    {
      name: 'statusHistory', type: 'array',
      fields: [
        { name: 'status', type: 'text', required: true },
        { name: 'at', type: 'date' },
        { name: 'note', type: 'text' },
      ],
    },
    {
      name: 'steps', type: 'array', admin: { description: 'Per-step status of the post-payment jobs.' },
      fields: [
        { name: 'step', type: 'text', required: true },
        { name: 'status', type: 'text' },
        { name: 'attempts', type: 'number', defaultValue: 0 },
      ],
    },
    { name: 'portalPaymentId', type: 'text', admin: { description: 'Server only.' } },
    { name: 'flags', type: 'json' },
    { name: 'ip', type: 'text' },
    { type: 'row', fields: [{ name: 'settledAt', type: 'date' }, { name: 'lastSyncedAt', type: 'date' }] },
  ],
}
