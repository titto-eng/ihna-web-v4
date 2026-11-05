import type { Block } from 'payload'
import { FACT_KEYS } from '@/components/course/facts'
import { sectionFields } from '../sectionFields'

export const CourseFactsBlock: Block = {
  slug: 'courseFacts',
  interfaceName: 'CourseFactsBlock',
  fields: [
    // Narrows the course's own key facts (courses.facts) for this placement; empty = every fact the course shows.
    { name: 'show', type: 'select', hasMany: true, options: [...FACT_KEYS], admin: { description: 'Empty = every fact switched on in the course\'s Key facts.' } },
    ...sectionFields,
  ],
}
