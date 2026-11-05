// News post (WordPress post, root-level URL): Article layout with NewsArticle JSON-LD; text as migrated.
import type { Metadata } from 'next'
import { pageMetadata, Article, Hero } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Celebrating NAIDOC Week with IHNA Australia',
  path: '/celebrating-naidoc-week-with-ihna-australia/',
  description: 'As we honour NAIDOC Week, we invite you to join us in celebrating the rich cultural heritage and contributions of Aboriginal and Torres Strait Islander…',
})

export default function CelebratingNaidocWeekWithIhnaAustraliaRoute() {
  return (
    <>
      <Hero heading="Celebrating NAIDOC Week with IHNA Australia" variant="compact" audienceSwitch={false} eyebrow="News" />
      <Article
        title="Celebrating NAIDOC Week with IHNA Australia"
        path="/celebrating-naidoc-week-with-ihna-australia/"
        published="2024-07-25"
        date="25 July 2024"
        image={{ src: '/images/ihna/uploads/2024/07/NAIDOC-1.jpg', alt: 'Celebrating NAIDOC Week with IHNA Australia', width: 1018, height: 720 }}
        source={{ href: 'https://www.linkedin.com/pulse/celebrating-naidoc-week-dr-bijo-kunnumpurath-gztfc/', label: 'Read the Full Article' }}
        description="As we honour NAIDOC Week, we invite you to join us in celebrating the rich cultural heritage and contributions of Aboriginal and Torres Strait Islander…"
      >
        <p>As we honour NAIDOC Week, we invite you to join us in celebrating the rich cultural heritage and contributions of Aboriginal and Torres Strait Islander peoples. Our CEO &amp; Managing Director, Dr. Bijo Kunnumpurath, has penned an insightful article reflecting on this important occasion and the strides our organisation has made in promoting and supporting Indigenous culture and communities.</p>
        <p>In his article, Dr. Bijo Kunnumpurath highlights the significance of NAIDOC Week, shares our recent initiatives, and outlines our future commitments to fostering inclusivity and cultural competence. From the establishment of our Aboriginal and Torres Strait Islander Education and Support Committee to the introduction of scholarships and cultural competency training, we are dedicated to making a meaningful impact.</p>
      </Article>
    </>
  )
}
