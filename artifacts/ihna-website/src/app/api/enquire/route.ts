import { after, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { handleEnquire, type QueueFn } from '@/lib/enquiries/process'
import { queueDeliverEnquiry, runJobNow } from '@/jobs/queue'

// POST /api/enquire/ (note the trailing slash: trailingSlash is on). 40-enquiries §4. The pipeline lives in
// src/lib/enquiries/process.ts so tests can drive it without HTTP; this file only adapts Request/Response.
export const dynamic = 'force-dynamic'

const queueDelivery: QueueFn = async (payload, enquiryId) => {
  const jobId = await queueDeliverEnquiry(payload, enquiryId)
  try {
    after(() => runJobNow(payload, jobId)) // answer the visitor first, then attempt delivery; retries belong to the runner
  } catch {
    /* no request scope (tests): the runner will pick the job up */
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const payload = await getPayload({ config })
  const out = await handleEnquire({ payload, rawBody, headers: req.headers, contentType: req.headers.get('content-type') }, { queueDelivery })

  // No-JS form posts (urlencoded) get a 303 to the thank-you, or back to the page with an error flag.
  if (req.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
    const to = out.status === 200 && typeof out.body.thankYouPath === 'string' ? out.body.thankYouPath : '/thanks/'
    if (out.status === 200) return NextResponse.redirect(new URL(to, req.url), 303)
    const back = new URL('/', req.url)
    back.searchParams.set('enquiry', 'error')
    return NextResponse.redirect(back, 303)
  }
  return NextResponse.json(out.body, { status: out.status, headers: { 'Cache-Control': 'no-store', ...out.headers } })
}
