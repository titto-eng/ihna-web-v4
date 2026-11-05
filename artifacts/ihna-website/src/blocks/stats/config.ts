import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { heading } from '../fields'

export const StatsBlock: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  fields: [
    heading(),
    {
      name: 'items', type: 'array', minRows: 2, maxRows: 6,
      fields: [
        { name: 'value', type: 'text', required: true, admin: { description: 'e.g. 800h, 4, 95%' } },
        { name: 'label', type: 'text', required: true },
        { name: 'note', type: 'text' },
      ],
    },
    ...sectionFields,
  ],
}
