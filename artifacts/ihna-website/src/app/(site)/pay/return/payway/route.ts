import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { handlePaywayReturn } from '@/lib/payments/handlers'

// GET /pay/return/payway/ (also the target of the live /payway-response/ the portals use). 45-payments §6.
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const q = Object.fromEntries(new URL(req.url).searchParams) as Record<string, string>
  const payload = await getPayload({ config })
  const out = await handlePaywayReturn(payload, q)
  if ('redirect' in out) return NextResponse.redirect(new URL(out.redirect, req.url), 303)
  return new NextResponse(out.message, { status: out.status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })
}
