import { buildRobotsTxt } from '@/lib/seo/robots'

export const dynamic = 'force-dynamic' // NEXT_PUBLIC_ROBOTS is read per request, not frozen at build

export function GET() {
  const body = buildRobotsTxt({ noindex: process.env.NEXT_PUBLIC_ROBOTS === 'noindex' })
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' } })
}
