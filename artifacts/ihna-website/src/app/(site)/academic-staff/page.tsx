// Academic staff directory (template-academic-staff.php: `staff_profile WHERE team='academic'`). Rendered from the `staff` collection;
// each person links to /staff-profile/?id=<old id> (staff.legacyId). The old staff_profile rows reach `staff` through the staff import.
import type { Metadata } from 'next'
import { pageMetadata } from '@/components/page'
import { StaffDirectoryView } from '@/components/templates/StaffDirectory'
import { getStaffById } from '@/components/templates/staffById'

export const metadata: Metadata = pageMetadata({
  title: 'Academic Staff', // the live page title (parity); the heading stays descriptive
  path: '/academic-staff/',
  description: 'Meet the academic and management team at the Institute of Health and Nursing Australia.',
})

export default async function AcademicStaffRoute() {
  return <StaffDirectoryView hero={{ variant: 'compact', heading: 'Our Academic Management Team', audienceSwitch: false }} staff={await getStaffById()} />
}
