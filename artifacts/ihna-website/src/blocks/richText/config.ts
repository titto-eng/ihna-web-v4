import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'

export const RichTextBlock: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  fields: [
    { name: 'content', type: 'richText', required: true },
    { name: 'width', type: 'select', defaultValue: 'prose', options: ['prose', 'wide'] },
    ...sectionFields,
  ],
}
