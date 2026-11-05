import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'

export const StartDatesBlock: Block = {
  slug: 'startDates',
  interfaceName: 'StartDatesBlock',
  fields: [
    { name: 'mode', type: 'select', defaultValue: 'all', options: ['all', 'f2f', 'online', 'blended'] },
    ...sectionFields,
  ],
}
