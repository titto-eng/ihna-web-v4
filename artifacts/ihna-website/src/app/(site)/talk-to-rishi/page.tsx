// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, Statement, ValueCards } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Talk to Rishi',
  path: '/talk-to-rishi/',
  description: 'Our expert counsellors are at hand to help you make the right decisions. Get the advice you need, when you need it!',
})

export default function TalkToRishiRoute() {
  return (
    <>
      <Hero heading="Need help?" variant="compact" audienceSwitch={false} />
      <Statement tone="default" title="Talk to Rishi !" quote="Our expert counsellors are at hand to help you make the right decisions. Get the advice you need, when you need it!" />
      <ValueCards
        heading="Rishi chatbot can handle the following issues"
        columns={4}
        items={[
          { title: 'Academic', body: <p>Get assistance if you need any assistance in Assessment Extension, Withdrawal, Defferal and Course Extension.</p> },
          { title: 'Administration', body: <p>Get assistance if you have any specific questions about your course, units or assessments.</p> },
          { title: 'IT Support', body: <p>We’ve got all your IT essentials covered.From accessing services, to printing support and technical help.</p> },
          { title: 'Finance', body: <p>We can help you make a financial plan, with your budgeting or to apply for financial support.</p> },
          { title: 'Job', body: <p>You can submit your CV and details here so that we can assist you in finding jobs</p> },
          { title: 'Complaints', body: <p>Get assistance if you are not satisfied with a mark on an assignment or final grade in a subject.</p> },
          { title: 'Appeals', body: <p>Resolutions to your Complaints are not satisfactory..! you can Appeal here.</p> },
          { title: 'COVID-19', body: <p>Under the Covid-19 situations you can reach out to us for help and support on highly critical situations. Please keep your evidences handy for submitting.</p> },
        ]}
      />
    </>
  )
}
