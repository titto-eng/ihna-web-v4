// Test fixture (not site content): ihm-web's site maps for the shared pipeline, so the IHM-fixture tests prove that the
// config-driven extensions (campaign table, CRM reference data, HubSpot and Dynamics maps) leave IHM's requests unchanged.
// Swap in per module, e.g. vi.mock('@/content/hubspot-map', () => import('./fixtures/site-ihm').then((m) => m.hubspot)).
import type { CampaignCode } from '@/content/campaign-codes'
import type { CrmCampus, CrmCourse } from '@/content/course-crm'
import type { DynamicsMap } from '@/content/dynamics-map'
import type { HubspotMap } from '@/content/hubspot-map'

export const campaignCodesModule = {
  campaignCodes: [] as CampaignCode[],
  campaignByCode: (): CampaignCode | null => null,
}

export const hubspotModule = {
  hubspotMap: {
    defaultCampaignSource: 'IHM website',
    whereHearProperty: 'where_did_you_hear_about_us',
    fieldProperties: {},
    constants: {},
    pageUrlProperty: null,
    studentTypeProperty: null,
  } satisfies HubspotMap,
}

export const dynamicsModule = {
  dynamicsMap: {
    interestedUniversities: 100000002,
    enquiryName: null,
    defaultSubject: null,
    campaignFallbackCode: null,
    sendNewCampaign: false,
    messageOnLead: false,
    courseOptions: {},
    packageOptions: {},
    campusOptions: {},
    studentTypeOptions: null,
    leadFields: {},
  } satisfies DynamicsMap,
}

export const courseCrmModule = {
  crmCourses: [] as CrmCourse[],
  crmCampuses: {} as Record<string, CrmCampus>,
  SHORT_COURSE_KH_IDS: [] as number[],
  IHNA_ONLINE_COURSE_CODES: [] as string[],
  dynamicsPackageOptions: {} as Record<string, string>,
  campusOptions: () => [],
  countryKhId: (): number | undefined => undefined,
  crmCourseByKhId: (): CrmCourse | undefined => undefined,
  crmCourseByCode: (): CrmCourse | undefined => undefined,
  crmCoursePickerOptions: () => [],
  fixedKhCourseByForm: { 'nclex-magnet': 33 } as Record<string, number>,
  selectKhCourseByForm: { 'mon-popup': { field: 'course', values: { gdn: 1, gcn: 21 } } } as Record<string, { field: string; values: Record<string, number> }>,
}
