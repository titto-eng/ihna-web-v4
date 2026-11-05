import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { heading, variant } from '../fields'
import { accordionChildren } from '../nested'

export const AccordionBlock: Block = {
  slug: 'accordion',
  interfaceName: 'AccordionBlock',
  fields: [
    heading(),
    { name: 'intro', type: 'textarea' },
    variant(['faq', 'plain']),
    {
      name: 'items', type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'blocks', type: 'blocks', blockReferences: accordionChildren, blocks: [] },
      ],
    },
    ...sectionFields,
  ],
}
