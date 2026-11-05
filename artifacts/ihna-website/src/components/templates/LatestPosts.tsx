import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { PostCard } from './BlogListing'
import { getLatestPosts } from './data'

// "Latest blogs" (old `[LatestBlogs]` shortcode: the newest posts with image, title, excerpt): /latest-blogs/, /blog/thanks/, or any
// page that wants it. Reads the posts collection (cached under the posts tags).
export async function LatestPosts({ count = 3, heading, eyebrow, as = 'h2' }: { count?: number; heading?: string; eyebrow?: string; as?: 'h1' | 'h2' }) {
  const posts = await getLatestPosts(count)
  // a page whose h1 this is still renders its heading and an empty notice until the App Runner import has run
  if (!posts.length) {
    if (as !== 'h1') return null
    return (
      <Section tone="default">
        {heading && <h1 className="display mb-10 text-display-md">{heading}</h1>}
        <p className="rounded-card border border-dashed border-border bg-card p-8 text-muted-foreground">New posts will appear here.</p>
      </Section>
    )
  }
  return (
    <Section tone="default">
      {heading && (as === 'h1' ? <h1 className="display mb-10 text-display-md">{heading}</h1> : <SectionHeader eyebrow={eyebrow} heading={heading} />)}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </Section>
  )
}
