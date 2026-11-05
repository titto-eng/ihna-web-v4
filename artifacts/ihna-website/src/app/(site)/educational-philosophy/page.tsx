// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Accordion, Hero, img, Rich, SplitProse } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Educational Philosophy',
  path: '/educational-philosophy/',
  description: 'IHNA’s education philosophy: a constructivist, student-centred approach that prepares students for life-enhancing careers in an everchanging world.',
})

export default function EducationalPhilosophyRoute() {
  return (
    <>
      <Hero
        heading="Educational Philosophy"
        subheading="Preparing students for life-enhancing careers"
        variant="split" look="spotlight"
        audienceSwitch={false}
        image={img({ src: '/images/ihna/theme/edu-ph.jpg', alt: 'Open books on a library desk', width: 1600, height: 601, focal: [75, 60] })}
      />
      <SplitProse eyebrow="Since 2007" heading="Introduction">
        <p>The Institute of Health and Nursing Australia (IHNA) was established in 2007 with the mission to foster diverse learning communities that prepare students for life-enhancing careers in an everchanging world which encompass nursing, medical, wellness, global health, social work, management, and research. IHNA is therefore committed to providing exemplary courses at certificate, diploma, and advanced diploma levels for a variety of health and management related service professionals.</p>
        <p>IHNA recognises the many career opportunities for students across the health sector. These include clinical, functional and management roles. IHNA’s education philosophy is to provide our students with a rewarding learning experience that will motivate and encourage students to strive for individual advancement and excellence. IHNA values quality student-centred learning and teaching approaches which adhere to specific educational philosophies, outlined below. This is dependent on the context of the design of courses. Comprehensive learning and teaching methodologies are embedded in all IHNA’s course design and delivery.</p>
      </SplitProse>
      <SplitProse tone="muted" eyebrow="Our approach" heading="Constructivist *Approach*">
        <p>IHNA is committed to a constructivist approach to education. This is an approach in which learning is viewed as a contextualised, active process of knowledge and skills acquisition. The student is the creator of their own repository of knowledge and skills.</p>
        <p>Complementing a constructivist approach to learning is the application of adult learning and teaching principles to the learning and teaching contexts. The learning and teaching context is structured to build on existing knowledge and skills in different areas. These are creative and critical thinking, problem solving, collaborative teamwork, clinical reasoning, evidence-based practice, knowledge development, ethical and legal parameters of professional practice, cultural awareness and empathy, with particular emphasis and explicit focus on Aboriginal and Torres Strait Islanders’ health and community care.</p>
      </SplitProse>
      <Accordion
        heading="How we *teach*"

        variant="plain"
        items={[
          {
            title: 'Self-directed Learning',
            content: (
              <Rich depth={1}>
                <p>IHNA adopts a teaching strategy based on self-directed learning with the notion, however, that all adult learners are not autonomous. All educators are actively involved in and prepared for the courses, using adult learning principles – Self-directing; Learning by doing; Relevance; Experience; All the senses; Practice; Personal development; and Involvement (Knowles, 1984).</p>
              </Rich>
            ),
          },
          {
            title: 'Work Integrated Learning (WIL)',
            content: (
              <Rich depth={1}>
                <p>The true worth of education and training is demonstrated in the real world of work. IHNA makes every effort to ensure that the education and training provided to students is as close to and relevant to the workplace as feasible. IHNA educators’ experience, adaptability, and dialogue with students and stakeholders, including industry are all valuable assets.</p>
                <p>IHNA is a proponent of Work Integrated Learning (WIL), an umbrella term for pedagogical methods and strategies to integrate theoretical knowledge in the workplace based on a specially designed curriculum and strategies (Berndtsson, Dahlborg, &amp; Pennbrant, 2019). IHNA courses include a work placement or professional practice experience component, that is integrated into the theoretical and simulation-based learning process.</p>
                <p>WIL encompasses any arrangement where students undertake learning in a workplace outside of IHNA classrooms as a part of their course of study. Such arrangements may include:</p>
                <ul>
                  <li>Clinical or other professional placements</li>
                  <li>Online projects</li>
                  <li>Internships, or</li>
                  <li>Workplace projects.</li>
                </ul>
                <p>At IHNA, WIL provides students with the opportunity to learn and practise in different workplace settings as well as being exposed to a variety of real-life situations where students will have the opportunity to integrate their practical professional skills with theoretical knowledge. WIL also promotes the exchange of knowledge with knowledge development in the workplace (McNamara, 2013).</p>
                <p>The WIL approach provides IHNA students with the venues and settings to apply the knowledge and skills learned in their designated course and prepares them for their professional life. Formal assessment tools will be used to assess students’ clinical performance. Feedback as required will be given to students to improve their work-related skills through formative activities and assessments.</p>
              </Rich>
            ),
          },
          {
            title: 'Learning by application',
            content: (
              <Rich depth={1}>
                <p>When applied, learning is better retained. IHNA centres on approaches that involve students and place knowledge into practice and action, rather than just theory. This principle applies from lectures, tutorials, simulations to practical instructions.</p>
                <p>IHNA guides the development of simulators and programs that bring education and training closer to the working environment of students and prepare them for on-the-job circumstances.</p>
              </Rich>
            ),
          },
          {
            title: 'Inquiry-based Learning (IBL)',
            content: (
              <Rich depth={1}>
                <p>IHNA uses inquiry-based learning (IBL), a student-centered approach to learning in which students are encouraged to be active learners while being monitored and supervised by their educators. Teaching and Learning based on IBL helps students to expand their knowledge, skills and understanding through research and exploration activities (such as case studies, simulation activities, project or research) based on existing knowledge and skills. This approach requires higher order thinking skills and critical thinking to draw conclusions (Ganesan et al., 2020). In IBL, as Wale &amp; Bishan (2020) elucidate, students gain knowledge and skills through:</p>
                <ul>
                  <li>observations</li>
                  <li>posing questions</li>
                  <li>examining sources</li>
                  <li>gathering</li>
                  <li>analysing</li>
                  <li>interpreting and synthesising data</li>
                  <li>proposing answers</li>
                  <li>explanation and predictions</li>
                  <li>communicating findings through discussion and reflections</li>
                  <li>applying findings to the real situation; and</li>
                  <li>following up new questions that may arise in the process.</li>
                </ul>
                <p>At IHNA, students are encouraged to critically view, question, and diligently explore various perspectives and concepts of the real world. Educators facilitate and scaffold learning that gives facts and knowledge to enhance their knowledge and skills. The educators direct students to engage in investigating, questioning, and explaining their world in a structured student–centred learning environment.</p>
              </Rich>
            ),
          },
          {
            title: 'Learning through Reflection',
            content: (
              <Rich depth={1}>
                <p>IHNA’s philosophy of learning through reflection is founded on students and their learning experiences, as well as on the integration of theory and practise. As Esterhuizen (2019) states, students will be introduced to different models of reflection including critical reflection, reflective writing, clinical reasoning and reflecting on a clinical situation.</p>
              </Rich>
            ),
          },
          {
            title: 'Technology Enhanced Learning',
            content: (
              <Rich depth={1}>
                <p>An important part of IHNA’s educational philosophy is technologically enhanced learning (TEL) which combines the practices and perspectives of an educator with appropriate technological tools in order to achieve pedagogical goals while also maximising student outcomes and experiences.</p>
                <p>To appropriately apply TEL, IHNA educators are equipped with technological pedagogical and training knowledge and skills. This will include understanding what existing or emerging technologies can be used to tell a story, encourage an activity, create collaboration or establish communication.</p>
              </Rich>
            ),
          },
          {
            title: 'Learning and Teaching Methodologies',
            content: (
              <Rich depth={1}>
                <p>IHNA learning, teaching and training methodologies will take account of the philosophical values, cultural diversities and learning style preferences of students. During the on-campus or online delivery of courses, steps will be taken to motivate students to participate actively in interactive learning, lectures, tutorials, workshops and simulation activities prior to their professional practice experience placements. When utilising eLearning technologies in online course delivery, conscious effort will be made to incorporate variety of teaching learning methods. Students will be encouraged to engage with their educators irrespective of course delivery modalities. Furthermore, independent learning, and forum discussions will be incorporated.</p>
                <p><strong>Students’ prior knowledge and background:</strong> IHNA acknowledges that students entering any of the courses at IHNA bring with them considerable experiences. The learning and teaching approach adopted in all IHNA courses incorporate recognition of student’s prior learning experiences and integrate principles of adult learning.</p>
                <p><strong>Acknowledgement of Learning Style Variations:</strong> The variety of teaching and learning methodologies employed in all IHNA courses complement and supplement the different learning styles exhibited by the students as well as attune to the demands of content of the relevant course. These methodologies include context based or problem-based learning, rationalist pedagogy and reflective learning.</p>
                <p>Teaching strategies will include the use of a wide variety of sources and materials including library books and resources, learning guides and presentations. Digital technology and media are appropriately incorporated to augment the learning.</p>
                <p><strong>Research and inquiry:</strong> Depending on the relevant courses or units (e.g., research unit, Evidence-Based Practice, etc), a high level of support, encouragement and direction will be provided. This particularly applies during the early part of the relevant courses.</p>
                <p><strong>Literature:</strong> From the beginning of the course, students will be helped and encouraged to develop study, research and inquiry skills, which will then be utilised and assessed. The required readings will be selected to provide students with a grounding of the main themes and principles central to each topic. This provides context and a framework for understanding and expansion when examining other literature, practices and other course materials such as interactive media.</p>
                <p><strong>Communication and cooperation:</strong> Students will be encouraged to discuss course content and literature with one another and with educators. The primary means of discussion will be through online and on campus face to face discussion forums in which the academic will guide discussion. Students will also get to communicate through email, instant messaging and other media. Discussion is a vitally important part of the learning process as it allows learning to be social as well as individual and provides a model for upskilling themselves.</p>
                <h4>The right education and training for the right needs</h4>
                <p>Respect for the investment in education and training of students entails education that satisfies their needs. As a result, setting clear goals, identifying specific needs, and tailoring training to fulfil those needs are critical components of the process.</p>
              </Rich>
            ),
          },
          {
            title: 'References',
            content: (
              <Rich depth={1}>
                <p>Berndtsson, I. E., Dahlborg-Lyckhage, &amp; Pennbrant, S. (2019). Work-integrated learning as a pedagogical tool to integrate theory and practice in nursing education – an integrative literature review, Nurse Education in Practice 42 DOI:10.1016/j.nepr.2019.102685.</p>
                <p>Esterhuizen, P. (2019). Reflective practice in nursing: transforming nursing practice. Sage Publications. USA.</p>
                <p>Knowles, M. S. (1984). The adult learner: A neglected species. Houston: Gulf Pub. Co., Book Division.</p>
                <p>McNamara, J. (2013). The challenge of assessing professional competence in work integrated learning. Assessment and Evaluation in Higher Education, 38(2), pp. 183-197. <a href="https://doi.org/10.1080/02602938.2011.618878" rel="noopener noreferrer">https://doi.org/10.1080/02602938.2011.618878</a></p>
                <p>McLeod, S. A. (2019). Constructivism as a theory for teaching and learning. Simply Psychology. <a href="https://www.simplypsychology.org/constructivism.html" rel="noopener noreferrer">https://www.simplypsychology.org/constructivism.html</a></p>
                <p>Shanmugavelu, G., Parasuraman, B., Ariffin, K., Kannan, B., &amp; Vadivelu, M. (2020). Inquiry method in the teaching and learning process. International Journal of Education, 8 (3), pp. 6–9. DOI: <a href="https://doi.org/10.34293/educationv8i3.2396" rel="noopener noreferrer">https://doi.org/10.34293/educationv8i3.2396</a></p>
                <p>TEQSA. (2017). Guidance note: work integrated learning. <a href="https://www.teqsa.gov.au/sites/default/files/guidance-note-work-integrated-learning-v1-2-web.pdf?v=1581310233" rel="noopener noreferrer">https://www.teqsa.gov.au/sites/default/files/guidance-note-work-integrated-learning-v1-2-web.pdf</a></p>
                <p>Wale, B, D., &amp; Bishaw, K, S. (2020). Effects of using inquiry-based learning on EFL students critical thinking skills. Asian-Pacific Journal of Second and Foreign Language Education 5(9) <a href="https://doi.org/10.1186/s40862-020-00090-2" rel="noopener noreferrer">https://doi.org/10.1186/s40862-020-00090-2</a></p>
                <p>Cox, T. D. (2015). Adult Education Philosophy: The Case of Self-Directed Learning Strategies in Graduate Teaching, Journal of Learning in Higher Education, 11(1), pp. 17-22</p>
              </Rich>
            ),
          },
        ]}
      />
    </>
  )
}
