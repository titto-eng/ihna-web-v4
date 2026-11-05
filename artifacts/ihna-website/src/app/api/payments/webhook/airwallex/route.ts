import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { handleAirwallexWebhook } from '@/lib/payments/handlers'

// POST /api/payments/webhook/airwallex/. The raw body is what is signed, so it is read as text and never re-serialised.
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const rawBody = await req.text()
  const payload = await getPayload({ config })
  const out = await handleAirwallexWebhook(payload, { rawBody, timestamp: req.headers.get('x-timestamp'), signature: req.headers.get('x-signature') })
  return NextResponse.json(out.body, { status: out.status, headers: { 'Cache-Control': 'no-store' } })
}
