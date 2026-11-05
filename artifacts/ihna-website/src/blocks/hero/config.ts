import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { links, media } from '../fields'

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true, admin: { description: 'Wrap one phrase in *asterisks* for the italic accent.' } },
    { name: 'subheading', type: 'textarea' },
    media('image'),
    { name: 'imageCaption', type: 'text', admin: { description: 'Small label over the image, e.g. "Illustrative image".' } },
    { name: 'variant', type: 'select', defaultValue: 'split', options: ['split', 'full', 'compact'] },
    { name: 'audienceSwitch', type: 'checkbox', defaultValue: false, admin: { description: 'Show the Domestic / International switch (drives admissions and fees blocks).' } },
    links('ctas'),
    ...sectionFields,
  ],
}
