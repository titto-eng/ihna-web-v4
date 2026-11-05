'use client'

// One video with sound at a time. Every player on the page (YouTube / Vimeo iframes and the course film player) registers here;
// when one starts, the others are paused. YouTube and Vimeo players report their own play events through the players' postMessage
// APIs (the embed URLs carry `enablejsapi=1` / `api=1`, src/blocks/embeds.ts), so a visitor pressing play inside an already
// loaded player is caught too. Background loops (hero videos, the course banner loop) are muted and never register.

type Player = { id: string; pause: () => void }

const players = new Map<string, Player>()
let listening = false
let seq = 0

export const newPlayerId = () => `p${++seq}-${Math.random().toString(36).slice(2, 7)}`

/** Pause every registered player except `id`. */
export function announcePlay(id: string) {
  for (const [key, p] of players) if (key !== id) p.pause()
}

export function registerPlayer(player: Player): () => void {
  players.set(player.id, player)
  return () => { players.delete(player.id) }
}

const post = (frame: HTMLIFrameElement, msg: unknown) => {
  try { frame.contentWindow?.postMessage(typeof msg === 'string' ? msg : JSON.stringify(msg), '*') } catch { /* frame gone */ }
}

const frames = new Map<string, HTMLIFrameElement>()

function onMessage(e: MessageEvent) {
  let host = ''
  try { host = new URL(e.origin).hostname } catch { return }
  if (!/youtube(-nocookie)?\.com$|vimeo\.com$/.test(host)) return
  let data: Record<string, unknown>
  try { data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data } catch { return }
  for (const [id, frame] of frames) {
    if (frame.contentWindow !== e.source) continue
    // YouTube: playerState 1 = playing (onStateChange / infoDelivery); Vimeo: event "play"
    const info = data.info as { playerState?: number } | number | undefined
    const ytPlaying = (data.event === 'onStateChange' && info === 1) || (data.event === 'infoDelivery' && typeof info === 'object' && info?.playerState === 1)
    const vimeoPlaying = data.event === 'play'
    if (data.event === 'ready' && /vimeo/.test(e.origin)) post(frame, { method: 'addEventListener', value: 'play' })
    if (ytPlaying || vimeoPlaying) announcePlay(id)
  }
}

/** Register a YouTube / Vimeo iframe: it reports its play events, and is paused when another player starts. */
export function registerFrame(frame: HTMLIFrameElement, id: string): () => void {
  if (!listening && typeof window !== 'undefined') { window.addEventListener('message', onMessage); listening = true }
  frames.set(id, frame)
  const vimeo = /vimeo\.com/.test(frame.src)
  const hello = () => {
    if (vimeo) post(frame, { method: 'addEventListener', value: 'play' })
    else post(frame, { event: 'listening', id, channel: 'widget' })
  }
  // the YouTube player answers the "listening" handshake only once it is ready: say hello a few times after load
  let tries = 0
  const timer = window.setInterval(() => { hello(); if (++tries > 8) window.clearInterval(timer) }, 500)
  frame.addEventListener('load', hello)
  hello()
  const off = registerPlayer({
    id,
    pause: () => post(frame, vimeo ? { method: 'pause' } : { event: 'command', func: 'pauseVideo', args: [] }),
  })
  return () => { window.clearInterval(timer); frame.removeEventListener('load', hello); frames.delete(id); off() }
}
