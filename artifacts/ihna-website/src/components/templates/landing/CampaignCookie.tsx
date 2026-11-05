'use client'

import { useEffect } from 'react'
import { site } from '@/content/site'

// `/lp/<slug>/<campaign-code>/` (60 §4, 41): the code goes into the first-party attribution cookie (`site.attributionCookies.last`), merged with what is
// already there (last touch wins), then the enquiry form reads it. Value: JSON of validated keys, each at most 200 characters.
const COOKIE = site.attributionCookies.last
const MAX_AGE = 60 * 60 * 24 * 90
const CODE = /^[A-Za-z0-9_-]{2,64}$/

export function CampaignCookie({ code }: { code: string }) {
  useEffect(() => {
    if (!CODE.test(code)) return
    try {
      const old = document.cookie.split('; ').find((c) => c.startsWith(`${COOKIE}=`))
      let value: Record<string, string> = {}
      if (old) {
        const parsed: unknown = JSON.parse(decodeURIComponent(old.slice(COOKIE.length + 1)))
        if (parsed && typeof parsed === 'object') value = Object.fromEntries(Object.entries(parsed).filter(([, v]) => typeof v === 'string' && v.length <= 200)) as Record<string, string>
      }
      value.campaign = code
      const secure = window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`
    } catch {
      /* cookies blocked: the form still reads ?campaign= from the URL */
    }
  }, [code])
  return null
}
