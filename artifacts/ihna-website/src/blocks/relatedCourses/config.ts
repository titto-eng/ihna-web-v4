import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'

export const RelatedCoursesBlock: Block = {
  slug: 'relatedCourses',
  interfaceName: 'RelatedCoursesBlock',
  fields: [
    { name: 'limit', type: 'number', defaultValue: 6, min: 1, max: 12 },
    ...sectionFields,
  ],
}
