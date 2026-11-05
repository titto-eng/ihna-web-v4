import { NextResponse } from 'next/server'

// The Airwallex webhook URL configured today (template-airwallex-dropin-response.php). POST is the webhook (45-payments §5);
// GET answers an empty 200 as the old WordPress page did.
export { POST } from '@/app/api/payments/webhook/airwallex/route'
export const dynamic = 'force-dynamic'

export function GET() {
  return new NextResponse(null, { status: 200, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })
}
