// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, SplitProse, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Copyright',
  path: '/library/copyright/',
  description: 'Institute of Health & Nursing Australia is committed to ensuring compliance to copyright legislation in all areas of the teaching and learning which…',
})

export default function LibraryCopyrightRoute() {
  return (
    <>
      <Hero heading="Copyright" variant="split" look="editorial" audienceSwitch={false} eyebrow="Library" image={img({ src: '/images/ihna/pages/library-copyright.webp', alt: 'Digital library', width: 880, height: 1100 })} />
      <SectionNav section="library" current="/library/copyright/" />
      <SplitProse eyebrow="Copyright" heading="Using copyright material *responsibly*">
        <p>Institute of Health &amp; Nursing Australia is committed to ensuring compliance to copyright legislation in all areas of the teaching and learning which relate to third party copyright materials. The purpose of this policy is to promote copyright compliance in both the academic and non-academic activities of the institution by ensuring that all students and staff are made aware of their obligations when using copyrighted materials in any format whether by copying, reproducing, communicating, recording, or performing. Assist IHNA students and staff to make full legal use of the materials at their disposal and limit any risk to the institution associated with the use of copyrighted materials. This policy applies to all students and staff at IHNA campuses and relates to all IHNA approved or sponsored activities.</p>
        <p>The copyright Act 1968 shall for the purposes of this document, be referred to as the Act. First party copyright materials created by IHNA staff as part of their employment in which copyright has not been transferred or exclusively licensed to a third party.</p>
        <p>Third party copyright materials includes both licensed and unlicensed third party copyright material. Licensed third party copyright materials is any copyright protected material for which the terms of use are governed by a license or other from of agreement. Unlicensed third party copyright materials is any copyright material not governed by an agreement between the copyright owner and the user. This includes material copied in support upon Part VA or VB of the Copyright act of 1968.</p>
      </SplitProse>
      <SplitProse heading="Moral Rights" tone="muted">
        <p>Whenever another person’s intellectual property is used, user must also ensure that they comply with moral rights legislation that is also part of the copyright Act. This means that the author must be correctly acknowledged, and the work should not be treated in any way which would be the reputation of its creator.</p>
      </SplitProse>
      <SplitProse heading="Fair Dealing">
        <p>Students can reproduce copyright materials without permission provided that the dealing is for research or study and that the copying is fair. Fair dealing applies to work copied by an individual for their own use, but not copy materials for others.</p>
        <p>The Act section 40 deems fair to mean an article in a periodical publication more than one article in the same edition of a periodical if on the same subject matter, a reasonable portion which is 10% or one chapter, if the work is a published edition of 10 pages or more. In case of electronic materials, 10 % of the number of words may be reproduced or communicated for educational purposes under part VB of the ACT. In case of materials on the internet the same rules apply. It should not be assumed that all materials on the internet id freely available. Check to see if materials are copyright or public domain.</p>
        <p>In general, for literary, dramatic and musical works copyright ends 70 years after the death of the creator. For published sound recordings and films copyright ends 70 years after publication of the work. For artistic works copyright lasts for the life of the artist plus 70 years.</p>
        <p>Compliance Responsibilities are the responsibilities of all students and staff to make themselves aware of their obligations in relation to copyright by Reading and handouts on copyright supplied at the orientation and accompanying information on IHNA ‘s copyright webpage. Attending copyright information and training sessions. Consulting with the copyright Officer when in doubt as to their copyright responsibilities. Students are entirely responsible for any copyright infringement resulting from their actions. Faculty are responsible for the copyright compliance of all third party copyright materials supplied to students enrolled in their courses.</p>
      </SplitProse>
      <SplitProse heading="Reproduction to assist people with disabilities" tone="muted">
        <p>The act section 135 ZN-ZT allows for the reproduction of certain materials for people with sight and intellectual disabilities.</p>
      </SplitProse>
      <SplitProse heading="Online course materials">
        <p>All third party copyright materials print or digital which staff provide for students to access via Canvas must be lodged with copyright officer and uploaded, through the e-reserve program which monitors copyright compliance.</p>
        <p>Any materials that are transmitted in any other electronic format including emails, by or on behalf of lecturers, should also be accompanied by the appropriate copyright notice. See the IHNA copyright Officer or copyright webpages for the correct wording.</p>
        <p>Student materials is generally protected by copyright. Lectures wishing to use a student’s work must ensure that they keep adequate documentary prof that they have the student’s permission.</p>
        <p>Education licensing cannot be relied upon for nonacademic activities such as social activities, community outreach, fund raising, religious and cultural programs. Staff and students should check with the Copyright officer on their campus to ensure their activity is covered by the current IHNA licensing agreements. The libraries on each campus hold several books published by the Australian copyright council that will assist in the understanding and implementation of Australian copyright law.</p>
        <p>Relevant websites include:</p>
        <ul>
          <li>Australian Copyright council <a href="http://www.copyright.org.au" rel="noopener noreferrer">www.copyright.org.au</a></li>
          <li>Australian digital Alliance <a href="http://www.digital.org.au" rel="noopener noreferrer">www.digital.org.au</a></li>
          <li>CAL-Copyright Agency Limited <a href="http://www.copyright.com.au" rel="noopener noreferrer">www.copyright.com.au</a></li>
          <li>Copyright act 1968 <a href="http://www.comlaw.gov.au/series/C2004A07378" rel="noopener noreferrer">Read here</a></li>
        </ul>
        <p>Any non-complying activities will be brought to the attention of those responsible. Failure to take appropriate action will be brought to the attention of the copyright committee and may result in disciplinary action.</p>
      </SplitProse>
    </>
  )
}
