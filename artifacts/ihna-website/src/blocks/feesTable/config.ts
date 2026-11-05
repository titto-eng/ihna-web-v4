import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'

export const FeesTableBlock: Block = {
  slug: 'feesTable',
  interfaceName: 'FeesTableBlock',
  fields: [
    ...sectionFields,
  ],
}
