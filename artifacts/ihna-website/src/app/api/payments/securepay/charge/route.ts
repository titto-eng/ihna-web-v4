import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { handleSecurepayCharge } from '@/lib/payments/handlers'

// POST /api/payments/securepay/charge/: charges the tokenised card for the STORED amount. The body is {paymentId, token}; no amount.
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const rawBody = await req.text()
  const payload = await getPayload({ config })
  const out = await handleSecurepayCharge({ payload, rawBody, headers: req.headers })
  return NextResponse.json(out.body, { status: out.status, headers: { 'Cache-Control': 'no-store', ...out.headers } })
}
