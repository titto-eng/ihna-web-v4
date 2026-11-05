// Writing for students: the old page's figures (essay plan steps, literature review and essay parts, academic vs scientific
// language) shown as a timeline and card sets; the text is unchanged.
import type { Metadata } from 'next'
import { pageMetadata, ChecklistItems, Cta, Hero, Rich, SplitProse, Timeline, ValueCards, VideoEmbed, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'IHNA Online Library – Writing for Students',
  path: '/library/writing-for-students/',
  description: 'Approaching short or extended answer questions effectively requires a specific set of writing skills and a systematic approach. When presented with a…',
})

const list = (items: string[]) => <ChecklistItems columns={1} items={items} />

export default function LibraryWritingForStudentsRoute() {
  return (
    <>
      <Hero heading="IHNA Online Library – Writing for Students" variant="split" look="editorial" audienceSwitch={false} eyebrow="Library" image={img({ src: '/images/ihna/pages/library-writing-for-students.webp', alt: 'Student writing at a desk', width: 480, height: 600 })} />
      <SectionNav section="library" current="/library/writing-for-students/" />
      <SplitProse eyebrow="Writing for students" heading="How to Answer Questions">
        <p>Approaching short or extended answer questions effectively requires a specific set of writing skills and a systematic approach. When presented with a question, it is common for students to answer as though they were being asked it in conversation. However, if the question is on a piece of assessment or a learning activity that you encounter in the course of your studies, you are actually required to compose a small piece of writing, similar to an essay paragraph, as part of your response.</p>
      </SplitProse>
      <Cta links={[{ href: 'http://onlinelibrary.myihm.com.au/content.php?pid=678706', label: 'Detailed guide to answering questions', style: 'primary' }]} variant="inline" spacing="compact" />
      <Rich tone="muted" spacing="compact">
        <h2>Academic Writing Video</h2>
        <p>This video from RMIT University introduces some basics about how to structure an essay.</p>
      </Rich>
      <VideoEmbed url="https://www.youtube.com/watch?v=qKM3TRGsb8E" title="Academic Writing Video" tone="muted" spacing="compact" />
      <SplitProse heading="Essay Plans">
        <p>Writing an essay plan has many benefits including:</p>
        <ul>
          <li>Ensuring your essay is clearly structured</li>
          <li>Making it quicker and more efficient to write an essay</li>
          <li>Helping to arrange your ideas in a sequence and</li>
          <li>Helping overcome ‘writers block’ by asking questions to prompt the flow of ideas</li>
        </ul>
        <p>Writing an essay is by no means an intuitive process. For many of us, if we begin to write without a plan, the work we produce will follow our stream of consciousness, rather than the genre of the piece of writing we intend to produce. For some purposes this is not a problem and can allow the ideas to flow uninhibited. However, it can also make it difficult for others to know why we are writing and where we are headed. In an academic setting, when a lecturer sets an essay, it will most likely be marked on the logic of its structure, as well as on the content. Following the conventions of essay writing is essential if we wish to succeed academically and writing an essay plan is a great way to ensure that we are doing so.</p>
        <p>The document linked below is an essay plan template. To understand the parts of the plan, you may refer to the section above on How to Structure an Essay. One way in which you could use the essay plan template to produce an essay plan and subsequently an essay is as follows:</p>
      </SplitProse>
      <Timeline
        tone="muted"
        eyebrow="Fig. 02"
        steps={[
          { title: 'Replace each of the sets of angle brackets ‘<>’ in the template withh your own sentences' },
          { title: 'Add additional example and more elaborate concepts that involve multiple sentences' },
          { title: 'Remove the sub headings (introduction, paragraph 1 etcetera)' },
          { title: 'Proof read the essay several times and ensure that the writing flows and the ideas are linked.' },
        ]}
      />
      <Rich tone="muted" spacing="compact">
        <p>You may also copy and paste the ‘Paragraph 3’ secion to create Paragraph 4 and Paragraph 5. It is not recommended that more than 5 paragraphs be included. See the section on How to Structure your Essay for details.</p>
      </Rich>
      <ValueCards
        tone="default"
        eyebrow="Fig. 01"
        heading="How to Write a Literature Review"
        intro={
          <>
            <p>A literature review can be part of a major piece of writing, or it can be a stand alone essay. If you are asked to write a literature review as part of your coursework, you will need to write one that is a stand alone essay, summarising the literature on a particular topic.</p>
            <p className="mt-3">The parts of a literature review are similar to the parts of an essay, but, as shown in figure 2, their function is a little different. Click anywhere in Figure 2 to open a guide to writing literature reviews</p>
          </>
        }
        items={[
          { title: 'Introduction', body: list(['States the topic', 'Outlines the categories of literature thhat will be covered']) },
          { title: 'Body Paragraph (x3-5)', body: list(['Summarises a category of literature.', 'Summarises its relevance to the topic.', 'Compares and evalutes studies in the same category']) },
          { title: 'Conclusion', body: list(['Summarises what ares of literature have been convered.', 'Describes what ares have been researched and what ares are yet to be researched', 'Identifies a need for future research']) },
        ]}
      />
      <ValueCards
        eyebrow="Fig. 01"
        heading="How to Structure an Essay"
        intro="An essay is a specific type of writing and is different from other types of writing such as reports. The structure of an essay in its most basic form is as follows. Click on an essay part in Fig 1. to view more detailed information, examples and practice exercises"
        items={[
          { title: 'Introduction', body: list(['Tell the reader the topic', 'Tells the reader what the essay will show the reader']) },
          { title: 'Body', body: list(['Consists of three to five main paragraphs or section', 'Sets out concepts and examples that show the reader what was said in the introduction.']) },
          { title: 'Conclusion', body: list(['Tell the reader the topic', 'Tells the reader what the essay will show the reader']) },
        ]}
      />
      <ValueCards
        tone="default"
        columns={2}
        eyebrow="Fig. 03"
        heading="Academic and Scientific Language"
        intro="Scholarly and professional disciplines such as nursing and management require knowledge of language styles, conventions and terms specific to science and academia. This is especially important in nursing, particularly at a postgraduate level, as nurses draw on knowledge from a variety of disciplines including health science, medicine sociology and psychology. Fig. 3 summarises some characoristics of academic and scientific language. As you can see, there are both similarities and differences and they overlap a great deal. Click on either category to access a detailed resource guide."
        items={[
          { title: 'Academic Language', body: list(['Some discipline specific terminology.', 'Passive Voice or Active Voice.', 'Writing Usually in essay format']) },
          { title: 'Scientific Language', body: list(['Extensive dscipline specific terminology', 'Passive Voice always used.', 'Writing Usually in lab report format.']) },
        ]}
      />
    </>
  )
}
