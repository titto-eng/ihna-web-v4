// /category/india/news/: the old WordPress category archive of the four root news posts (live 200, in the WordPress sitemap).
import type { Metadata } from 'next'
import { pageMetadata } from '@/components/page'
import { NewsItemsListing } from '@/components/templates/BlogListing'
import { newsListing } from '@/content/news'

export const metadata: Metadata = pageMetadata({
  title: 'News',
  path: '/category/india/news/',
  description: 'News from the Institute of Health and Nursing Australia.',
})

export default function CategoryNewsRoute() {
  return <NewsItemsListing title="News" eyebrow="Category" items={newsListing.source === 'items' ? newsListing.items : []} />
}
