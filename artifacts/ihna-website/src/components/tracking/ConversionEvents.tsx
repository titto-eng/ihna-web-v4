'use client'

import { useEffect, useRef } from 'react'
import { brochureDownload, eventRegistration, generateLead, pushDataLayer, pushOnce, purchase, takeEnquiry, thankYouView, type PurchaseInput } from './datalayer'

/**
 * Drop into every thank-you page. With a stored enquiry it pushes one `generate_lead` (or `brochure_download`) and clears it,
 * so a reload adds nothing; a direct visit pushes only `thank_you_view`. Event registrations name their slug.
 */
export function ThankYouEvent({ kind = 'lead', eventSlug }: { kind?: 'lead' | 'brochure' | 'event'; eventSlug?: string }) {
  const done = useRef(false) // React strict mode runs effects twice in dev; the stored enquiry is cleared on first read
  useEffect(() => {
    if (done.current) return
    done.current = true
    const stored = takeEnquiry()
    if (kind === 'event' && eventSlug) return void pushDataLayer(eventRegistration({ eventSlug }))
    if (!stored) return void pushDataLayer(thankYouView(window.location.pathname))
    pushDataLayer(kind === 'brochure' ? brochureDownload(stored) : generateLead(stored))
  }, [kind, eventSlug])
  return null
}

/** `/pay/result/[uuid]` once paid (every gateway return redirects there). Props come from the `payments` row (`purchaseEventFor`); one push per transaction. */
export function PurchaseEvent(props: PurchaseInput) {
  const { transactionId } = props
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    pushOnce(`purchase:${transactionId}`, purchase(props))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId])
  return null
}
