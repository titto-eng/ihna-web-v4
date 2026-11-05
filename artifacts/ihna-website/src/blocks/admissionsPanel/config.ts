import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { heading, links, textList } from '../fields'

// BON 05: audience-aware. Both versions render on the server; CSS hides the inactive one.
export const AdmissionsPanelBlock: Block = {
  slug: 'admissionsPanel',
  interfaceName: 'AdmissionsPanelBlock',
  fields: [
    { name: 'eyebrow', type: 'text', defaultValue: 'Admissions' },
    heading(),
    { name: 'domestic', type: 'richText', admin: { description: 'Lead text, domestic version' } },
    { name: 'international', type: 'richText', admin: { description: 'Lead text, international version' } },
    {
      name: 'cards', type: 'array', maxRows: 6,
      fields: [
        { name: 'audience', type: 'select', defaultValue: 'both', options: ['both', 'domestic', 'international'] },
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', admin: { description: 'Big figure, e.g. ATAR 50' } },
        { name: 'body', type: 'textarea' },
      ],
    },
    textList('steps', 'Application steps, shown as a numbered list'),
    links('links', 3),
    ...sectionFields,
  ],
}
