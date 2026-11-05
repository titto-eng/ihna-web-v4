import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { generateExpiredPayloadCookie } from 'payload/shared'
import config from '@payload-config'
import { env } from '@/env'

// POST /alumni/logout/: clears Payload's session cookie (same name and flags it was set with) and returns to the login page.
// POST only (a link or image cannot sign anyone out), and a cross-site Origin is refused.
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const origin = req.headers.get('origin')
  if (origin && origin !== new URL(env.NEXT_PUBLIC_SITE_URL).origin && origin !== new URL(req.url).origin) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  const payload = await getPayload({ config })
  const cookie = generateExpiredPayloadCookie({ collectionAuthConfig: payload.collections.alumni.config.auth, cookiePrefix: payload.config.cookiePrefix })
  const res = NextResponse.redirect(new URL('/alumni/login/', env.NEXT_PUBLIC_SITE_URL), 303)
  res.headers.append('Set-Cookie', cookie)
  res.headers.set('Cache-Control', 'no-store')
  return res
}

export function GET() {
  return new NextResponse('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
}
