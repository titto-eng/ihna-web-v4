// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, IframeEmbed, Link, Rich, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Application Form',
  path: '/application-form/',
  description: 'Submit your course application through the form, our admissions team will get in touch with you shortly to assist you with the admissions process.',
})

type SearchParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

// The old template (template-application-form.php) picked the student-portal form from the portal course id (`?course_id=`)
// and the optional `?type=` (domestic | rpl); `?ihna_online=1` was passed through. Only digits are accepted for the id.
const AUTO_ENROL = [37, 31, 400]
const PD = [115, 14, 412, 353, 352, 397, 361]
const PD_IF_RPL = [389, 394]
const VET = [111, 391, 387, 396]
const VET_IF_DOMESTIC = [389, 349, 394, 395, 363, 72, 357, 358, 71, 77]

function applicationUrl(id: string, type: string | undefined, online: boolean): string {
  const n = Number(id)
  let url: string
  if (VET.includes(n) || (VET_IF_DOMESTIC.includes(n) && type === 'domestic')) {
    url = `https://student.ihna.edu.au/CrmApplications/vet_application_form?course_id=${id}&enqiry_src=301`
  } else {
    const slug = AUTO_ENROL.includes(n)
      ? 'application_form_auto_enrol'
      : PD.includes(n) || (PD_IF_RPL.includes(n) && type === 'rpl')
        ? 'pd_application_form'
        : 'quick_application_form'
    url = `https://student.ihna.edu.au/CrmEnquiries/${slug}?course_id=${id}&enqiry_src=301`
  }
  return online ? `${url}&ihna_online=1` : url
}

export default async function ApplicationFormRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const raw = first(params.course_id)
  const id = raw && /^\d{1,6}$/.test(raw) ? raw : null
  const type = first(params.type)
  const online = first(params.ihna_online) === '1'
  return (
    <>
      <Hero heading="Application Form" eyebrow="Apply online" variant="split" look="editorial" audienceSwitch={false} image={img({ src: '/images/ihna/pages/application-form.webp', alt: 'Student holding course folders', width: 1000, height: 1250 })} />
      {id ? (
        <IframeEmbed url={applicationUrl(id, type, online)} title="Application form" height={2000} />
      ) : (
        <Rich>
          <p>To apply online, please choose your course from our <Link href="/courses/">courses</Link> first. If you need help with your application, please <Link href="/contact/">contact us</Link>.</p>
        </Rich>
      )}
    </>
  )
}
