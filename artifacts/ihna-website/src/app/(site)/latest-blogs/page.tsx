// /latest-blogs/: the old `[LatestBlogs]` shortcode page, the three newest posts.
import type { Metadata } from 'next'
import { pageMetadata } from '@/components/page'
import { LatestPosts } from '@/components/templates/LatestPosts'

export const metadata: Metadata = pageMetadata({
  title: 'Latest blogs',
  path: '/latest-blogs/',
  description: 'The latest posts from the IHNA blog.',
})

export default function LatestBlogsRoute() {
  return <LatestPosts count={3} heading="Latest blogs" as="h1" />
}
