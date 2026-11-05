// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Accordion, CardGrid, Cta, Hero, img, Rich, StructureChart, Tabs } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Governance',
  path: '/governance/',
  description: 'The Institute’s key areas of expertise and course delivery are nursing, health and community services such as aged care, disability support and early…',
})

export default function GovernanceRoute() {
  return (
    <>
      <Hero heading="Governance" eyebrow="About IHNA" variant="compact" audienceSwitch={false} />
      <Rich spacing="compact">
        <h2>Meet our Team</h2>
      </Rich>
      <Tabs
        variant="pill"
        spacing="compact"
        tabs={[
          {
            label: 'Board of Directors',
            content: (
              <>
                <Rich depth={1}>
                  <h2>About Board of Directors</h2>
                  <p>The Institute’s key areas of expertise and course delivery are nursing, health and community services such as aged care, disability support and early childhood education and care. IHNA is fast-growing, dynamic, and quality-driven institution committed to continuous improvement; working hard to develop, implement and deliver courses and professional development programs. IHNA students benefit from fully equipped campuses, with modern facilities and amenities, including state-of-the-art nursing and computer laboratories, a student library, audio-visual equipped classrooms and student break out areas. All of this combines to ensure IHNA’s significant contribution to the training needs of the Australian workforce, particularly in the caring professions.</p>
                </Rich>
                <Cta links={[
                  { href: '/expression-of-interest/', label: 'Expression of Interest', style: 'primary' },
                  {
                    href: '/pdf/IHNA_Risk_Managment_Framework.pdf',
                    label: 'IHNA Risk Management Framework',
                    style: 'secondary',
                  },
                ]} variant="inline" depth={1} />
                <Rich depth={1}>
                  <h2>Board of Directors</h2>
                </Rich>
                <CardGrid cards={[
                  {
                    title: 'Professor Dr. Chandana Hewege',
                    body: 'Chair, Board of Directors',
                    image: img({ src: '/images/ihna/theme/chandana-hewege.webp', alt: 'Photo of Professor Dr. Chandana Hewege', width: 277, height: 366 }),
                  },
                  {
                    title: 'Dr. Bijo Kunnumpurath',
                    body: 'Chief Executive Officer and Managing Director',
                    image: img({ src: '/images/ihna/theme/bijo.webp', alt: 'Photo of Dr. Bijo Kunnumpurath', width: 722, height: 922 }),
                  },
                  {
                    title: 'Mr. Paul Tan',
                    body: 'Non Executive Director',
                    image: img({ src: '/images/ihna/theme/paul-tan.webp', alt: 'Photo of Mr. Paul Tan', width: 277, height: 366 }),
                  },
                  {
                    title: 'Mr. Arun Thomas',
                    body: 'Industry Expert',
                    image: img({ src: '/images/ihna/theme/arun-thomas.webp', alt: 'Photo of Mr. Arun Thomas', width: 277, height: 366 }),
                  },
                ]} columns="4" variant="grid" depth={1} />
                <Accordion depth={1} variant="plain"
                  items={[
                    {
                      title: 'Professor Dr. Chandana Hewege, Chair, Board of Directors',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>Professor Chandana Hewege is an accomplished academic leader, researcher, and governance expert with extensive experience in higher education strategy, teaching innovation, and institutional governance. He provides strategic leadership and oversight to strengthen the institute’s academic quality, governance systems, and long-term institutional development. Professor Hewege holds a PhD in International Business from Monash University and is a Principal Fellow of Advance HE (UK)—the highest level of international recognition for leadership in higher education teaching and learning. His academic career spans over two decades across leading universities in Australia and internationally, including roles at Swinburne University of Technology. A recognised scholar in the fields of corporate governance, sustainability, international business, and responsible management, Professor Hewege has published extensively in internationally ranked journals and has supervised numerous doctoral researchers. His work integrates academic scholarship with industry engagement, focusing on governance, sustainability, and socially responsible business practices. Professor Hewege brings significant board and academic governance experience to IHNA. Through his leadership, Professor Hewege contributes strategic direction to IHNA’s mission of delivering high-quality health education, strengthening academic governance, and supporting the development of a skilled healthcare workforce in Australia and internationally.</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'Dr. Bijo Kunnumpurath, Chief Executive Officer and Managing Director',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>Dr. Bijo, the Founder, Managing Director, and CEO of HCI Australia, epitomizes a visionary leader driven by a deep passion for education, entrepreneurship, and technology. With a Master’s in Business Administration and a background in Mechanical Engineering, he brings over three decades of extensive project and business management experience to his role. Furthermore, as a member of GAICD and has pursued a PhD in Corporate Governance in the Educational Sector at Swinburne University, Dr. Bijo exemplifies a dedication to lifelong learning and professional excellence.</p>
                          </Rich>
                        </>
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
          {
            label: 'Academic Board',
            content: (
              <>
                <Rich depth={1}>
                  <h2>Academic Board</h2>
                  <p>Our members oversee academic governance and ensure that learning and teaching are promoted and conducted within legislative and ethical requirements. This is to maintain IHNA’s position as a registered training organisation.</p>
                  <p>We also encourage the development and maintenance of high standards of teaching, learning, and scholarship. Our advice to the Board of Directors includes:</p>
                  <ul>
                    <li>Academic Policies and Procedures</li>
                    <li>Academic Quality Assurance Mechanisms (including Community Engagement)</li>
                    <li>Learning and Teaching Activities</li>
                    <li>Assessment Monitoring/Moderation</li>
                    <li>Benchmarking Academic Standards</li>
                    <li>Teaching Staff Succession Planning</li>
                  </ul>
                </Rich>
                <CardGrid cards={[
                  {
                    title: 'Ms. Shruti Nargundkar',
                    body: 'Chair, CDAC – Independent External Member',
                    image: img({ src: '/images/ihna/theme/shruti-nargundkar.webp', alt: 'Photo of Ms. Shruti Nargundkar', width: 277, height: 366 }),
                  },
                  {
                    title: 'Dr. Bijo Kunnumpurath',
                    body: 'CEO and Managing Director',
                    image: img({ src: '/images/ihna/theme/bijo.webp', alt: 'Photo of Dr. Bijo Kunnumpurath', width: 722, height: 922 }),
                  },
                  {
                    title: 'Dr. Shisir Prasad Manandhar',
                    body: 'Chair, LTC- Academic Director',
                    image: img({ src: '/images/ihna/theme/shishir.webp', alt: 'Photo of Dr. Shisir Prasad Manandhar', width: 277, height: 366 }),
                  },
                  {
                    title: 'Ms. Shali Bijo',
                    body: 'Curriculum Development Advisor',
                    image: img({ src: '/images/ihna/theme/Shali_Bijo.webp', alt: 'Photo of Ms. Shali Bijo', width: 277, height: 366 }),
                  },
                  {
                    title: 'Mr. Arshad Abdul Samad',
                    body: 'Director of Quality Management',
                    image: img({ src: '/images/ihna/theme/arshad-abdul.webp', alt: 'Photo of Mr. Arshad Abdul Samad', width: 277, height: 366 }),
                  },
                  {
                    title: 'Mr. Daniel Johnson',
                    body: 'National Training Manager',
                    image: img({ src: '/images/ihna/theme/daniel.webp', alt: 'Photo of Mr. Daniel Johnson', width: 277, height: 366 }),
                  },
                ]} columns="4" variant="grid" depth={1} />
                <Accordion depth={1} variant="plain"
                  items={[
                    {
                      title: 'Ms. Shruti Nargundkar, Chair, CDAC – Independent External Member',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>Shruthi is an accomplished entrepreneur with experience in academic board membership and publication.</p>
                            <p>She has a background in RTO education.</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'Dr. Bijo Kunnumpurath, CEO and Managing Director',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>Dr. Bijo, the Founder, Managing Director, and CEO of HCI Australia, epitomizes a visionary leader driven by a deep passion for education, entrepreneurship, and technology. With a Master’s in Business Administration and a background in Mechanical Engineering, he brings over three decades of extensive project and business management experience to his role. Furthermore, as a member of GAICD and has pursued a PhD in Corporate Governance in the Educational Sector at Swinburne University, Dr. Bijo exemplifies a dedication to lifelong learning and professional excellence.</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'Dr. Shisir Prasad Manandhar, Chair, LTC- Academic Director',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>Shisir Manandhar is a respected leader in Australian tertiary education, overseeing academic programs at IHNA. With over seven years of experience, he specializes in technology management and innovation policy. As head of Heathovation, he drives research and innovation in healthcare education using cutting-edge technologies. Shisir's research focuses on enhancing tertiary education and healthcare delivery through innovative technologies.</p>
                          </Rich>
                        </>
                      ),
                    },
                    {
                      title: 'Ms. Shali Bijo, Curriculum Development Advisor',
                      content: (
                        <>
                          <Rich depth={1}>
                            <p>Ms. Shali Bijo, an experienced healthcare professional with over 25 years of nursing, education, and management experience, plays a key role at HCI. Focused on IHNA courses, she ensures compliance with regulatory requirements, implementing strategies for excellence and upholding standards of education and training for healthcare professionals. Holding a Masters in Orthopedic Nursing, Shali is dedicated to maintaining organizational compliance while delivering top-quality education.</p>
                          </Rich>
                        </>
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
          {
            label: 'Academic Committees',
            content: (
              <>
                <Tabs depth={1}
                  tabs={[
                    {
                      label: 'Course Development &Advisory Committee (CDAC)',
                      content: (
                        <>
                          <Rich depth={1}>
                            <h2>Course Development &amp; Advisory Committee (CDAC)</h2>
                            <p>The Committee is established by the Academic Board, as part of its governance framework, to provide reports and/or recommendations to the Academic Board and other Committees as required in matters related to IHNA’s course development and monitoring aspects.</p>
                            <p>The Institute of Health and Nursing Australia (IHNA) recognises that effective and informed course development and change management processes are an integral part of the strategic academic planning of the Institute and part of the continuous improvement and quality management.</p>
                            <p>The principal function of the Course Development and Monitoring Committee is to provide advice on relevance of courses to prospective students, specific industry and professional bodies, and the community and in doing so provide open and transparent processes for this.</p>
                          </Rich>
                          <CardGrid cards={[
                            {
                              title: 'Ms. Shruti Nargundkar',
                              body: 'Independent External Member – Chairperson',
                              image: img({ src: '/images/ihna/theme/shruti-nargundkar.webp', alt: 'Photo of Ms. Shruti Nargundkar', width: 277, height: 366 }),
                            },
                            {
                              title: 'Dr. Shisir Prasad Manandhar',
                              body: 'Academic Director',
                              image: img({ src: '/images/ihna/theme/shishir.webp', alt: 'Photo of Dr. Shisir Prasad Manandhar', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Shali Bijo',
                              body: 'Curriculum Development Advisor',
                              image: img({ src: '/images/ihna/theme/Shali_Bijo.webp', alt: 'Photo of Ms. Shali Bijo', width: 277, height: 366 }),
                            },
                            {
                              title: 'Mr. Daniel Johnson',
                              body: 'National Training Manager',
                              image: img({ src: '/images/ihna/theme/daniel.webp', alt: 'Photo of Mr. Daniel Johnson', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Neethu Paul',
                              body: 'Curriculum Development Manager',
                              image: img({ src: '/images/ihna/theme/neethu.webp', alt: 'Photo of Ms. Neethu Paul', width: 277, height: 366 }),
                            },
                          ]} columns="4" variant="grid" depth={1} />
                        </>
                      ),
                    },
                    {
                      label: 'HCI Nursing Advisory Committee',
                      content: (
                        <>
                          <Rich depth={1}>
                            <h2>HCI Nursing Advisory Committee</h2>
                            <p>HCI Nursing Advisory Committee is established by the Curriculum Development and Monitoring Committee (CDMC) as part of its course development and review framework as outlined in its terms of reference. Nursing Advisory Committee (NAC) will be Nursing discipline-based and established based on the Institute of Health &amp; Nursing needs in the Nursing discipline.</p>
                            <p>HCI Nursing Advisory Committee is charged with engaging representatives of major stakeholders (Internal staff, employers, industry, relevant professional bodies and the wider community) in developing, proposing, reviewing and improving the course/s.</p>
                            <p>It will maintain and advance IHNA’s academic standards, maintaining the interests of students, the discipline/s and the associated industries and professions, including the relevant legislative and regulatory requirements.</p>
                            <p>The principal function of the HCI Nursing Advisory Committee is to provide advice on the relevance of courses to prospective students, specific industry and professional bodies, and the community.</p>
                            <p>The NAC may also facilitate networking with universities, businesses and the community to provide opportunities for research collaborations and/or provide practical experience for students where appropriate.</p>
                          </Rich>
                          <CardGrid cards={[
                            {
                              title: 'Mr. Arun Thomas (AT)',
                              body: 'Advisory Board Member',
                              image: img({ src: '/images/ihna/theme/arun-thomas.webp', alt: 'Photo of Mr. Arun Thomas (AT)', width: 277, height: 366 }),
                            },
                            { title: 'Ms. Beena Satheesh', body: 'External Member' },
                            {
                              title: 'Dr. Shisir Prasad Manandhar',
                              body: 'Chair, Academic Director',
                              image: img({ src: '/images/ihna/theme/shishir.webp', alt: 'Photo of Dr. Shisir Prasad Manandhar', width: 277, height: 366 }),
                            },
                            {
                              title: 'Mr. Daniel Johnson (DJ)',
                              body: 'National Training Manager',
                              image: img({ src: '/images/ihna/theme/daniel.webp', alt: 'Photo of Mr. Daniel Johnson (DJ)', width: 277, height: 366 }),
                            },
                            {
                              title: 'Assoc Prof. Helen Mary Almond (HA)',
                              body: 'Head of School – School of Nursing – IHM',
                              image: img({ src: '/images/ihna/theme/Helen_Almond.webp', alt: 'Photo of Assoc Prof. Helen Mary Almond (HA)', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Linda Pick Ding Wong (LW)',
                              body: 'National Placement Coordinator – IHNA',
                              image: img({ src: '/images/ihna/theme/linda.webp', alt: 'Photo of Ms. Linda Pick Ding Wong (LW)', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Neethu Paul',
                              body: 'Curriculum Development Manager',
                              image: img({ src: '/images/ihna/theme/neethu.webp', alt: 'Photo of Ms. Neethu Paul', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Destiny Artenstein',
                              body: 'Course coordinator – GCAN, IHM',
                              image: img({ src: '/images/ihna/theme/destiny.webp', alt: 'Photo of Ms. Destiny Artenstein', width: 277, height: 366 }),
                            },
                            { title: 'Ms. Divitha Subramanian', body: 'Course Coordinator – MoN, IHM' },
                          ]} columns="4" variant="grid" depth={1} />
                        </>
                      ),
                    },
                    {
                      label: 'Learning & Teaching Committee',
                      content: (
                        <>
                          <Rich depth={1}>
                            <h2>Learning &amp; Teaching Committee</h2>
                            <p>The Learning and Teaching Committee (LTC) is established as a subcommittee of the Academic Board as per the Academic Board Terms of Reference. The LTC reports to the Academic Board on matters related to Curriculum.</p>
                            <p>The LTC is a principal academic committee to support the Academic Board on learning and teaching matters, including:</p>
                            <ul>
                              <li>IHNA policies relating to learning, teaching, and scholarships.</li>
                              <li>Learning and teaching performance (e.g., progression, attrition and at risk);</li>
                              <li>Benchmarking and external referencing of course design and delivery including assessments;</li>
                              <li>Academic integrity; and</li>
                              <li>Academic risk</li>
                            </ul>
                          </Rich>
                          <CardGrid cards={[
                            {
                              title: 'Dr. Shisir Prasad Manandhar',
                              body: 'Chair, Academic Director',
                              image: img({ src: '/images/ihna/theme/shishir.webp', alt: 'Photo of Dr. Shisir Prasad Manandhar', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Shali Bijo',
                              body: 'Curriculum Development Advisor',
                              image: img({ src: '/images/ihna/theme/Shali_Bijo.webp', alt: 'Photo of Ms. Shali Bijo', width: 277, height: 366 }),
                            },
                            {
                              title: 'Mr. Daniel Johnson',
                              body: 'National Training Manager',
                              image: img({ src: '/images/ihna/theme/daniel.webp', alt: 'Photo of Mr. Daniel Johnson', width: 277, height: 366 }),
                            },
                            {
                              title: 'Arshad Abdul Samad',
                              body: 'Director of Quality Management',
                              image: img({ src: '/images/ihna/theme/arshad-abdul.webp', alt: 'Photo of Arshad Abdul Samad', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Linda Pick Ding Wong',
                              body: 'National Placement Coordinator',
                              image: img({ src: '/images/ihna/theme/linda.webp', alt: 'Photo of Ms. Linda Pick Ding Wong', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Sue Ulutay',
                              body: 'Course Coordinator',
                              image: img({ src: '/images/ihna/theme/sue.webp', alt: 'Photo of Ms. Sue Ulutay', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Josephine Roberts',
                              body: 'Course Coordinator',
                              image: img({ src: '/images/ihna/theme/josephine.webp', alt: 'Photo of Ms. Josephine Roberts', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Neethu Paul',
                              body: 'Curriculum Development Manager',
                              image: img({ src: '/images/ihna/theme/neethu.webp', alt: 'Photo of Ms. Neethu Paul', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Dhanya Kottukkal',
                              body: 'Course Coordinator',
                              image: img({ src: '/images/ihna/theme/dhanya-kottukkal.webp', alt: 'Photo of Ms. Dhanya Kottukkal', width: 277, height: 366 }),
                            },
                            { title: 'Mr. Alexander Alex Varghese', body: 'Course Coordinator' },
                          ]} columns="4" variant="grid" depth={1} />
                        </>
                      ),
                    },
                    {
                      label: 'StudentRepresentative Council',
                      content: (
                        <>
                          <Rich depth={1}>
                            <h2>Student Representative Council (SRC)</h2>
                            <p>Student Representative Councils (SRC) are an integral part of campus life at each IHNA campus and encourage students to become actively involved in the Institute and, IHNA Life.</p>
                            <p>The SRC provides a forum for Students to raise and discuss emerging views, suggestions and issues about learning, teaching, and student services. SRC is also an important opportunity for open communication between the student body and the Institute.</p>
                            <p>Student Representatives are sought from across the student community and IHNA has also extended participation to Alumni. SRC members are self-nominated from the student body and the Chair and Office-Bearers are appointed by the SRC.</p>
                            <p>As students represent the views of the entire student body, SRC provides an opportunity for students to develop their own soft skills and influencing skills as they participate in activities such as organising activities, leadership and representation and communication and mentoring of new students.</p>
                          </Rich>
                          <CardGrid cards={[
                            {
                              title: 'Dr. Shisir Prasad Manandhar',
                              body: 'Academic Director',
                              image: img({ src: '/images/ihna/theme/shishir.webp', alt: 'Photo of Dr. Shisir Prasad Manandhar', width: 277, height: 366 }),
                            },
                            {
                              title: 'Mr. Daniel Johnson',
                              body: 'National Training Manager',
                              image: img({ src: '/images/ihna/theme/daniel.webp', alt: 'Photo of Mr. Daniel Johnson', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Jasmine Melvin',
                              body: 'Director of Student Engagement and Retention',
                              image: img({ src: '/images/ihna/theme/jasmine_melvin.webp', alt: 'Photo of Ms. Jasmine Melvin', width: 277, height: 366 }),
                            },
                            { title: 'Ms. Harpreet Kaur', body: 'Student Representative, IHNA Online' },
                            { title: 'Mr. Amandeep Kaur Deol', body: 'Student Representative, New South Wales' },
                            { title: 'Ms. Natasha Howell', body: 'Student Representative, CBD LONSDALE' },
                            { title: 'Ms. Paula Baglieri', body: 'Student Representative, Brisbane' },
                            { title: 'Mr. Matthew Walters', body: 'Student Representative, Perth' },
                            { title: 'Mr. Satwinder Kaur', body: 'Student Representative, Heidelberg' },
                          ]} columns="4" variant="grid" depth={1} />
                        </>
                      ),
                    },
                    {
                      label: 'Aboriginal and Torres Strait IslanderEducation and Support Committee',
                      content: (
                        <>
                          <Rich depth={1}>
                            <h2>Aboriginal and Torres Strait Islander Education and Support Committee</h2>
                            <p>The Aboriginal and Torres Strait Islanders Education and Support Committee is established as a standing committee of the Academic Board established under the Academic Board Terms of Reference.</p>
                            <p>Institute of Health and Nursing Australia (IHNA) is committed to self-determination by empowering, supporting and creating partnerships with Aboriginal and/or Torres Strait Islander students, staff and their communities that ensure a culturally rich, relevant and engaged learning experience which embeds Aboriginal and/or Torres Strait Islander Peoples heritage and culture. The Committee has been formed to institutionalise the practice through a formal committee set up where the Aboriginal and/or Torres Strait Islander education and support system will remain integral in IHNA’s core business on education and training.</p>
                            <p>IHNA Reconciliation Plan coming soon.</p>
                          </Rich>
                          <CardGrid cards={[
                            { title: 'Mr. Dennis Simmons', body: 'Aboriginal Liaison Advisor' },
                            { title: 'Members', body: 'Subject matter expert on Indigenous communities’ cultural safety and security' },
                            {
                              title: 'Dr. Shisir Prasad Manandhar',
                              body: 'Academic Director',
                              image: img({ src: '/images/ihna/theme/shishir.webp', alt: 'Photo of Dr. Shisir Prasad Manandhar', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Shali Bijo',
                              body: 'Curriculum Development Advisor',
                              image: img({ src: '/images/ihna/theme/Shali_Bijo.webp', alt: 'Photo of Ms. Shali Bijo', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Tintu Varghese',
                              body: 'National Training Manager',
                              image: img({ src: '/images/ihna/theme/tintu-varghese.webp', alt: 'Photo of Ms. Tintu Varghese', width: 277, height: 366 }),
                            },
                            {
                              title: 'Mr. Daniel Johnson',
                              body: 'National Training Manager',
                              image: img({ src: '/images/ihna/theme/daniel.webp', alt: 'Photo of Mr. Daniel Johnson', width: 277, height: 366 }),
                            },
                          ]} columns="4" variant="grid" depth={1} />
                        </>
                      ),
                    },
                    {
                      label: 'Board of Examiners',
                      content: (
                        <>
                          <CardGrid cards={[
                            {
                              title: 'Dr. Shisir Prasad Manandhar',
                              body: 'Chair, Academic Director',
                              image: img({ src: '/images/ihna/theme/shishir.webp', alt: 'Photo of Dr. Shisir Prasad Manandhar', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Shali Bijo',
                              body: 'Curriculum Development Advisor',
                              image: img({ src: '/images/ihna/theme/Shali_Bijo.webp', alt: 'Photo of Ms. Shali Bijo', width: 277, height: 366 }),
                            },
                            {
                              title: 'Mr. Daniel Johnson',
                              body: 'National Training Manager',
                              image: img({ src: '/images/ihna/theme/daniel.webp', alt: 'Photo of Mr. Daniel Johnson', width: 277, height: 366 }),
                            },
                            {
                              title: 'Mr. Arshad Abdul Samad',
                              body: 'Director of Quality Management',
                              image: img({ src: '/images/ihna/theme/arshad-abdul.webp', alt: 'Photo of Mr. Arshad Abdul Samad', width: 277, height: 366 }),
                            },
                          ]} columns="4" variant="grid" depth={1} />
                        </>
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
          {
            label: 'Audit & Risk Committees',
            content: (
              <>
                <Tabs depth={1}
                  tabs={[
                    {
                      label: 'Audit &Risk Committee',
                      content: (
                        <>
                          <Rich depth={1}>
                            <h2>Audit &amp; Risk Committee</h2>
                            <p>The Committee is established by the Board of Directors (the Board), as part of its governance framework, to provide reports and/or recommendations to the Board and other Committees as required.</p>
                            <p>The Audit and Risk Management Committee (ARMC) is a formally constituted committee by the Board of Directors to assist and advise the Board in fulfilling its corporate governance and independent oversight responsibilities in relation to IHNA’s risk management and compliance, internal policies, procedures, audit requirements and external reporting responsibilities.</p>
                          </Rich>
                          <CardGrid cards={[
                            {
                              title: 'Dr. Kunnumpurath Bijo',
                              body: 'Chief Executive Officer and Managing Director',
                              image: img({ src: '/images/ihna/theme/bijo.webp', alt: 'Photo of Dr. Kunnumpurath Bijo', width: 722, height: 922 }),
                            },
                            {
                              title: 'Mr. Pankaj Patel',
                              body: 'Chief Financial Officer',
                              image: img({ src: '/images/ihna/theme/pankaj.webp', alt: 'Photo of Mr. Pankaj Patel', width: 277, height: 366 }),
                            },
                            { title: 'Mr. Ali Ahmed', body: 'Chief Operations Officer' },
                            {
                              title: 'Mr. William Young',
                              body: 'Independent external Member – Chairperson',
                              image: img({ src: '/images/ihna/theme/williamy.webp', alt: 'Photo of Mr. William Young', width: 277, height: 366 }),
                            },
                            {
                              title: 'Chikumbutso Trevor Mpesi',
                              body: 'Finance Manager',
                              image: img({ src: '/images/ihna/theme/chikumbutso.jpg', alt: 'Photo of Chikumbutso Trevor Mpesi', width: 277, height: 366 }),
                            },
                            {
                              title: 'Mr. Arshad Abdul Samad',
                              body: 'Director of Quality Management',
                              image: img({ src: '/images/ihna/theme/arshad-abdul.webp', alt: 'Photo of Mr. Arshad Abdul Samad', width: 277, height: 366 }),
                            },
                            {
                              title: 'Ms. Sathya Hymavathi',
                              body: 'Director of Audit and Risk',
                              image: img({ src: '/images/ihna/theme/sathya.webp', alt: 'Photo of Ms. Sathya Hymavathi', width: 277, height: 366 }),
                            },
                          ]} columns="4" variant="grid" depth={1} />
                        </>
                      ),
                    },
                    {
                      label: 'Appeals Committee',
                      content: (
                        <>
                          <Rich depth={1}>
                            <h2>Appeals Committee</h2>
                            <p>The Appeals Committee is established as a standing committee of the Academic Board as per the Academic Board’s Terms of Reference.</p>
                            <p>The main objectives of the SMAC are as follows:</p>
                            <ul>
                              <li>Provide an avenue of appeal for students in relation to student and academic complaints, and student disciplinary matters;</li>
                              <li>Promote and ensure the application of the principles of procedural fairness and confidentiality in relation to all SMAC matters; and</li>
                              <li>Promote quality improvement in policies and procedures related to academic complaints, student misconduct or student complaints.</li>
                            </ul>
                          </Rich>
                          <CardGrid cards={[
                            { title: 'Dr. Mulyadi Robin', body: 'Chair (Independent External Member)' },
                            { title: 'Mr. Ali Ahmed', body: 'Chief Operations Officer' },
                            {
                              title: 'Dr. Shisir Prasad Manandhar',
                              body: 'Academic Director',
                              image: img({ src: '/images/ihna/theme/shishir.webp', alt: 'Photo of Dr. Shisir Prasad Manandhar', width: 277, height: 366 }),
                            },
                            {
                              title: 'Mr. Arshad Abdul Samad',
                              body: 'Director of Quality Management',
                              image: img({ src: '/images/ihna/theme/arshad-abdul.webp', alt: 'Photo of Mr. Arshad Abdul Samad', width: 277, height: 366 }),
                            },
                          ]} columns="4" variant="grid" depth={1} />
                        </>
                      ),
                    },
                    {
                      label: 'FinanceCommittee',
                      content: (
                        <>
                          <Rich depth={1}>
                            <h2>Finance Committee</h2>
                            <p>This is a Sub-committee reporting to the Executive Management Committee (EMC). It provides reports and/or recommendations to the Audit and Risk Management Committee and other Committees as required.</p>
                            <p>The rationale of the Committee is to assist the Audit and Risk Management Committee to report IHNA’s management of its assets, liabilities and risks to the Board of Directors.</p>
                            <p>Based on the Standards in the Standards for RTOs 2015 relating to assessment of financial viability risk and holding public liability insurance, the Committee is responsible to consider:</p>
                            <ul>
                              <li>Financial capacity;</li>
                              <li>Financial capability; and</li>
                              <li>Financial trajectory</li>
                            </ul>
                          </Rich>
                          <CardGrid cards={[
                            {
                              title: 'Dr. Kunnumpurath Bijo',
                              body: 'CEO & Managing Director',
                              image: img({ src: '/images/ihna/theme/bijo.webp', alt: 'Photo of Dr. Kunnumpurath Bijo', width: 722, height: 922 }),
                            },
                            {
                              title: 'Mr. Pankaj Patel',
                              body: 'CFO',
                              image: img({ src: '/images/ihna/theme/pankaj.webp', alt: 'Photo of Mr. Pankaj Patel', width: 277, height: 366 }),
                            },
                            { title: 'Mr. Ali Ahmed', body: 'Chief Operations Officer' },
                            {
                              title: 'Chikumbutso Trevor Mpesi',
                              body: 'Finance Manager',
                              image: img({ src: '/images/ihna/theme/chikumbutso.jpg', alt: 'Photo of Chikumbutso Trevor Mpesi', width: 277, height: 366 }),
                            },
                          ]} columns="4" variant="grid" depth={1} />
                        </>
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
          {
            label: 'Management',
            content: (
              <>
                <Tabs depth={1}
                  tabs={[
                    {
                      label: 'Executive Management Committee',
                      content: (
                        <>
                          <Rich depth={1}>
                            <h2>Executive Management Committee</h2>
                            <p>The Committee is established by the Board of Directors to provide reports and/or recommendations to the Board of Directors and to the CEO and other Committees as required.</p>
                            <p>The Committee will agree objectives annually that are specific and measurable and will regularly review its progress in meeting and delivering the objectives. The objectives of the committee include, but are not limited to:</p>
                            <ul>
                              <li>exercise an executive decision-making and coordination role in relation to IHNA’s business;</li>
                              <li>implement policies and procedures to enable the efficient running of IHNA;</li>
                              <li>implement the strategic, operational and risk management plans approved by the Board of Directors ensuring that IHNA maintains a quality assured teaching and learning environment for all stakeholders;</li>
                              <li>report to the Board of Directors on major operational and management issues and the performance of IHNA.</li>
                            </ul>
                          </Rich>
                          <CardGrid cards={[
                            {
                              title: 'Dr. Kunnumpurath Bijo',
                              body: 'Chief Executive Officer (Chair)',
                              image: img({ src: '/images/ihna/theme/bijo.webp', alt: 'Photo of Dr. Kunnumpurath Bijo', width: 722, height: 922 }),
                            },
                            {
                              title: 'Mr. Pankaj Patel',
                              body: 'Chief Financial Officer',
                              image: img({ src: '/images/ihna/theme/pankaj.webp', alt: 'Photo of Mr. Pankaj Patel', width: 277, height: 366 }),
                            },
                            {
                              title: 'Dr. Shisir Prasad Manandhar',
                              body: 'Academic Director',
                              image: img({ src: '/images/ihna/theme/shishir.webp', alt: 'Photo of Dr. Shisir Prasad Manandhar', width: 277, height: 366 }),
                            },
                            {
                              title: 'Mr. Arshad Abdul Samad',
                              body: 'Director of Quality Management',
                              image: img({ src: '/images/ihna/theme/arshad-abdul.webp', alt: 'Photo of Mr. Arshad Abdul Samad', width: 277, height: 366 }),
                            },
                            {
                              title: 'Chikumbutso Trevor Mpesi',
                              body: 'Finance Manager',
                              image: img({ src: '/images/ihna/theme/chikumbutso.jpg', alt: 'Photo of Chikumbutso Trevor Mpesi', width: 277, height: 366 }),
                            },
                            {
                              title: 'Mr. Rexsen Roy',
                              body: 'Senior Business Development Manager',
                              image: img({ src: '/images/ihna/theme/rexsen.webp', alt: 'Photo of Mr. Rexsen Roy', width: 277, height: 366 }),
                            },
                            {
                              title: 'Mr Saji Kunnumpurath',
                              body: 'Campus Manager – Heidelberg Campus',
                              image: img({ src: '/images/ihna/theme/saji-kunnumpurath.webp', alt: 'Photo of Mr Saji Kunnumpurath', width: 277, height: 366 }),
                            },
                            {
                              title: 'Mr. Justin Jacob',
                              body: 'Campus Director – Perth',
                              image: img({ src: '/images/ihna/theme/justin-jacob.webp', alt: 'Photo of Mr. Justin Jacob', width: 277, height: 366 }),
                            },
                          ]} columns="4" variant="grid" depth={1} />
                        </>
                      ),
                    },
                    {
                      label: 'RTOManagement Committee',
                      content: (
                        <>
                          <Rich depth={1}>
                            <h2>RTO Management Committee (Campus Based)</h2>
                          </Rich>
                          <CardGrid cards={[
                            {
                              title: 'Dr. Shisir Manandhar',
                              body: 'Academic Director and Research Innovation & Technology Manager (Deputy Chair)',
                              image: img({ src: '/images/ihna/theme/shishir.webp', alt: 'Photo of Dr. Shisir Manandhar', width: 277, height: 366 }),
                            },
                            {
                              title: 'Saji Kunnumpurath',
                              body: 'Campus Manager – Melbourne',
                              image: img({ src: '/images/ihna/theme/saji-kunnumpurath.webp', alt: 'Photo of Saji Kunnumpurath', width: 277, height: 366 }),
                            },
                            {
                              title: 'Justin Jacob',
                              body: 'Campus Director – Perth',
                              image: img({ src: '/images/ihna/theme/justin-jacob.webp', alt: 'Photo of Justin Jacob', width: 277, height: 366 }),
                            },
                            {
                              title: 'Mr. Sabarish Babu',
                              body: 'Head of Digital Transformation / Manager Brisbane',
                              image: img({ src: '/images/ihna/theme/sabarish.webp', alt: 'Photo of Mr. Sabarish Babu', width: 277, height: 366 }),
                            },
                            { title: 'Admin Manager' },
                            { title: 'Accounts Officers', body: 'Based on location' },
                            { title: 'Secretary', body: 'In Attendance' },
                          ]} columns="4" variant="grid" depth={1} />
                        </>
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
        ]}
      />
      {/* the governance structure, drawn in code from the current chart (in place of org-chart.png / org-chart-sm.png) */}
      <StructureChart
        heading="Governance Structure"
        root={{
          id: 'board', name: 'Board of Directors', icon: 'board',
          children: [
            {
              id: 'academic', name: 'Academic Board', icon: 'academic',
              children: [
                { id: 'cdac', name: 'Course Development & Advisory Committee (CDAC)', icon: 'course', children: [{ id: 'nac', name: 'Nursing Advisory Committee (NAC)', icon: 'nursing' }] },
                {
                  id: 'ltc', name: 'Learning and Teaching Committee (LTC)', icon: 'teaching',
                  children: [
                    { id: 'src', name: 'Student Representative Council (SRC)', icon: 'students' },
                    { id: 'atsi', name: 'Aboriginal and Torres Strait Islander Education and Support Committee', icon: 'community' },
                  ],
                },
                { id: 'boe', name: 'Board of Examiners (BoE)', icon: 'exams' },
              ],
            },
            {
              id: 'arc', name: 'Audit & Risk Committee (ARC)', icon: 'audit',
              children: [
                { id: 'appeals', name: 'Appeals Committee', icon: 'appeals' },
                { id: 'finance', name: 'Finance Committee', icon: 'finance' },
              ],
            },
          ],
        }}
        dotted={[{ from: ['board', 'academic'], to: 'arc' }]}
      />
    </>
  )
}
