'use client'

import { MessageCircle } from 'lucide-react'
import { ENQUIRE_EVENT } from '@/components/forms/EnquiryDialogClient'

// Floating button, bottom right. Hidden while `site.whatsappNumber` (src/content/site.ts) is empty. It opens the `whatsapp` enquiry form in the
// site-wide dialog; the form's thank-you is the click-to-chat link built server-side from the same number (DEC-4).
export function WhatsAppButton({ number }: { number?: string | null }) {
  if (!number || !number.replace(/\D/g, '')) return null
  return (
    <button
      type="button"
      aria-label="Chat with us on WhatsApp"
      data-testid="whatsapp-button"
      onClick={() => window.dispatchEvent(new CustomEvent(ENQUIRE_EVENT, { detail: { key: 'whatsapp' } }))}
      // above the mobile CTA bar of course pages (h-[72px], z-40)
      className="fixed right-4 bottom-24 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:outline-none lg:bottom-6 lg:right-6"
    >
      <MessageCircle aria-hidden className="size-7" />
    </button>
  )
}
