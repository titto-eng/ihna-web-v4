import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { heading, media, variant } from '../fields'

export const CardGridBlock: Block = {
  slug: 'cardGrid',
  interfaceName: 'CardGridBlock',
  fields: [
    heading(),
    { name: 'intro', type: 'textarea' },
    { name: 'columns', type: 'select', defaultValue: '3', options: ['2', '3', '4'] },
    variant(['grid', 'carousel']),
    {
      name: 'cards', type: 'array',
      fields: [
        media('image'),
        { name: 'badge', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea' },
        { name: 'href', type: 'text', admin: { description: 'Makes the whole card a link' } },
      ],
    },
    ...sectionFields,
  ],
}
