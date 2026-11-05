// /our-locations/ (old WordPress page "Come meet us! Our Campuses"): the campuses with links to their pages, and the uniform shops.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, Hero, LinkTiles, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Our Campuses',
  metaTitle: 'Come meet us! Our Campuses',
  path: '/our-locations/',
  description: 'IHNA campuses in Melbourne, Sydney, Perth and Brisbane: addresses and campus pages.',
})

export default function OurLocationsRoute() {
  return (
    <>
      <Hero heading="Our Campuses" eyebrow="Come meet us!" variant="split" look="panorama" audienceSwitch={false} image={img({ src: '/images/ihna/pages/our-locations.webp', alt: 'Melbourne city skyline', width: 524, height: 655 })} />
      <CardGrid
        cards={[
          { badge: 'Perth', title: 'IHNA Perth Campus', body: 'Level 2 and 4, 12 St Georges Terrace, Perth WA 6000', href: '/ihna-perth-campus/' },
          { badge: 'Sydney', title: 'IHNA Sydney Campus', body: 'Level 7, 33 Argyle Street, Parramatta NSW 2150', href: '/ihna-sydney-campus/' },
          { badge: 'Melbourne', title: 'IHNA Melbourne Campus', body: 'Melbourne CBD: Level 4 and 10, 399 Lonsdale Street, Melbourne VIC 3000. Heidelberg: 597-599 Upper Heidelberg Road, Heidelberg Heights VIC 3081', href: '/ihna-melbourne-campus/' },
          { badge: 'Brisbane', title: 'IHNA Brisbane Campus', body: 'Level 3, 59 Adelaide Street, Brisbane QLD 4000', href: '/ihna-brisbane-campus/' },
        ]}
        columns="2"
        variant="grid"
      />
      <LinkTiles
        tone="muted"
        heading="For Uniform and Scrubs"
        items={[
          { title: 'Perth', href: 'https://www.wanneroouniforms.com.au/ihna/' },
          { title: 'Other Campuses', href: 'https://shop.fullypromoted.com.au/ihna' },
        ]}
      />
    </>
  )
}
