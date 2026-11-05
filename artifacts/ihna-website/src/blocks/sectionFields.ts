import type { Field } from 'payload'

// Shared presentation fields on every block (05-design-system §2).
export const sectionFields: Field[] = [
  {
    type: 'row',
    fields: [
      { name: 'tone', type: 'select', defaultValue: 'default', options: ['default', 'card', 'muted', 'ink', 'sunrise'] },
      { name: 'spacing', type: 'select', defaultValue: 'default', options: ['default', 'compact', 'none'] },
      { name: 'anchorId', type: 'text', admin: { description: 'Optional in-page anchor' } },
    ],
  },
]

export type SectionProps = {
  tone?: 'default' | 'card' | 'muted' | 'ink' | 'sunrise' | null
  spacing?: 'default' | 'compact' | 'none' | null
  anchorId?: string | null
}
