// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Checklist, Hero, LinkTiles, Rich, SplitProse, VideoEmbed, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'IHNA Online Library – Presentation Skills',
  path: '/library/presentation-skills/',
  description: 'When presenting, please condider the following:',
})

export default function LibraryPresentationSkillsRoute() {
  return (
    <>
      <Hero heading="IHNA Online Library – Presentation Skills" variant="split" look="editorial" audienceSwitch={false} eyebrow="Library" image={img({ src: '/images/ihna/pages/library-presentation-skills.webp', alt: 'Presenting to colleagues', width: 480, height: 600 })} />
      <SectionNav section="library" current="/library/presentation-skills/" />
      <Checklist
        eyebrow="Presentation skills"
        heading="Presentation tips"
        intro="When presenting, please condider the following:"
        columns={1}
        items={[
          'Use ‘presenter mode’ or a similar feature so your audience sees your slides on the big screen and you see your notes on the small screen (see video)',
          'Put most of the things you want to say in the notes. Avoid putting large amounts of information on the slides. Nobody will read it anyway',
          'The ideal font sizes are 32 and 48. Try to stick with those sizes and never, ever go below font size 24',
          'The bullet points should be one, two or three words, to draw people’s attention to a topic. They should not reiterate what you are actually going to tell them',
          'Using pictures is MUCH more effective than using words',
        ]}
      />
      <SplitProse heading="What is a Presentation?" tone="muted">
        <p>The answer may seem obvious. A presentation is a set of PowerPoint slides or a Prezi that someone then shows and talks in front of. Well, okay, but much more fundamentally a presentation is an act of communication. It is a meaningful conversation between you and your audience in which your aim is to engage and inform using your voice, your charisma and yes, some visual aids such as PowerPoint slides.</p>
        <p>Why is this distinction important? Because it tells us the difference between a good presentation and a poor one. In a meaningful conversation, you wouldn’t drone on in a monotone until the person you were talking to was struggling to concentrate and remain courteous. You would observe their body language and see how they were reacting to what you were showing and telling them. You would adjust your own body language, your tone, pace, modulation and the use you made of the visual aids as you went. If your audience showed you a look of incomprehension, you may try a different approach to explaining the same thing you just said. If they seemed enthusiastic, you might mirror their expression. This is how we turn a boring ‘death by PowerPoint’ session into a meaningful act of communication.</p>
        <p>Of course, fundamental to doing this is that you must first understand the subject matter you are about to discuss. Gaining this understanding is the most valuable preparation you can do before you present. Writing down key points in PowerPoint slides can often play a part in this, as you must express them in your own words. Copying and pasting is a waste of time since you won’t be cementing your own understanding and there will be too much text on your slides for your audience to read anyway.</p>
        <p>Brief, key points on slides can be useful as reminders. But remember that your audience can only effectively concentrate on either reading words on your slides or listening to you speak. An audience engaged in reading a block of text on your slide is not a listening audience. Very occasionally it can be of value to pause and give your audience a chance to read a particularly profound quote or piece of text, but most of the time the points on the slides need to be brief enough so the audience can take a snapshot with their mind in the first second, then listen to you.</p>
        <p>Often a picture or diagram can be more effective and memorable than bullet point text. When more complex concepts are to be discussed, diagrams are also useful. If you do show a diagram, you can discuss it with your audience by pointing out key relationships between parts. If done well, this can be quite a powerful form of communication.</p>
        <p>At all times, consider who you are talking to and communicate with them as people. Your audience will thank you and this will help you transform giving a presentation from something you dreat to something you may actually come to enjoy.</p>
      </SplitProse>
      <Rich spacing="compact">
        <h2>How to use MS PowerPoint</h2>
      </Rich>
      <VideoEmbed url="https://www.youtube.com/watch?v=XF34-Wu6qWU" title="How to use MS PowerPoint" spacing="compact" />
      <Rich spacing="compact">
        <h2>Using Presenter View</h2>
      </Rich>
      <VideoEmbed url="https://www.youtube.com/watch?v=D_XNFe4-39U" title="Using Presenter View" spacing="compact" />
      <LinkTiles
        tone="muted"
        heading="Support Page"
        items={[
          {
            title: 'Creating a .pptx Presentation',
            body: 'A guide from Microsoft that sets out some basic steps',
            href: 'https://support.office.com/en-us/article/basic-tasks-for-creating-a-powerpoint-presentation-efbbc1cd-c5f1-4264-b48e-c8a7b0334e36',
          },
        ]}
      />
    </>
  )
}
