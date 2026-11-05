import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { variant } from '../fields'

export const TableBlock: Block = {
  slug: 'table',
  interfaceName: 'TableBlock',
  fields: [
    { name: 'caption', type: 'text' },
    { name: 'headerRow', type: 'checkbox', defaultValue: true },
    variant(['striped', 'plain']),
    {
      name: 'rows', type: 'json', required: true, defaultValue: [['Column A', 'Column B'], ['', '']],
      admin: { description: 'Rows of cells as JSON: [["Header 1","Header 2"],["a","b"]]' },
    },
    ...sectionFields,
  ],
}
