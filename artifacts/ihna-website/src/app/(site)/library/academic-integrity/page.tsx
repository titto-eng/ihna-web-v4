// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, SplitProse, Statement, ValueCards, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Academic Integrity',
  path: '/library/academic-integrity/',
  description: 'Academic integrity is the expectation that teachers, students, researchers and all members of the Institute of Health & Nursing Australia academic…',
})

export default function LibraryAcademicIntegrityRoute() {
  return (
    <>
      <Hero heading="Academic Integrity" variant="split" look="editorial" audienceSwitch={false} eyebrow="Library" image={img({ src: '/images/ihna/pages/library-academic-integrity.webp', alt: 'Open book in the library', width: 598, height: 748 })} />
      <SectionNav section="library" current="/library/academic-integrity/" />
      <Statement
        tone="default"
        quote="Academic integrity is the expectation that teachers, students, researchers and all members of the Institute of Health & Nursing Australia academic community act with honesty, trust, fairness, respect and responsibility."
      >
        <p>Breaching academic integrity is known as academic misconduct or academic dishonesty. Academic integrity principles will assist you to work with the ethical expectation of your career in healthcare industry.</p>
      </Statement>
      <SplitProse eyebrow="Academic integrity" heading="Honesty in every *assessment*" tone="muted">
        <p>All forms of Academic dishonesty are prohibited at IHNA and carry serious consequences. Educators at IHNA use Turnitin to help detect academic dishonesty in papers and exams. Turnitin is an originality checking and plagiarism prevention service that checks your writing for citation mistakes of inappropriate coping.</p>
        <p>The accepted practice in Academic integrity, students need to acknowledge where the information which they use comes from, clearly citing or referencing the source. Sitting your own exams and submitting your own work. Accurately reporting research finding and abiding by research policies. Using information appropriately, according to copyright and privacy laws. Acting ethically or doing the right thing, even when you are facing difficulties. Breaching any of the above, substantial penalties can enforce to students.</p>
      </SplitProse>
      <ValueCards
        tone="default"
        eyebrow="Academic misconduct"
        heading="Breaching academic *integrity*"
        items={[
          { title: 'Plagiarism', body: <p>Breaching academic integrity include submitting work without acknowledging original source of the work is known as plagiarism. When you are using another person’s thoughts and ideas, you must reference the source materials.</p> },
          { title: 'Resubmitting work', body: <p>Resubmitting work, which is been already assessed, without prior permission from the assessor.</p> },
          { title: 'Falsification', body: <p>Falsification means incorrect data’s which does not exist. Fabricating information for research focused assessment tasks, such as experimental interview data.</p> },
          { title: 'Collusion', body: <p>Collusion involves engaging in illegitimate cooperation with one or more other students to complete assessable work which suppose to be individual piece of work. It can also include sharing quiz or test questions and answers with other students, as well as written assessments. Students should never share or circulate their work with others. This is totally different to working on group assignment that are set by teachers.</p> },
          { title: 'Exam cheating', body: <p>Exam cheating includes writing cheat notes on your body or materials taking to exam room, attempting to copy from other students, communicating externals while in the exam venue, using electronic device to access information’s while the exam in progress and bringing prohibited items such as unapproved calculators or textbooks into exams.</p> },
          { title: 'Contract cheating', body: <p>Contract cheating involves approaching someone else to complete your assessment and submitting that work as if you had completed it. This include asking someone else to sit an exam for you or having them write an essay, report or some other kind of assignment by paying or voluntarily.</p> },
        ]}
      />
      <SplitProse eyebrow="Consequences" heading="What happens if integrity is *breached*" tone="muted">
        <p>Consequences for breaching academic integrity, commonly referred as academic misconduct or academic dishonesty. This include having to repeat the assessment task or unit of study, falling the assessment task, unit of study or course, being expelled from your institution, which may impact your student visa and facing criminal charges. Major impact your relationship with colleague is affected, another impact is in your future career and cause you to suffer a financial loss or even lose your student visa.</p>
      </SplitProse>
    </>
  )
}
