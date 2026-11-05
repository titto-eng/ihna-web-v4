import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { media, variant } from '../fields'
import { validateVideoUrl } from '../embeds'

// Only the YouTube / Vimeo id is used; the renderer builds the embed URL itself.
export const VideoEmbedBlock: Block = {
  slug: 'videoEmbed',
  interfaceName: 'VideoEmbedBlock',
  fields: [
    { name: 'url', type: 'text', required: true, validate: validateVideoUrl, admin: { description: 'YouTube or Vimeo link' } },
    { name: 'title', type: 'text', required: true },
    media('poster'),
    variant(['inline', 'lightbox']),
    ...sectionFields,
  ],
}
