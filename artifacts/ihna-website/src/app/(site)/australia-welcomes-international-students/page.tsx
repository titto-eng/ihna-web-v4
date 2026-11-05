// News post (WordPress post, root-level URL): Article layout with NewsArticle JSON-LD; text as migrated.
import type { Metadata } from 'next'
import { pageMetadata, Article, Hero } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Australia Welcomes International Students',
  path: '/australia-welcomes-international-students/',
  description: 'Australia all set to welcome skilled workers and Visa holders after twenty months of border closure. From December 1, fully vaccinated eligible visa…',
})

export default function AustraliaWelcomesInternationalStudentsRoute() {
  return (
    <>
      <Hero heading="Australia Welcomes International Students" variant="compact" audienceSwitch={false} eyebrow="News" />
      <Article
        title="Australia Welcomes International Students"
        path="/australia-welcomes-international-students/"
        published="2021-11-23"
        date="23 November 2021"
        image={{ src: '/images/ihna/uploads/ihna-news/619d9bb747a77-619ccf18530f4-Australia_Welcomes_International_Students.png', alt: 'Australia Welcomes International Students', width: 852, height: 484 }}
        description="Australia all set to welcome skilled workers and Visa holders after twenty months of border closure. From December 1, fully vaccinated eligible visa…"
      >
        <p>Australia all set to welcome skilled workers and Visa holders after twenty months of border closure. From December 1, fully vaccinated eligible visa holders can enter Australia without needing to apply for a travel exemption. Tourists, travellers, skilled migrants, and overseas students will be able to fly in for the summer as a result of the decision. The Home Affairs website has a complete list of the 28 visa holders that are eligible.</p>
        <p>Anyone planning a trip to Australia must be fully vaccinated and have a negative PCR test within three days before leaving. Only New South Wales, Victoria, and the Australian Capital Territory will allow visitors to fly in without being quarantined due to differing legislation in each state and territory. If you’re planning to Study in Australia or already are a student and were studying online this is the time to come back to Australia and experience the best of it. This comes as great news for those students currently studying IHNA courses online as they will now be able to join their course on-campus in Australia as on-site education will recommence and classrooms will be open. We encourage all students to get vaccinated as full vaccination will be required for international arrivals to enter Australia without quarantine. Students should contact their IHM counsellor or recruitment agent to review their plans and finalise their enrolment. IHNA is looking forward to welcome students from all over the world to come and study with us and at the same time experience the best of Australia.</p>
      </Article>
    </>
  )
}
