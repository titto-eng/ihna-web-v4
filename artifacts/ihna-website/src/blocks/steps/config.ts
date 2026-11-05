import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { heading, variant } from '../fields'

export const StepsBlock: Block = {
  slug: 'steps',
  interfaceName: 'StepsBlock',
  fields: [
    heading(),
    { name: 'intro', type: 'textarea' },
    variant(['numbered', 'timeline']),
    {
      name: 'steps', type: 'array',
      fields: [
        { name: 'label', type: 'text', admin: { description: 'Timeline: small label, e.g. PEP 1' } },
        { name: 'value', type: 'text', admin: { description: 'Timeline: big figure, e.g. 160h' } },
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea' },
      ],
    },
    ...sectionFields,
  ],
}
