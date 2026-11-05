import { redirectIndexPhp } from '@/components/templates/landing/route'

// /walkin-enquiry/index.php: the old self-post form target and old links. 308 to the page with the query kept (60 §4).
type Search = Promise<Record<string, string | string[] | undefined>>

export default async function LegacyIndexPhp({ searchParams }: { searchParams: Search }) {
  redirectIndexPhp('/walkin-enquiry/', await searchParams)
}
