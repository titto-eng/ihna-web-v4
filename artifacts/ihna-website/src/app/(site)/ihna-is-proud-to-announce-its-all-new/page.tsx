// News post (WordPress post, root-level URL): Article layout with NewsArticle JSON-LD; text as migrated.
import type { Metadata } from 'next'
import { pageMetadata, Article, Hero, Link } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'IHNA is proud to announce its all-new',
  path: '/ihna-is-proud-to-announce-its-all-new/',
  description: 'With IHNA’s HLT54121-Diploma of Nursing, you can start a rewarding career as an enrolled nurse with the opportunity to work anywhere in Australia, knowing…',
})

export default function IhnaIsProudToAnnounceItsAllNewRoute() {
  return (
    <>
      <Hero heading="IHNA is proud to announce its all-new" variant="compact" audienceSwitch={false} eyebrow="News" />
      <Article
        title="IHNA is proud to announce its all-new"
        path="/ihna-is-proud-to-announce-its-all-new/"
        published="2022-01-21"
        date="21 January 2022"
        image={{ src: '/images/ihna/uploads/ihna-news/61ea806ac831f-DON.png', alt: 'HLT54121 Diploma of Nursing', width: 1600, height: 1600 }}
        imageFit="contain"
        description="With IHNA’s HLT54121-Diploma of Nursing, you can start a rewarding career as an enrolled nurse with the opportunity to work anywhere in Australia, knowing…"
      >
        <p>With IHNA’s HLT54121-Diploma of Nursing, you can start a rewarding career as an enrolled nurse with the opportunity to work anywhere in Australia, knowing the high demand for enrolled nurses. This course will teach you the fundamental skills and the knowledge you’ll need to work as a nurse in the fast-paced healthcare industry.</p>
        <p>Under the supervision of a certified nurse, you’ll learn to provide acute, preventative, curative, and rehabilitative care. In our ward simulation labs, you will receive hands-on learning experience and clinical experience over 400 hours of practical placements. Enrol at a cutting-edge facility that caters to your educational needs. With trained Nurse Educators, support staff, highly advanced nursing labs, libraries, classrooms, and an online interactive learning platform with 24/7 student support online, we provide a great setting in which you can accomplish your studies. Upon successful registration with NMBA graduates may gain employment in various healthcare facilities, which may include:</p>
        <ul>
          <li>Hospitals</li>
          <li>Day respite centres</li>
          <li>Rehabilitation centres</li>
          <li>Residential group homes</li>
          <li>Medical centres</li>
          <li>Training resource centres</li>
          <li>Open employment services</li>
          <li>Other community settings and clients’ homes</li>
        </ul>
        <p>Let’s take a step ahead towards a rewarding career in nursing and get in touch with our super friendly consultants, who are more than happy to answer all your questions</p>
        <h3>Admissions are open now!</h3>
        <p>For more details: <Link href="/courses/diploma-of-nursing/">https://ihna.edu.au/courses/diploma-of-nursing/</Link></p>
        <p><a href="tel:1800225283">1800 22 52 83</a></p>
        <p><a href="mailto:enquiry@ihna.edu.au">enquiry@ihna.edu.au</a></p>
      </Article>
    </>
  )
}
