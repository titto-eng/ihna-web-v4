import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { variant } from '../fields'
import { tabsChildren } from '../nested'

export const TabsBlock: Block = {
  slug: 'tabs',
  interfaceName: 'TabsBlock',
  fields: [
    variant(['underline', 'pill']),
    {
      name: 'tabs', type: 'array', minRows: 2,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'anchorId', type: 'text', admin: { description: 'Opens this tab from /page/#anchor (old #tab links)' } },
        { name: 'blocks', type: 'blocks', blockReferences: tabsChildren, blocks: [] },
      ],
    },
    ...sectionFields,
  ],
}
