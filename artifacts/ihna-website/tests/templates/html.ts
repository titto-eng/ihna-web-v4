import type { ReactElement } from 'react'
import { renderToReadableStream } from 'react-dom/server'

// Server components may be async (RenderBlocks, data blocks): render through Fizz, which awaits them, and return the HTML.
export async function html(ui: ReactElement): Promise<string> {
  const stream = await renderToReadableStream(ui)
  await stream.allReady
  // Next adds the trailing slash (`trailingSlash: true`) and React separates text nodes with comments; the bare renderer does neither.
  const text = (await new Response(stream).text()).replace(/<!-- -->/g, '')
  return text.replace(/href="(\/[^"?#]*)([?#][^"]*)?"/g, (m, p: string, rest = '') => (p.endsWith('/') || /\.[a-z0-9]+$/i.test(p) ? m : `href="${p}/${rest}"`))
}

export const count = (markup: string, re: RegExp) => (markup.match(re) ?? []).length
