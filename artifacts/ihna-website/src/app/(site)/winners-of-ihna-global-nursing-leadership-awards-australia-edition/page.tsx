// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Checklist, FigureGrid, Hero, SplitProse, Statement } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Winners of IHNA Global Nursing Leadership Awards (Australia Edition)',
  path: '/winners-of-ihna-global-nursing-leadership-awards-australia-edition/',
  description: 'We want to send a big thank you to everyone who sent their applications in for our IHNA Global Nursing Leadership Award 2022 and helped make it a success!',
})

export default function WinnersOfIhnaGlobalNursingLeadershipAwardsAustraliaEditionRoute() {
  return (
    <>
      <Hero heading="Winners of IHNA Global Nursing Leadership Awards (Australia Edition)" variant="compact" audienceSwitch={false} />
      <SplitProse eyebrow="Global Nursing Leadership Awards 2022" heading="Thank you to *every nominee*">
        <p>We want to send a big thank you to everyone who sent their applications in for our IHNA Global Nursing Leadership Award 2022 and helped make it a success!</p>
        <p>We were overwhelmed by the number of applications we received from nurses all over the world. And we are glad to say you were selected by our Panel of Jury amongst the 136 applications for the Australian edition of this award.</p>
        <p>We would like to congratulate our 5 winners from the Australia Edition.</p>
      </SplitProse>
      <FigureGrid
        tone="muted"
        heading="Our 5 winners from the *Australia Edition*"
        images={[
          { src: '/images/ihna/theme/award-winners-aus/arun.png', alt: 'Congratulations Arun Thomas, Aspen Medical Pty Ltd', width: 729, height: 729 },
          { src: '/images/ihna/theme/award-winners-aus/jesny.png', alt: 'Congratulations Jesny Anand, Epworth Eastern Hospital', width: 729, height: 729 },
          { src: '/images/ihna/theme/award-winners-aus/joseph.png', alt: 'Congratulations Joseph Jennings, Nambour General Hospital', width: 729, height: 729 },
          { src: '/images/ihna/theme/award-winners-aus/beena.png', alt: 'Congratulations Beena Gopinathan Pillai, Nepean Blue Mountain LHD', width: 729, height: 729 },
          { src: '/images/ihna/theme/award-winners-aus/maya.png', alt: 'Congratulations Maya Sajan Narekat, Monash Health', width: 729, height: 729 },
        ]}
      />
      <Checklist
        heading="Commendation Award"
        intro="Our jury had a hard time in shortlisting 5 winner, seeing their dedication towards mankind our jury decided to go ahead and award more five nurses with a commendation Award instead."
        items={['Sunu Simon', 'Mohammed Mubarak Meera Sahib', 'Smitha Sukumaran Nair', 'Sreeja Sanjai', 'Anisha Mani']}
      />
      <Statement
        tone="default"
        lead="Your courage and strength in the fight against COVID-19 was admirable. In addition, your selflessness is immeasurable, and we cannot thank you enough for your efforts during this pandemic."
        quote="Again, CONGRATULATIONS to the winners and the commendation award holders of the IHNA Global Nursing Leadership Award (Australia Edition)"
      >
        <p>IHNA looks forward to helping you realise your nursing dreams.</p>
      </Statement>
    </>
  )
}
