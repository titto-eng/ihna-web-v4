import type { Metadata } from 'next'
import { Hero, Link, ThankYouCard, pageMetadata } from '@/components/page'

// /study-at-ihna/domestic/phone_number_validation/: an old utility page (a bare phone field for testing the landing pages' phone
// widget). Its URL stays 200 (urls.csv, static); the forms now validate phone numbers themselves, so the page only says so. Noindex.
export const metadata: Metadata = pageMetadata({ title: 'Phone number check', path: '/study-at-ihna/domestic/phone_number_validation/', noindex: true })

export default function PhoneNumberValidationPage() {
  return (
    <>
      <Hero variant="compact" heading="Phone number check" audienceSwitch={false} />
      <ThankYouCard icon="info" phone={null}>
        <p>Phone numbers are checked by each enquiry form when you send it. To talk to us, call 1800 22 52 83 or use the <Link href="/study-at-ihna/course-enquiry-ihna/">course enquiry form</Link>.</p>
      </ThankYouCard>
    </>
  )
}
