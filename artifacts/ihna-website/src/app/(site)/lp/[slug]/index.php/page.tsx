import { permanentRedirect } from 'next/navigation'
import { lpPath } from '@/components/templates/landing/route'

// /lp/<slug>/index.php -> 308 (`permanentRedirect`) to /lp/<slug>/ with the query kept (60 §4, check 7).
type Params = Promise<{ slug: string }>
type Search = Promise<Record<string, string | string[] | undefined>>

export default async function LegacyIndexPhp({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { slug } = await params
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(await searchParams)) for (const x of Array.isArray(v) ? v : v === undefined ? [] : [v]) q.append(k, x)
  const qs = q.toString()
  permanentRedirect(`${lpPath(slug)}${qs ? `?${qs}` : ''}`)
}
