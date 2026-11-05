import { absoluteUrl } from './metadata'

// RSS 2.0 for /feed/ (the old WordPress feed URL). Pure: the route loads the posts.
export type FeedItem = { title: string; path: string; publishedAt: string; excerpt?: string | null }
export type FeedChannel = { title: string; description: string; origin: string; path?: string }

const xmlEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export function buildRss(channel: FeedChannel, items: FeedItem[]): string {
  const link = absoluteUrl(channel.path ?? '/blog/', channel.origin)
  const self = absoluteUrl('/feed/', channel.origin)
  const rows = items.map((i) => {
    const url = absoluteUrl(i.path, channel.origin)
    return [
      '<item>',
      `<title>${xmlEscape(i.title)}</title>`,
      `<link>${xmlEscape(url)}</link>`,
      `<guid isPermaLink="true">${xmlEscape(url)}</guid>`,
      `<pubDate>${new Date(i.publishedAt).toUTCString()}</pubDate>`,
      i.excerpt ? `<description>${xmlEscape(i.excerpt)}</description>` : '',
      '</item>',
    ].join('')
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>',
    `<title>${xmlEscape(channel.title)}</title>`,
    `<link>${xmlEscape(link)}</link>`,
    `<atom:link href="${xmlEscape(self)}" rel="self" type="application/rss+xml"/>`,
    `<description>${xmlEscape(channel.description)}</description>`,
    '<language>en-AU</language>',
    ...rows,
    '</channel></rss>',
  ].join('\n')
}
