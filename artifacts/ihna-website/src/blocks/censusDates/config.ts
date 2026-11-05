import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'

export const CensusDatesBlock: Block = {
  slug: 'censusDates',
  interfaceName: 'CensusDatesBlock',
  fields: [
    { name: 'note', type: 'text', admin: { description: 'Optional line under the table' } },
    ...sectionFields,
  ],
}
