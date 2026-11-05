import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { heading, media, variant } from '../fields'

export const TeamGridBlock: Block = {
  slug: 'teamGrid',
  interfaceName: 'TeamGridBlock',
  fields: [
    heading(),
    variant(['grid', 'carousel']),
    {
      name: 'members', type: 'array',
      fields: [
        media('photo'),
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text' },
        { name: 'bio', type: 'textarea', admin: { description: 'Opens in a dialog when set' } },
      ],
    },
    ...sectionFields,
  ],
}
