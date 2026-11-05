import { NextResponse } from 'next/server'
import { isUuid } from '@/lib/payments/sign'
import { resultPath } from '@/lib/payments/handlers'

// GET /pay/return/airwallex/?id=<uuid>: the drop-in's return_url. The webhook settles the payment; the result page shows its status.
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id')
  if (!isUuid(id)) return new NextResponse('Unknown payment.', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
  return NextResponse.redirect(new URL(resultPath(id), req.url), 303)
}
