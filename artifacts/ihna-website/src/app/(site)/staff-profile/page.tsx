// One staff profile by old id (template-staff-profile.php: `staff_profile WHERE id = ?id`), from the `staff` collection (staff.legacyId).
// The URL is always 200, as on live: without a known `?id` it lists the staff (the old page rendered an empty profile).
import type { Metadata } from 'next'
import { pageMetadata } from '@/components/page'
import { StaffDirectoryView } from '@/components/templates/StaffDirectory'
import { StaffProfile } from '@/components/templates/StaffProfile'
import { findStaffByLegacyId, getStaffById } from '@/components/templates/staffById'
import { idParam } from '@/lib/portal/ihna'
import { site } from '@/content/site'

type SP = Promise<Record<string, string | string[] | undefined>>

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const id = idParam((await searchParams).id)
  const staff = id ? await findStaffByLegacyId(id) : null
  if (staff) {
    const meta = pageMetadata({ title: staff.name, path: '/staff-profile/', description: staff.position ? `${staff.name}, ${staff.position} at ${site.shortName}.` : undefined })
    return { ...meta, alternates: { canonical: `/staff-profile/?id=${id}` } } // canonicals drop query strings; here the id is the page
  }
  return pageMetadata({ title: 'Staff profile', path: '/staff-profile/' })
}

export default async function StaffProfileRoute({ searchParams }: { searchParams: SP }) {
  const id = idParam((await searchParams).id)
  const staff = id ? await findStaffByLegacyId(id) : null
  if (staff) return <StaffProfile staff={staff} />
  return <StaffDirectoryView hero={{ variant: 'compact', heading: 'Staff profiles', audienceSwitch: false }} staff={await getStaffById()} />
}
