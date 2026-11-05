import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { handlePaywayNotification } from '@/lib/payments/handlers'

// POST /api/payments/webhook/payway/: PayWay Net server-to-server payment notification (reply_link_url of the token request; 45 §6).
// Basic Auth / username+password checked in the handler. 200 only after the row is settled, so PayWay retries anything we failed to save.
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const rawBody = await req.text()
  const payload = await getPayload({ config })
  const out = await handlePaywayNotification(payload, { rawBody, authorization: req.headers.get('authorization'), contentType: req.headers.get('content-type') })
  return NextResponse.json(out.body, { status: out.status, headers: { 'Cache-Control': 'no-store' } })
}
