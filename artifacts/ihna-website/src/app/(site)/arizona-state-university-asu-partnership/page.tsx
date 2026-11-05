// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, FigureGrid, Hero, ImageText, img, LogoBadge, Rich, VideoEmbed } from '@/components/page'

const R = '/images/ihna/theme/cintana-partnership-assets'

export const metadata: Metadata = pageMetadata({
  title: 'Arizona State University (ASU) Partnership',
  path: '/arizona-state-university-asu-partnership/',
  description: 'Our collaboration with Arizona State University (ASU) opens a wealth of global learning opportunities for our students. This partnership allows students…',
})

export default function ArizonaStateUniversityAsuPartnershipRoute() {
  return (
    <>
      <Hero heading="Arizona State University (ASU) Partnership: What Global Learning Opportunities Await?" variant="compact" audienceSwitch={false} />
      <LogoBadge label="Powered by" logo={{ src: '/images/ihna/theme/asu.webp', alt: 'Arizona State University', width: 216, height: 157 }} />
      <FigureGrid
        tone="muted"
        heading="ASU’s Impressive Rankings"
        images={[
          { src: `${R}/asu-ranking-5.png`, width: 564, height: 821 },
          { src: `${R}/asu-ranking-2.png`, width: 560, height: 990 },
          { src: `${R}/asu-ranking-3.png`, width: 564, height: 994 },
          { src: `${R}/asu-ranking-4.png`, width: 560, height: 990 },
        ]}
      />
      <VideoEmbed url="https://www.youtube.com/watch?v=6V83dIgshrY" title="Judy Karshmer on Pioneering Partnership: HCI, ASU, and Ramsay Health Care" />
      <Rich>
        <p>Our collaboration with Arizona State University (ASU) opens a wealth of global learning opportunities for our students. This partnership allows students to study abroad at ASU campuses in Phoenix, Washington D.C., or Los Angeles, providing them with a diverse and enriching educational experience. ASU’s recognition as the most innovative university in the U.S. ensures that our students benefit from cutting-edge educational models and research excellence. The opportunity to study at ASU not only broadens students’ perspectives but also allows them to immerse themselves in different cultures and gain a global network of peers and professionals, enhancing their academic journey and personal growth.</p>
      </Rich>
      <ImageText media={img({ src: '/images/ihna/theme/cintana-launch-day.webp', alt: '', width: 600, height: 422 })} imageSide="right">
        <h2>What unique programs are available through this partnership?</h2>
        <p>These programs offer a unique blend of academic excellence and practical experience, making our graduates highly competitive in the global job market. The dual degree programs are designed to provide comprehensive education, combining the strengths of both institutions and offering students a diverse range of courses and experiences. Additionally, ASU’s extensive online curriculum accelerates our digital learning capabilities, making high-quality education more accessible to our students. This flexibility allows students to balance their studies with other commitments and continue their education from anywhere in the world, ensuring they receive a well-rounded and robust education.</p>
      </ImageText>
      <ImageText media={img({ src: '/images/ihna/theme/faculty-benefits.webp', alt: '', width: 600, height: 422 })} imageSide="left">
        <h2>How do faculty benefit from this collaboration?</h2>
        <p>Faculty members have significant opportunities to collaborate with ASU’s renowned academics on research projects, enhancing their professional growth and contributing to groundbreaking research. These collaborations foster innovation and drive advancements in healthcare education, allowing faculty to stay at the forefront of their fields. Faculty can also participate in professional development programs, enhancing their teaching skills and staying updated on the latest educational trends and practices. This continuous professional growth ensures that our educators can provide the highest quality education to our students, incorporating the latest research findings and innovative teaching methods into their instruction.</p>
      </ImageText>
    </>
  )
}
