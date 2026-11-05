'use client'

import { useEffect, useRef, type IframeHTMLAttributes } from 'react'
import { newPlayerId, registerFrame } from './exclusivePlayback'

/** A YouTube / Vimeo iframe that pauses the page's other videos when it plays, and is paused when another one starts. */
export function ExclusiveFrame(props: IframeHTMLAttributes<HTMLIFrameElement>) {
  const ref = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerFrame(el, newPlayerId())
  }, [])
  return <iframe ref={ref} {...props} />
}
