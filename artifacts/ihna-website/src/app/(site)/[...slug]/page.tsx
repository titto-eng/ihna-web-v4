import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { StaffProfile } from '@/components/templates/StaffProfile'
import { pageMetadata } from '@/components/page/metadata'
import { staffPaths } from '@/content/staff-paths'
import { slugsToPath } from '@/lib/paths'
import type { Staff } from '@/payload-types'
import { site } from '@/content/site'

// The only dynamic content route: staff profile URLs of the form `/<person>/` (DEC-65), served from the
// `staff` collection through src/content/staff-paths.ts. IHNA has none (the map is empty), so every path here is a 404; IHNA profiles
// are /staff-profile/?id=N (DEC-111). Every other page is a route file.
// Exact-path redirects live in next.config.ts (src/content/redirects.ts), prefix rules in src/proxy.ts. `/` is its own route file.

type Params = Promise<{ slug: string[] }>

async function getStaff(path: string): Promise<Staff | null> {
  const slug = staffPaths[path]
  if (!slug) return null
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'staff', where: { and: [{ slug: { equals: slug } }, { active: { not_equals: false } }] }, limit: 1, depth: 1 })
  return (docs[0] as Staff | undefined) ?? null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const path = slugsToPath((await params).slug)
  const staff = await getStaff(path)
  if (!staff) return {}
  return pageMetadata({ title: staff.name, path, description: staff.position ? `${staff.name}, ${staff.position} at ${site.shortName}.` : undefined })
}

export default async function Page({ params }: { params: Params }) {
  const staff = await getStaff(slugsToPath((await params).slug))
  if (!staff) notFound()
  return <StaffProfile staff={staff} />
}
