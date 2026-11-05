// News post (WordPress post, root-level URL): Article layout with NewsArticle JSON-LD; text as migrated.
import type { Metadata } from 'next'
import { pageMetadata, Article, Hero } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'A Call to Protect Australia’s Healthcare Future',
  path: '/a-call-to-protect-australias-healthcare-future/',
  description: 'As the CEO of HCI Australia, Dr. Bijo Kunnumpurath is raising urgent concerns about the recent government decision to cap international students…',
})

export default function ACallToProtectAustraliasHealthcareFutureRoute() {
  return (
    <>
      <Hero heading="A Call to Protect Australia’s Healthcare Future" variant="compact" audienceSwitch={false} eyebrow="News" />
      <Article
        title="A Call to Protect Australia’s Healthcare Future"
        path="/a-call-to-protect-australias-healthcare-future/"
        published="2024-09-03"
        date="03 September 2024"
        image={{ src: '/images/ihna/uploads/2024/09/Website-Blog-Banner-1-300x200.png', alt: 'A Call to Protect Australia’s Healthcare Future', width: 300, height: 200 }}
        imageFit="contain"
        source={{ href: 'https://www.linkedin.com/pulse/call-protect-australias-healthcare-future-dr-bijo-kunnumpurath-mmm6c/?trackingId=MhfIfM9eQ8SPdsDERfixwg%3D%3D', label: 'Read the Full Article' }}
        description="As the CEO of HCI Australia, Dr. Bijo Kunnumpurath is raising urgent concerns about the recent government decision to cap international students…"
      >
        <p>As the CEO of HCI Australia, <strong>Dr. Bijo Kunnumpurath</strong> is raising urgent concerns about the recent government decision to cap international students, particularly its impact on nursing education. This policy could exacerbate a looming crisis in our healthcare system by limiting the number of qualified nurses entering the workforce. In this article, <strong>Dr. Bijo Kunnumpurath</strong> explores the potential consequences of this decision and advocates for strategic exemptions to protect and expand nursing education. Drawing on insights from the Universities Accord, he underscores the need to support our healthcare sector during these challenging times. Now is the time to act—read on to understand how these changes could shape the future of healthcare in Australia.</p>
      </Article>
    </>
  )
}
