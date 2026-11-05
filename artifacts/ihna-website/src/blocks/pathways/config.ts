import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { heading, links, textList } from '../fields'

// BON 01 "Three ways in": ink section with A/B/C tabs.
export const PathwaysBlock: Block = {
  slug: 'pathways',
  interfaceName: 'PathwaysBlock',
  fields: [
    { name: 'eyebrow', type: 'text', defaultValue: 'Three ways in' },
    heading(),
    { name: 'intro', type: 'textarea' },
    {
      name: 'paths', type: 'array', minRows: 2, maxRows: 4,
      fields: [
        { name: 'label', type: 'text', required: true, admin: { description: 'A, B, C' } },
        { name: 'title', type: 'text', required: true },
        { name: 'tagline', type: 'text' },
        { name: 'structure', type: 'text', admin: { description: 'e.g. Structure · 3 years full-time' } },
        { name: 'body', type: 'textarea' },
        { name: 'suits', type: 'textarea', admin: { description: 'Who it suits' } },
        textList('advantages'),
        { name: 'progression', type: 'textarea' },
        { name: 'notice', type: 'textarea', admin: { description: 'Caution box' } },
        links('ctas'),
      ],
    },
    ...sectionFields,
  ],
}
