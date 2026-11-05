// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, ImageText, img, LogoBadge, SplitProse, ValueCards } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Cintana Education Partnership: How Are We Leveraging Global Expertise?',
  path: '/cintana-education-partnership-how-are-we-leveraging-global-expertise/',
  description: 'Cintana Education enables universities around the world to increase quality and scale in order to provide more students with the education they need and…',
})

export default function CintanaEducationPartnershipHowAreWeLeveragingGlobalExpertiseRoute() {
  return (
    <>
      <Hero heading="Cintana Education Partnership: How Are We Leveraging Global Expertise?" variant="compact" audienceSwitch={false} />
      <LogoBadge label="Partnership" logo={{ src: '/images/ihna/theme/cintana-education-logo.png', alt: 'Cintana Education', width: 524, height: 212 }} />
      <SplitProse eyebrow="Cintana Education" heading="About Cintana Education">
        <p>Cintana Education enables universities around the world to increase quality and scale in order to provide more students with the education they need and deserve. We provide world class expertise and access to our own proprietary resources as well as those of Arizona State University, a top-ranked university that shares our vision of expanding access through growth and innovation. Together, we are building the Cintana Alliance, an international network of universities that will work together to meet the rising global demand for high quality post-secondary education.</p>
      </SplitProse>
      <ValueCards
        items={[
          { title: 'Being Part of the ASU-Cintana Alliance', body: <p>The ASU-Cintana Alliance is an international network of innovative and forward-looking universities working together to bring the best of higher education to each of its students.Members of the ASU-Cintana Alliance will share best practices across regions and fields of study, offer exchange opportunities for students and faculty, provide dual-degree programs with other members, and benefit from the scale of a global community of member institutions. Over time, our Alliance and its members will be a vital part of the global dialogue about the role and future of higher education.</p> },
          { title: 'Learning beyond the classroom', body: <p>IHNA students have the exciting opportunity to connect and engage with students from all around the world. Through various initiatives like the Global Classroom, Global Competition, Summer Experience, and joint research opportunities, our students can exchange thoughts and ideas, while creating lasting friendships and building a global network.</p> },
          { title: 'Faculty and Students’ Mobility', body: <p>With more than 20 universities in the fast-growing alliance network, faculty members and students can look forward to a diverse and international learning experience through the student exchange, and faculty mobility program in the future.</p> },
        ]}
      />
      <ImageText media={img({ src: '/images/ihna/theme/cintana-1.webp', alt: '', width: 1600, height: 1068 })} imageSide="right">
        <h2>How does Cintana enhance our educational offerings?</h2>
        <p>By partnering with Cintana Education, we gain access to a global network of resources and expertise. This partnership allows us to integrate innovative teaching methods and international best practices from leading universities, particularly in the United States, ensuring our programs are at the forefront of educational innovation. With Cintana’s support, we develop cutting-edge curricula aligned with industry demands, enabling our graduates to compete globally. This collaboration facilitates the offering of dual degree programs, where students can earn degrees from IHM and partner institutions like Arizona State University (ASU), providing a comprehensive education combining theoretical knowledge and practical skills.</p>
      </ImageText>
      <ImageText media={img({ src: '/images/ihna/theme/cintana-2.webp', alt: '', width: 1600, height: 1068 })} imageSide="left">
        <h2>What benefits do students and faculty receive?</h2>
        <p>Students and faculty members at IHM greatly benefit from our collaboration with Cintana. Students gain access to international exchange programs, internships, and collaborative projects, broadening their academic and professional horizons and enhancing their employability. These opportunities allow students to experience different healthcare systems, learn from diverse perspectives, and build a global network of peers and professionals. Faculty members have opportunities to collaborate on research projects, participate in exchange programs, and attend professional development workshops with counterparts at ASU. These interactions foster a culture of continuous learning and improvement, ensuring that our educators remain at the forefront of their fields and can deliver the highest quality education to our students. The partnership also supports faculty pursuing innovative research and contributing to healthcare education and practice advancements.</p>
      </ImageText>
      <ImageText media={img({ src: '/images/ihna/theme/cintana-3.webp', alt: '', width: 1600, height: 1068 })} imageSide="right">
        <h2>How does this partnership align with our strategic vision?</h2>
        <p>This collaboration is pivotal in our mission of becoming a globally recognised university college specialising in health and wellness by 2030. By integrating Cintana’s resources, we aim to elevate our education standards, enhance our reputation, and improve our global rankings. We are committed to providing our students with the best possible education and preparing them to become leaders in the healthcare industry. The partnership supports our strategic goals of expanding our academic offerings, fostering international collaborations, and enhancing our research capabilities. As we continue to grow and evolve, our alliance with Cintana ensures that we remain at the forefront of educational excellence and innovation.</p>
      </ImageText>
    </>
  )
}
