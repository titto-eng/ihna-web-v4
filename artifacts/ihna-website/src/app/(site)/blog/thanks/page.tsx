// Thank-you page of the blog enquiry form (`blog-enquiry`, old template-blog-thanks.php), with the recent posts. Not indexed.
import type { Metadata } from 'next'
import { pageMetadata, Hero, ThankYouCard } from '@/components/page'
import { LatestPosts } from '@/components/templates/LatestPosts'
import { site } from '@/content/site'

const telHref = (n: string) => `tel:${n.replace(/[^+\d]/g, '')}`

export const metadata: Metadata = pageMetadata({
  title: 'Thanks',
  metaTitle: 'IHNA Blogs',
  path: '/blog/thanks/',
  description: 'Thank you for your enquiry. One of our representatives will get back to you soon.',
  noindex: true,
})

export default function BlogThanksRoute() {
  return (
    <>
      <Hero heading="Thank you for your enquiry." variant="compact" audienceSwitch={false} eyebrow="Blog" />
      <ThankYouCard phone={null} email={null}>
        <p>
          One of our representatives will get back to you soon.
          {site.phone && <> If you would like to talk to us now, call <a href={telHref(site.phone)}>{site.phone}</a></>}
          {site.email && <> or email <a href={`mailto:${site.email}`}>{site.email}</a></>}.
        </p>
      </ThankYouCard>
      <LatestPosts count={3} heading="Recent posts" eyebrow="Blog" />
    </>
  )
}
