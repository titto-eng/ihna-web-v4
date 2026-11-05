import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { heading, links, variant } from '../fields'

export const CtaBlock: Block = {
  slug: 'cta',
  interfaceName: 'CtaBlock',
  fields: [
    heading(),
    { name: 'body', type: 'textarea' },
    links('links'),
    variant(['centered', 'banner', 'inline']),
    ...sectionFields,
  ],
}
