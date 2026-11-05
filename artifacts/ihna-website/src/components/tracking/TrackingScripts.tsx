'use client'

import { GoogleTagManager } from '@next/third-parties/google'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { activeTags, hubspotScriptUrl, type TrackingConfig } from './config'
import { pageViewVirtual, pushDataLayer } from './datalayer'

/** Applies per-path overrides and exclusions (80 §2) and reports client-side navigations as `page_view_virtual`. */
export function TrackingScripts({ config }: { config: TrackingConfig }) {
  const pathname = usePathname() ?? '/'
  const tags = activeTags(config, pathname)
  const first = useRef(true)

  useEffect(() => {
    // The first load is a real page view; only route changes are virtual. Pushes happen even when tags are off (tests).
    if (first.current) {
      first.current = false
      return
    }
    pushDataLayer(pageViewVirtual(pathname, document.title))
  }, [pathname])

  return (
    <>
      {tags.gtmId && (
        <>
          <GoogleTagManager key={tags.gtmId} gtmId={tags.gtmId} />
          <noscript>
            <iframe src={`https://www.googletagmanager.com/ns.html?id=${tags.gtmId}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="Google Tag Manager" />
          </noscript>
        </>
      )}
      {tags.clarityId && (
        <Script id="clarity-script" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(tags.clarityId)});`}
        </Script>
      )}
      {tags.hubspot && <Script id="hs-script-loader" src={hubspotScriptUrl(tags.hubspot)} strategy="lazyOnload" async defer />}
      {tags.livechatLicence && (
        <Script id="livechat-script" strategy="lazyOnload">
          {`window.__lc=window.__lc||{};window.__lc.license=${JSON.stringify(tags.livechatLicence)};(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)}};!n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e}(window,document,[].slice));`}
        </Script>
      )}
      {tags.metaPixelIds.map((pixelId) => (
        <Script key={pixelId} id={`meta-pixel-${pixelId}`} strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(pixelId)});fbq('track','PageView');`}
        </Script>
      ))}
      {tags.airgentic && (
        <Script
          id="airgentic-script"
          src="https://chat.airgentic.com/_js/airgentic-1.4.js"
          data-account-id={tags.airgentic.accountId}
          data-service-id={tags.airgentic.serviceId}
          strategy="lazyOnload"
        />
      )}
    </>
  )
}
