import type { CollectionConfig } from 'payload'
import { denyAll, roles } from '@/lib/access'

export const ENQUIRY_STATUSES = ['received', 'delivering', 'delivered', 'partial', 'dead', 'held', 'spam'] as const

// Append-only record of every form submission (rule 2). Nobody writes through the admin or REST (DEC-3, DEC-20):
// the pipeline and the Retry/Release endpoints write through the Local API with overrideAccess.
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    useAsTitle: 'submissionId',
    defaultColumns: ['createdAt', 'formKey', 'email', 'campaignCode', 'status'],
    listSearchableFields: ['email', 'submissionId', 'formKey', 'campaignCode'],
    group: 'Enquiries',
    components: { beforeListTable: ['@/components/forms/RetryDeadButton#RetryDeadButton'] }, // Retry dead / Release held (40 §3)
  },
  access: {
    read: roles('marketing', 'finance'),
    create: denyAll,
    update: denyAll,
    delete: denyAll,
  },
  fields: [
    { type: 'row', fields: [
      { name: 'publicId', type: 'text', index: true },
      { name: 'submissionId', type: 'text', required: true, unique: true, index: true },
      { name: 'formKey', type: 'text', required: true, index: true },
    ] },
    { name: 'status', type: 'select', required: true, defaultValue: 'received', index: true, options: [...ENQUIRY_STATUSES], admin: { description: 'Derived from deliveries.' } },
    {
      type: 'row',
      fields: [
        { name: 'captchaStatus', type: 'select', options: ['ok', 'low', 'unverified', 'missing'] },
        { name: 'captchaScore', type: 'number' },
        { name: 'honeypot', type: 'checkbox', defaultValue: false },
      ],
    },
    { type: 'row', fields: [{ name: 'firstName', type: 'text' }, { name: 'lastName', type: 'text' }] },
    { type: 'row', fields: [{ name: 'email', type: 'email', index: true }, { name: 'phone', type: 'text' }] },
    { type: 'row', fields: [{ name: 'country', type: 'text' }, { name: 'studentType', type: 'text' }, { name: 'consent', type: 'checkbox' }] },
    { type: 'row', fields: [
      { name: 'course', type: 'relationship', relationTo: 'courses' },
      { name: 'campus', type: 'relationship', relationTo: 'campuses' },
    ] },
    { name: 'campaignCode', type: 'text', index: true, admin: { description: 'Campaign or promo code as received (URL, cookie or form field).' } },
    {
      name: 'utm', type: 'group',
      fields: [
        { type: 'row', fields: [{ name: 'utmSource', type: 'text' }, { name: 'utmMedium', type: 'text' }, { name: 'utmCampaign', type: 'text' }] },
        { type: 'row', fields: [{ name: 'utmTerm', type: 'text' }, { name: 'utmContent', type: 'text' }] },
        { type: 'row', fields: [{ name: 'gclid', type: 'text' }, { name: 'gbraid', type: 'text' }, { name: 'wbraid', type: 'text' }] },
        { type: 'row', fields: [{ name: 'fbclid', type: 'text' }, { name: 'msclkid', type: 'text' }] },
        { type: 'row', fields: [{ name: 'referrer', type: 'text' }, { name: 'landingPath', type: 'text' }] },
        { name: 'firstTouch', type: 'json' },
      ],
    },
    { name: 'hutk', type: 'text', admin: { description: 'HubSpot tracking cookie, always stored (DEC-13).' } },
    { name: 'data', type: 'json', admin: { description: 'Validated form fields.' } },
    { type: 'row', fields: [{ name: 'pageUrl', type: 'text' }, { name: 'source', type: 'select', options: ['api', 'legacy-post'], defaultValue: 'api' }] },
    { name: 'ip', type: 'text', admin: { description: 'Nulled after 90 days.' } },
    {
      name: 'deliveries', type: 'array',
      fields: [
        { type: 'row', fields: [
          { name: 'adapter', type: 'text', required: true },
          { name: 'target', type: 'text' },
          { name: 'status', type: 'select', defaultValue: 'pending', options: ['pending', 'sent', 'failed', 'dead', 'held', 'dry_run'] },
        ] },
        { type: 'row', fields: [
          { name: 'attempts', type: 'number', defaultValue: 0 },
          { name: 'at', type: 'date' },
          { name: 'responseCode', type: 'number' },
          { name: 'externalId', type: 'text' },
        ] },
        { name: 'lastError', type: 'text', maxLength: 500 },
        { name: 'dryRunRequest', type: 'json', admin: { description: 'Secrets masked.' } },
        { name: 'hsSourceFallback', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}
