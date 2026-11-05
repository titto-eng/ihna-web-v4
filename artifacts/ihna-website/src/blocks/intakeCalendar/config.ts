import type { Block } from 'payload'
import { sectionFields } from '../sectionFields'

export const IntakeCalendarBlock: Block = {
  slug: 'intakeCalendar',
  interfaceName: 'IntakeCalendarBlock',
  fields: [
    { name: 'months', type: 'number', defaultValue: 12, min: 1, max: 24 },
    ...sectionFields,
  ],
}
