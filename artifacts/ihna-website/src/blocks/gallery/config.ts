import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { heading, variant } from '../fields'

export const GalleryBlock: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  fields: [
    heading(),
    variant(['grid', 'carousel']),
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
    ...sectionFields,
  ],
}
