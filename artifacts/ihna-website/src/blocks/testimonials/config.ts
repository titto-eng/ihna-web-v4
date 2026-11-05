import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { heading, media, variant } from '../fields'
import { optionalVideoUrl, quoteOrVideo } from './video'

// carousel (the default) = 1 → 2 → 3 cards per view; a `videoUrl` item plays its video inside the card.
export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  fields: [
    heading(),
    variant(['carousel', 'grid', 'single']),
    {
      name: 'inline', type: 'array',
      fields: [
        { name: 'quote', type: 'textarea', validate: quoteOrVideo, admin: { description: 'Required unless the item has a video link.' } },
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text' },
        media('photo'),
        { name: 'videoUrl', type: 'text', validate: optionalVideoUrl, admin: { description: 'YouTube or Vimeo link: the card plays it in place (the photo is its poster).' } },
      ],
    },
    ...sectionFields,
  ],
}
