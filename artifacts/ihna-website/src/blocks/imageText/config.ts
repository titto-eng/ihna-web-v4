import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { heading, links, media, textList } from '../fields'

export const ImageTextBlock: Block = {
  slug: 'imageText',
  interfaceName: 'ImageTextBlock',
  fields: [
    { name: 'eyebrow', type: 'text' },
    heading(),
    media('media', true),
    { name: 'imageCaption', type: 'text' },
    { name: 'content', type: 'richText', required: true },
    { name: 'imageSide', type: 'select', defaultValue: 'left', options: ['left', 'right'] },
    textList('chips', 'Small pills under the text, e.g. campuses.'),
    links('ctas'),
    ...sectionFields,
  ],
}
