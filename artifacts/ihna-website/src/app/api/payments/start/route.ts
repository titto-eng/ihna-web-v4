import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { handleStart } from '@/lib/payments/start'

// POST /api/payments/start/ (45-payments §6). The pipeline is in src/lib/payments/start.ts.
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const rawBody = await req.text()
  const payload = await getPayload({ config })
  const out = await handleStart({ payload, rawBody, headers: req.headers })
  return NextResponse.json(out.body, { status: out.status, headers: { 'Cache-Control': 'no-store', ...out.headers } })
}
