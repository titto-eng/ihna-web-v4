import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { validateMapEmbedUrl } from '../embeds'

export const MapEmbedBlock: Block = {
  slug: 'mapEmbed',
  interfaceName: 'MapEmbedBlock',
  fields: [
    { name: 'embedUrl', type: 'text', required: true, validate: validateMapEmbedUrl, admin: { description: 'https://www.google.com/maps/embed?… only' } },
    { name: 'caption', type: 'text' },
    ...sectionFields,
  ],
}
