// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, ChecklistItems, Hero, img, LinkTiles, MediaSplit, Pillars, SplitProse, Statement, ValueCards } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'About Us',
  path: '/about-us/',
  description: 'To be ranked No. 1 in Health Science Education in Australia’s TVET sector',
})

export default function AboutUsRoute() {
  return (
    <>
      <Hero heading="Your gateway into the world of healthcare" variant="split" look="spotlight" audienceSwitch={false} eyebrow="About IHNA" image={img({ src: '/images/ihna/theme/about-main-img.jpg', alt: 'Nursing Institute in Australia', width: 668, height: 882 })} />
      <SectionNav section="about" current="/about-us/" />
      <Pillars
        eyebrow="Our Vision."
        heading="Vision, mission and *purpose*"
        items={[
          { label: 'Vision', title: 'To be ranked No. 1 in Health Science Education in Australia’s TVET sector' },
          { label: 'Mission', title: 'Education for Employment: Bridging the gap globally' },
          { label: 'Purpose', title: 'Caring with Passion' },
        ]}
      />
      <SplitProse
        tone="muted"
        eyebrow="Vision"
        heading="A pathway towards *university-level* education"
        intro="IHNA’s role as a pathway towards university-level education within the healthcare industry. By empowering healthcare leaders through innovative education and training."
      >
        <p>This vision statement encapsulates the essence of IHNA’s commitment to providing education and training programs that go beyond preparing students for jobs in the healthcare industry. It emphasizes the goal of fostering innovative mindsets, equipping students with skills and knowledge to become industry leaders, and driving positive change.</p>
        <p><strong>IHNA strives to achieve this by:</strong></p>
        <ChecklistItems
          columns={1}
          items={[
            'Assessments similar to first year of University education',
            'Provide guidance to students regarding possible articulation pathways for each course in scope with multiple degree programs and universities offering the courses.',
            'Provide gap training to meet university course requirements for transferring to Bachelor level courses in mapping the curriculum offered by universities',
            'Inviting university lecturers to provide guest lecture opportunity with IHNA diploma level courses.',
          ]}
        />
        <h3>Philosophy</h3>
        <p>Jobs are the primary source of wealth that sustains individuals and families; the building blocks of society. Creating a supportive organisation entails an emphasis on staff training and development, family support, career growth and the provision of lifelong opportunities for career progression through organisational growth.</p>
        <p>The provision of quality educational outcomes is also fundamental to supporting the personal and career development of students and graduates. The world is increasingly globalised and interconnected; thus, education must transcend borders and address changes in students’ needs in response to global trends as well as local developments. Linking and partnering with educational institutions and organisations that share HCI’s global aspirations and are aligned with this philosophy is key to making that mission a reality.</p>
      </SplitProse>
      <ValueCards
        eyebrow="ICEHOT"
        heading="Our *Values*"
        intro="At IHNA, We are guided by our core values, which form the foundation of our work and interactions. These values are encapsulated in the acronym ICEHOT."
        tone="default"
        items={[
          { title: 'Innovation', body: 'We strive to be creative and forward-thinking in the design and delivery of our program and services.' },
          { title: 'Caring', body: 'We maintain a primary focus on the welfare of our students, understanding and celebrating their diverse needs.' },
          { title: 'Excellence', body: 'We aim to exceed expectations and consistently deliver high-quality training and education.' },
          { title: 'Honesty', body: 'We are committed to being truthful and demonstrating fairness in all our actions.' },
          { title: 'Openness', body: 'We promote transparency, open-mindedness, and a willingness to explore new ideas.' },
          { title: 'Trust', body: 'We build trust through consistency, compassion, effective communication, and competency.' },
        ]}
      />
      <Statement
        title="College Mission for IHNA"
        quote="“Education for Employment: Bridging the gap globally”"
        author="Dr. Kunnumpurath Bijo"
        role="CEO & Managing Director"
        image={img({ src: '/images/ihna/theme/bijo.webp', alt: 'Dr. Kunnumpurath Bijo, CEO and Managing Director of IHNA', width: 722, height: 922 })}
      >
        <p>“IHNA committed to delivering education and training programs that equip our students with the skills and knowledge needed to be leaders in the healthcare industry. We prioritise creating strong partnerships with industry and society and measure our success by the employment outcomes of our graduates. Our commitment to innovation, excellence, and caring benefits our stakeholders, including students, staff, industry, service providers, and the community”.</p>
      </Statement>
      <SplitProse eyebrow="College Mission for IHNA" heading="Beyond preparing students for *jobs*">
        <p>At IHNA, our commitment to “Education for Employment: Bridging the gap globally” goes beyond just preparing our students for jobs in the healthcare industry. We believe that by creating innovative mindsets in our students, we can equip them with the skills and knowledge to be leaders in the industry and drive positive change. We prioritise fostering a culture of innovation and creativity that challenges our students to think critically and adaptively.</p>
        <p>We are dedicated to staying at the forefront of the latest developments and emerging trends in healthcare to ensure that our education and training programs remain relevant and meet the needs of the industry. Our core values of innovation, caring, and excellence are underpinned by honesty, openness, and trust. We aim to maintain high standards of policy and procedure, program/project development, and resource utilization to ensure the quality of our education and training programs</p>
        <p>Our success is measured not only by the employment outcomes of our graduates but also by their ability to make a positive impact on the healthcare industry and society. We are committed to creating strong partnerships with industry and society to ensure that our programs remain relevant and meet the needs of the healthcare sector. Overall, we are dedicated to providing education and training programs that benefit our students, industry, and society, while fostering a culture of innovation and excellence.</p>
        <p>Dr. Kunnumpurath Bijo<br /> CEO &amp; Managing Director</p>
      </SplitProse>
      <MediaSplit
        tone="muted"
        eyebrow="Since 2007"
        heading="About *us*"
        image={img({ src: '/images/ihna/theme/about-img.png', alt: 'Nursing College in Australia', width: 569, height: 575 })}
        badge={{ value: '30,000+', label: 'students since 2007' }}
      >
        <p>We are the Institute of Health and Nursing Australia (IHNA), a healthcare training provider born out of the desire to create jobs and improve people’s lives. Since 2007 we’ve been dedicated to giving the best learning experience to over 30,000 students for a satisfying career in nursing, health, and community services.</p>
        <p>We’re eager to share our deep and relevant expertise of the industry with students like you so that you can gain from our knowledge and apply it directly to your growth. We’re particularly proud of the laboratories and facilities we have in our campuses across Melbourne, Sydney, Brisbane, and Perth. They’re equipped with modern technologies to simulate real scenarios.</p>
        <p>Our passion for caring stems from healthcare, but it translates to how we approach student welfare, administrative, and educational support. You will also find that IHNA goes the extra mile to ensure that your experience is positive from start to finish. Our support extends to providing research opportunities for you to push the boundaries of the healthcare industry. We have further study available as postgraduate courses through our partner organisations.</p>
        <p>Ultimately, we’re healthcare experts and trainers dedicated to career-focused learning and real-life outcomes so that more people can live better lives working in healthcare.</p>
        <p><a href="https://online.fliphtml5.com/wmka/kheh/#p=1" rel="noopener noreferrer">Download Corporate Profile</a></p>
      </MediaSplit>
      <MediaSplit
        eyebrow="Welcome"
        heading="CEO’s *message*."
        imageSide="right"
        image={img({ src: '/images/ihna/theme/bijo-kunnampurath-md.png', alt: 'Dr. Kunnumpurath Bijo, CEO and Managing Director', width: 546, height: 715 })}
      >
        <p>Welcome to the Institute of Health and Nursing Australia (IHNA), the home of healthcare training. Our focus is firmly on the development and delivery of the best learning experience for a successful and satisfying career in nursing, health, and community services. Since 2007 we’ve proudly maintained deep and relevant expertise in this industry, which helps us create a career-focused and practical approach to learning at our campuses in Melbourne, Sydney, Brisbane, and Perth.</p>
        <p>IHNA is one of three organisations alongside the <a href="https://www.ihm.edu.au/" rel="noopener noreferrer">Institute of Health and Management (IHM)</a> that belong to <a href="https://www.hcigroup.com.au/" rel="noopener noreferrer">HCI Australia</a>, a group that is committed to quality health education. Each organisation has a unique and complementary role that creates opportunities for collaboration.</p>
        <p>IHM is where we provide opportunities for further studies by taking higher education courses in nursing, nursing specialisations, and management.</p>
        <p>Being part of HCI Australia allows us to provide facilities and laboratories with the latest technology for simulations and enhanced practical learning during your time at IHNA. Our support extends to providing vocational opportunities for students to directly lead into a career that supports the growing needs of the industry.</p>
        <p>I hope you join us at IHNA and enjoy a successful future in healthcare.</p>
      </MediaSplit>
      <LinkTiles
        tone="muted"
        heading="Awards Received by IHNA"
        items={[
          { title: 'HCI Australia', href: '/hci-australia/' },
          { title: 'Life at IHNA', href: '/life-at-ihna/' },
          { title: 'Governance', href: '/governance/' },
          { title: 'Our Team', href: '/our-team/' },
          { title: 'Our Registrations', href: '/registrations/' },
          { title: 'Our Campuses', href: '/our-locations/' },
        ]}
      />
    </>
  )
}
