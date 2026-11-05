// Intake calendar from the portal (template-monthly-calendar.php): CalendarPage renders the intakeCalendar block for the next 12 months, campus 8
// (src/lib/portal/queries.ts CALENDAR_CAMPUS_ID), entries linked to their course page. 50-portal-data §5.
import type { Metadata } from 'next'
import { pageMetadata } from '@/components/page'
import { CalendarPage } from '@/components/templates/pages'

export const metadata: Metadata = pageMetadata({
  title: 'Monthly Calendar',
  path: '/monthly-calendar/',
  description: 'Upcoming course intakes at IHNA, month by month.',
})

export default function CalendarRoute() {
  return <CalendarPage title="Monthly Calendar" path="/monthly-calendar/" hero={{ variant: 'compact', heading: 'Monthly Calendar', audienceSwitch: false }} />
}
