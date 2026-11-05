import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'
import { heading } from '../fields'

// BON 04: year tabs, units grouped by semester.
export const CurriculumBlock: Block = {
  slug: 'curriculum',
  interfaceName: 'CurriculumBlock',
  fields: [
    { name: 'eyebrow', type: 'text', defaultValue: 'Curriculum' },
    heading(),
    {
      name: 'years', type: 'array', minRows: 1,
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'units', type: 'array',
          fields: [
            { name: 'semester', type: 'text', admin: { description: 'e.g. Semester 1; units with the same text are grouped' } },
            { name: 'code', type: 'text' },
            { name: 'title', type: 'text', required: true },
            { name: 'credit', type: 'number' },
            { name: 'kind', type: 'select', defaultValue: 'core', options: ['core', 'elective', 'placement'] },
          ],
        },
      ],
    },
    ...sectionFields,
  ],
}
