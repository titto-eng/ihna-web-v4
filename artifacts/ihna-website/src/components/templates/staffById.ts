import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { mediaOf } from '@/components/blocks/media'
import type { Staff } from '@/payload-types'
import type { StaffCard } from './data'

// IHNA staff URLs: the directory /academic-staff/ links each person to /staff-profile/?id=<id> (template-academic-staff.php), where <id> is the
// old WordPress `staff_profile.id`, stored on the person as `staff.legacyId` by the staff import. Data from the `staff` collection only.

/** The profile URL of a person, or null when the person has no old id (no profile link, as the old list without a bio). */
export const staffProfileHref = (legacyId: number | null | undefined): string | null => (legacyId ? `/staff-profile/?id=${legacyId}` : null)

/** Active staff for the IHNA directory, linked by old id. Tag `collection:staff`. */
export const getStaffById = (): Promise<StaffCard[]> =>
  unstable_cache(async () => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({ collection: 'staff', where: { active: { not_equals: false } }, depth: 1, limit: 0, pagination: false, sort: ['sortOrder', 'name'] })
    return (docs as Staff[]).map((s) => ({
      id: s.id, name: s.name, position: s.position ?? null, photo: mediaOf(s.photo as never),
      school: s.school && typeof s.school === 'object' ? { id: s.school.id, name: s.school.name } : null,
      path: staffProfileHref(s.legacyId),
    }))
  }, ['templates', 'staff-by-legacy-id'], { tags: ['collection:staff'], revalidate: 300 })()

/** One active person by old `staff_profile.id`, or null. */
export async function findStaffByLegacyId(id: number): Promise<Staff | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'staff', where: { and: [{ legacyId: { equals: id } }, { active: { not_equals: false } }] }, limit: 1, depth: 1 })
  return (docs[0] as Staff | undefined) ?? null
}
