// Content from the live page (template-contact.php as rendered on live). This file is the page: edit it freely.
// ContactPage adds the campus links from the CMS and the enquiry form (#quickContact) after this content.
import type { Metadata } from 'next'
import { pageMetadata, ContactCards, Link, SplitProse } from '@/components/page'
import { ContactPage } from '@/components/templates/pages'

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us',
  path: '/contact/',
  description: 'Get an answer on courses, costs, careers as well as facilities, entry requirements or just about anything else relating to studying at IHNA.',
})

export default function ContactRoute() {
  return (
    <ContactPage
      title="Contact Us"
      path="/contact/"
      hero={{
        eyebrow: 'Come talk to us!',
        heading: 'Contact Us',
        subheading: 'Get an answer on courses, costs, careers as well as facilities, entry requirements or just about anything else relating to studying at IHNA. We are here to help you!',
        variant: 'compact',
        ctas: [
          { label: 'Call 1800 22 52 83', href: 'tel:1800225283', style: 'primary' },
          { label: 'Email us', href: 'mailto:enquiry@ihna.edu.au', style: 'secondary' },
        ],
      }}
    >
      <ContactCards
        tone="default"
        eyebrow="Visit us"
        heading="Our *campuses*"
        cards={[
          { title: 'Melbourne CBD', lines: ['Level 4 and 10, 399 Lonsdale Street, Melbourne', 'VIC 3000, Australia'], phone: '+61 3 9455 4444', email: 'enquiry@ihna.edu.au' },
          { title: 'Melbourne Heidelberg', lines: ['597-599 Upper Heidelberg Road, Heidelberg Heights', 'VIC 3081, Australia'], phone: '+61 3 9450 5100', email: 'enquiry@ihna.edu.au' },
          { title: 'Perth CBD', lines: ['Level 2 and 4, 12 St Georges Terrace, Perth', 'WA 6000, Australia'], phone: '+61 8 6212 8200', email: 'enquiry@ihna.edu.au' },
          { title: 'Sydney', lines: ['Level 7, 33 Argyle Street, Parramatta', 'NSW 2150, Australia'], phone: '+61 2 8228 6400', email: 'enquiry@ihna.edu.au' },
          { title: 'Brisbane', lines: ['Level 3, 59 Adelaide Street, Brisbane', 'QLD 4000, Australia'], phone: '+61 7 3123 4000', email: 'enquiry@ihna.edu.au' },
        ]}
      />
      <SplitProse tone="muted" eyebrow="Talk to us" heading="Global contact *numbers*">
        <h2>Global contact numbers</h2>
        <ul>
          <li>From within Australia: <a href="tel:1800225283">1800 225 283</a></li>
          <li>From outside Australia: <a href="tel:+61394554462">+61 3 9455 4462</a></li>
        </ul>
        <h3>Virtual meeting</h3>
        <p>Please call us at <a href="tel:1800225283">1800 22 52 83</a> or email us at <a href="mailto:enquiry@ihna.edu.au">enquiry@ihna.edu.au</a> to schedule a virtual meeting with our consultants.</p>
        <h3>Campus tour</h3>
        <p>You can contact the campus or email us at <a href="mailto:enquiry@ihna.edu.au">enquiry@ihna.edu.au</a> to schedule a campus tour.</p>
        <h3>Registered agents</h3>
        <p><a href="https://online.fliphtml5.com/wmka/utdk/" rel="noopener noreferrer">View our registered agent list</a></p>
      </SplitProse>
      <SplitProse eyebrow="Get in touch" heading="Who to *contact*">
        <h3>IHNA potential student</h3>
        <p>As you prepare to study, it’s only normal to have a lot of questions. It’s easy to gather the answers you need with IHNA’s extensive support offerings. So don’t hold back! We’re here to help you with everything you need, whether it’s course guidance, application help, or any other assistance.</p>
        <p>Email: <a href="mailto:enquiry@ihna.edu.au">enquiry@ihna.edu.au</a></p>
        <h3>IHNA students support</h3>
        <p>Have questions related to your assignments, assessments, due dates, library access, extensions and any other academic / student support services? Please feel free to reach out to us by email, chatbot or phone.</p>
        <p>Email: <a href="mailto:studentsupport@ihna.edu.au">studentsupport@ihna.edu.au</a></p>
        <h3>IHNA institutional partnership</h3>
        <p>Through international campuses and international partnerships, we hope to expand our physical and virtual presence. To do so, we’re looking for high-quality partners that share IHNA’s passion for providing a good student experience. Please contact IHNA to learn more about being a transnational education partner with IHNA.</p>
        <p>Email: <a href="mailto:mail@ihna.edu.au">mail@ihna.edu.au</a></p>
        <h3>Meet our Founder &amp; Managing Director</h3>
        <p>Dr Bijo Kunnumpurath is the Founder, Managing Director and CEO of HCI Australia. His demonstrated passion towards education, entrepreneurship and technology has shaped the vision of HCI Australia. <Link href="/meet-our-founder-and-md/">Meet Dr Bijo</Link></p>
      </SplitProse>
    </ContactPage>
  )
}
