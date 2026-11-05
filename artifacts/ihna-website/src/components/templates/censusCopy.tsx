import { ValueCards } from '@/components/page'

// The explanatory copy above the census picker (template-census-date-kh.php), shared by /census-dates-kh/ and /census-dates/:
// the four questions as cards, the formula last.
export function CensusIntro() {
  return (
    <ValueCards
      tone="default"
      columns={2}
      eyebrow="Census dates"
      items={[
        {
          title: 'What is the Census Date?',
          mark: '?',
          body: (
            <p>
              The Census Date is a critical deadline in a student&apos;s academic calendar. It is the last date by which a student can withdraw from a
              course or part of a course (such as a unit of study) without being financially liable for the tuition fees. If a student decides to leave
              the course before this date, they will not incur a financial liability for tuition fees (or the unit of the study).
            </p>
          ),
        },
        {
          title: 'Why is the Census Date Important?',
          mark: '!',
          body: (
            <p>
              The Census Date is important because it determines a student&apos;s financial commitment to their studies. It is the point at which a
              student&apos;s enrolment is confirmed and their tuition fees become due.
            </p>
          ),
        },
        {
          title: 'How Does It Affect Student Fee Liability?',
          mark: '$',
          body: (
            <p>
              If a student is still enrolled in a course after the Census Date, they are financially liable for the tuition fees of the course or unit,
              regardless of whether they continue attending classes. This means that even if a student withdraws after the Census Date, they will still
              be required to pay for the course.
            </p>
          ),
        },
        {
          title: 'How is it calculated?',
          mark: '=',
          body: (
            <>
              <p>The census date is calculated based on the below formula:</p>
              <p><strong>(Semester End Date – Start Date of the Unit) × 0.2 + Start Date of the Unit.</strong></p>
            </>
          ),
        },
      ]}
    />
  )
}
