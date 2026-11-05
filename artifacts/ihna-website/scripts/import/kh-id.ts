/**
 * kh_id stopgap of ihm-web's course step (50-portal-data §7); on IHNA the `course-live` step reads `khId` from the live page (DEC-8). The WP post id and the portal course name are mapped through the lists in the
 * old theme. Every entry cites its evidence; anything not in the evidence stays unresolved (`reviewStatus: kh-unresolved`).
 * The DB dump (postmeta `kh_id`, access-list item 1) replaces this. No credential is read from the old repo.
 *
 * Theme paths are relative to ../ihmv3/wp-content/themes/mwt-ihm/.
 */
export type KhEvidence = { wpId: number; khId: number; evidence: string[] }

export const KH_EVIDENCE: KhEvidence[] = [
  { wpId: 96, khId: 41, evidence: ["functions.php:868 `$kh_id === '41'` -> 'MON Brochure Download'", "template-enquiry-lp.php:36 `\"41\" => \"Master of Nursing\"`"] },
  { wpId: 340, khId: 74, evidence: ["functions.php:860 `$kh_id === '74'` -> 'MON Online Brochure Download' (slug master-of-nursing-online)"] },
  { wpId: 305, khId: 33, evidence: ["functions.php:883 `$kh_id === '33'` -> 'NCLEX Brochure Download'", "template-enquiry-lp.php:36 `\"33\" => \"...NCLEX for RNs\"`", 'in-body links `course_id=33` (course 305)'] },
  { wpId: 307, khId: 61, evidence: ["functions.php:891 `$kh_id === '61'` -> 'OSCE Brochure Download'", 'in-body links `course_id=61` (course 307)', "CONFLICT: template-enquiry-lp.php:36 lists OSCE as \"50\"; two sources vs one, 61 kept, confirm with the dump"] },
  { wpId: 1547, khId: 60, evidence: ["functions.php:899 `$kh_id === '60'` -> 'BSW Brochure Download' (slug bachelor-of-social-work)"] },
  { wpId: 6355, khId: 51, evidence: ["functions.php:907 `in_array($kh_id, ['1','51'])` -> 'GCAN ANP Brochure Download'", "template-enquiry-lp.php:36 `\"51\" => \"Graduate Certificate in Advanced Nursing (Australian Nursing Practice)\"`"] },
  { wpId: 838, khId: 52, evidence: ["template-enquiry-lp.php:36 `\"52\" => \"...(Renal Nursing)\"`", 'functions.php:857 gcan_kh_ids contains 52'] },
  { wpId: 858, khId: 53, evidence: ["template-enquiry-lp.php:36 `\"53\" => \"...(Paediatric Nursing)\"`", 'functions.php:857 gcan_kh_ids contains 53'] },
  { wpId: 837, khId: 54, evidence: ["template-enquiry-lp.php:36 `\"54\" => \"...(Critical Care Nursing)\"`", 'functions.php:857 gcan_kh_ids contains 54'] },
  { wpId: 862, khId: 55, evidence: ["template-enquiry-lp.php:36 `\"55\" => \"...(Mental Health Nursing)\"`", 'functions.php:857 gcan_kh_ids contains 55'] },
]

export const resolveKhId = (wpId: number): KhEvidence | null => KH_EVIDENCE.find((e) => e.wpId === wpId) ?? null

/** Courses that exist only as an old test record; no portal course, never resolved. */
export const TEST_COURSE_WP_IDS = [1476, 1478]

/**
 * Fixture-only ids for the portal fixtures of courses whose real kh_id is unknown. 9xxx can never collide with a real
 * portal id; these never reach Payload (`courses.khId` stays null for them).
 */
export const SYNTHETIC_KH_IDS: Record<number, number> = {
  10036: 9001, // master-of-nursing-international
  10039: 9002, // bachelor-of-social-work-international
  868: 9003, // diabetes-nursing
  845: 9004, // graduate-certificate-in-advanced-nursing-acute-care-nursing
}
