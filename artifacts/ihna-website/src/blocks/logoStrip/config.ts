import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { heading, media } from '../fields'

export const LogoStripBlock: Block = {
  slug: 'logoStrip',
  interfaceName: 'LogoStripBlock',
  fields: [
    heading(),
    {
      name: 'logos', type: 'array',
      fields: [
        media('logo', true),
        { name: 'alt', type: 'text', required: true },
        { name: 'href', type: 'text' },
      ],
    },
    ...sectionFields,
  ],
}
