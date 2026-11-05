'use client'

import { Suspense, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { PublicFormDef } from '@/lib/enquiries/types'
import { site } from '@/content/site'
import { EnquiryFormClient } from './EnquiryFormClient'

type Option = { value: string; label: string }
export type DialogView = { def: PublicFormDef; campuses: Option[]; courses: Option[] }

export const ENQUIRE_EVENT = 'ihm:enquire'
const TITLES: Record<string, string> = site.enquiryDialog.titles
const PATH_DEFAULTS = site.enquiryDialog.pathDefaults.map((d) => ({ re: new RegExp(d.pattern), key: d.key }))

/** `?enquire=1` picks the default for the page; `?enquire=<formKey>` picks that form when the dialog carries it. */
export function pickKey(param: string | null, pathname: string, have: string[]): string | null {
  if (param && have.includes(param)) return param
  const byPath = PATH_DEFAULTS.find((d) => d.re.test(pathname) && have.includes(d.key))?.key
  const fallback = byPath ?? site.enquiryDialog.defaultKey
  return have.includes(fallback) ? fallback : (have[0] ?? null)
}

function Inner({ views }: { views: Record<string, DialogView> }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const have = Object.keys(views)
  const enquire = params.get('enquire')
  // `fromEvent`: opened by the WhatsApp button or code. `dismissed`: the `?enquire=` value the visitor closed (the URL is cleaned a moment later).
  const [fromEvent, setFromEvent] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState<string | null>(null)
  const [seen, setSeen] = useState({ enquire, pathname })
  if (seen.enquire !== enquire || seen.pathname !== pathname) {
    // The query changed or the route did (a thank-you page, a link): start from a clean state.
    setSeen({ enquire, pathname })
    setDismissed(null)
    if (seen.pathname !== pathname) setFromEvent(null)
  }

  useEffect(() => {
    const onOpen = (e: Event) => setFromEvent(pickKey((e as CustomEvent<{ key?: string }>).detail?.key ?? null, window.location.pathname, have))
    window.addEventListener(ENQUIRE_EVENT, onOpen)
    return () => window.removeEventListener(ENQUIRE_EVENT, onOpen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Opens on the query or an event only, never on load by itself: header CTA and shared links are `?enquire=1`.
  const fromQuery = enquire && enquire !== dismissed ? pickKey(enquire, pathname, have) : null
  const key = fromEvent ?? fromQuery
  const view = key ? views[key] : null

  const close = () => {
    setFromEvent(null)
    setDismissed(enquire)
    if (enquire) {
      const q = new URLSearchParams(window.location.search)
      q.delete('enquire')
      router.replace(`${pathname}${q.size ? `?${q}` : ''}`, { scroll: false })
    }
  }

  return (
    <Dialog open={Boolean(view)} onOpenChange={(o) => { if (!o) close() }}>
      {view && (
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl" data-testid="enquiry-dialog" data-form-key={view.def.key}>
          <DialogTitle className="display text-2xl">{TITLES[view.def.key] ?? view.def.name}</DialogTitle>
          <DialogDescription>Leave your details and we will get back to you.</DialogDescription>
          <EnquiryFormClient def={view.def} campuses={view.campuses} courses={view.courses} layout="sidebar" className="relative" />
        </DialogContent>
      )}
    </Dialog>
  )
}

export function EnquiryDialogClient({ views }: { views: Record<string, DialogView> }) {
  return (
    <Suspense fallback={null}>
      <Inner views={views} />
    </Suspense>
  )
}
