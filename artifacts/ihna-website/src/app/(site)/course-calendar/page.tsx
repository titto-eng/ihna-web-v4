// Intake calendar from the portal (template-course-calendar.php (it framed /monthly-calendar/)): CalendarPage renders the intakeCalendar block for the next 12 months, campus 8
// (src/lib/portal/queries.ts CALENDAR_CAMPUS_ID), entries linked to their course page. 50-portal-data §5.
import type { Metadata } from 'next'
import { pageMetadata } from '@/components/page'
import { CalendarPage } from '@/components/templates/pages'

export const metadata: Metadata = pageMetadata({
  title: 'Course Calendar',
  path: '/course-calendar/',
  description: 'Upcoming course intakes at IHNA, month by month.',
})

export default function CalendarRoute() {
  return <CalendarPage title="Course Calendar" path="/course-calendar/" hero={{ variant: 'compact', heading: 'Course Calendar', audienceSwitch: false }} />
}
