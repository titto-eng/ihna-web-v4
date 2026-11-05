import type { CollectionConfig } from 'payload'
import { isAdmin, publishedOrStaff, roles, staffOnly } from '@/lib/access'
import { slugField } from './shared/fields'
import { revalidateHooks } from './shared/hooks'

// Events staff (role `events`) edit these alongside marketing.
export const Events: CollectionConfig = {
  slug: 'events',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'startsAt', 'registrationOpen', '_status'], group: 'Content' },
  versions: { drafts: { autosave: { interval: 1500 }, schedulePublish: true }, maxPerDoc: 25 },
  defaultSort: 'startsAt',
  access: {
    read: publishedOrStaff,
    create: roles('marketing', 'events'),
    update: roles('marketing', 'events'),
    delete: isAdmin,
    readVersions: staffOnly,
  },
  hooks: revalidateHooks('events', { docTags: (d) => [`event:${d.slug}`] }),
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField({ unique: true }),
    { name: 'startsAt', type: 'date', required: true, index: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
    {
      type: 'row',
      fields: [
        { name: 'dayLabel', type: 'text', admin: { description: 'e.g. "Every Tuesday"' } },
        { name: 'timeText', type: 'text', admin: { description: 'e.g. "6pm AEST"' } },
        { name: 'frequency', type: 'text' },
      ],
    },
    { name: 'discipline', type: 'relationship', relationTo: 'disciplines' },
    { name: 'description', type: 'textarea' },
    { type: 'row', fields: [{ name: 'speaker', type: 'text' }, { name: 'speakerBio', type: 'textarea' }] },
    { type: 'row', fields: [{ name: 'venue', type: 'text' }, { name: 'hostedBy', type: 'text' }] },
    { type: 'row', fields: [{ name: 'joinUrl', type: 'text' }, { name: 'secondaryUrl', type: 'text', admin: { description: 'Old `eventd_link`.' } }] },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'tags', type: 'text', hasMany: true },
    { name: 'registrationOpen', type: 'checkbox', defaultValue: true },
    { name: 'formKey', type: 'text', defaultValue: 'event-registration', admin: { description: 'Registration form: a key in src/content/forms.ts.' } },
    { name: 'legacyId', type: 'number', unique: true, index: true, admin: { position: 'sidebar', readOnly: true } },
  ],
}
