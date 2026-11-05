import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { heading, variant } from '../fields'

// formKey names a definition in src/content/forms.ts (40-enquiries). No thank-you path field (DEC-4).
export const EnquiryFormBlock: Block = {
  slug: 'enquiryForm',
  interfaceName: 'EnquiryFormBlock',
  fields: [
    { name: 'formKey', type: 'text', required: true, admin: { description: 'One of the form keys in src/content/forms.ts (DEC-2)' } },
    heading(),
    variant(['card', 'inline', 'sidebar']),
    ...sectionFields,
  ],
}
