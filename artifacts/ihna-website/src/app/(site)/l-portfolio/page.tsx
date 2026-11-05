// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, Checklist, Cta, Hero, img, SplitProse, Steps } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'L – Portfolio',
  path: '/l-portfolio/',
  description: 'L - Portfolio is a collection of work, skills and interests (evidence) in an electronic format that showcases learning and experience over time.',
})

const start = 'https://lportfolio.acerpl.com.au/'

export default function LPortfolioRoute() {
  return (
    <>
      <Hero
        heading="L – Portfolio"
        subheading="Lifelong learning portfolio."
        variant="split" look="mosaic"
        audienceSwitch={false}
        image={img({ src: '/images/ihna/theme/portfolio-banner.jpg', alt: 'Laptop, coffee and notepad on a desk', width: 1600, height: 533 })}
        ctas={[{ href: start, label: 'Click here to start', style: 'primary' }]}
      />
      <SplitProse eyebrow="L – Portfolio" heading="What is a L - Portfolio?">
        <p>L - Portfolio is a collection of work, skills and interests (evidence) in an electronic format that showcases learning and experience over time.</p>
        <p>When you think about your L-Portfolio and the types of evidence that it contains, it is important to think carefully about its purpose and intended audience.</p>
      </SplitProse>
      <Checklist
        tone="muted"
        intro="Your L-Portfolio may contain all or some of the following:"
        items={[
          'Files of various formats (text, pictures, video, etc.)',
          'Evidence related to courses taken, programs of study, etc.',
          'Writing samples (which might include several drafts to show development and improvement)',
          'Projects prepared for class or extracurricular activities',
          'Evidence of creativity and performance',
          'Evidence of extracurricular or co-curricular activities, including examples of leadership',
          'Evaluations, analysis and recommendations',
        ]}
      />
      <Steps
        heading="How to get started?"
        variant="numbered"
        steps={[
          { title: 'Create a new user account' },
          { title: 'To check eligibility for RPL, create an L-Portfolio' },
          { title: 'First, select the theme' },
          { title: 'Next, go to each field and populate it with your details', body: 'Each section will include options and hints, so that the process of filling the L-Portfolio is very simple.' },
          { title: 'Any certificates that are mentioned should be uploaded as indicated', body: 'Similarly, proof of having attended workshops and seminars should be provided.' },
          { title: 'Document your prior work experience with all the details requested' },
          { title: 'Once the L-Portfolio is completed, the RPL page is enabled', body: 'You can click on ‘apply for RPL’. It’s that simple!' },
        ]}
      />
      <Cta variant="inline" links={[{ href: start, label: 'Click here to start', style: 'primary' }]} />
      <CardGrid
        heading="Uses of L-Portfolio"
        columns="3"
        variant="grid"
        cards={[
          {
            title: 'Recognition of Prior Learning application',
            body: 'Our RPL tool is in the form of an L-Portfolio, and allows students to put on record all their life experiences, interests and skills. Not only will their academic achievement be listed out, but also any life experiences that could potentially be taken into account for extra credit as Recognition of Prior Learning. For instance, an individual who has taken care of his or her bedridden parent has already gained valuable caregiver experience, which could be chalked up against practical expertise and added to their resume. This L-Portfolio could be sent to employers when applying for work, to universities while applying for extra credits through RPL, or in any other ways to market their expertise.',
          },
          {
            title: 'Showcase/Professional L Portfolios',
            body: 'These L-Portfolios are used as a way to demonstrate (showcase) the highlights of a student’s academic and professional career.',
          },
          {
            title: 'Learning Portfolios',
            body: 'These portfolios are typically created by a student as part of a course as a way to demonstrate learning and the learning process. These portfolios are often shared with other students to elicit peer feedback. Learning portfolios support the idea of formative feedback as an essential part of the learning process.',
          },
        ]}
      />
    </>
  )
}
