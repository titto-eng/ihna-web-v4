import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'

export const CourseManagersBlock: Block = {
  slug: 'courseManagers',
  interfaceName: 'CourseManagersBlock',
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Course managers' },
    ...sectionFields,
  ],
}
