// IHNA campaign codes (41-campaigns §2). Generated once from ../ihna-web-2.0/campaign_codes.php on 2026-10-21 and edited by hand
// since: add a row here when marketing adds a code. 57 codes (the file defines `gadbrislocaliq` twice; the later one, line 327, wins).
// `dynamicsCampaignId` is the Dynamics 365 campaign record id (an identifier, not a credential). `line` is the source line, for review.
// Shared code (src/lib/enquiries/campaign.ts) reads this table; a site without codes exports an empty array.
export type CampaignCode = {
  code: string
  line?: number
  /** Dynamics `new_campaign` and the staff email "Lead source". */
  leadSrc: string | null
  /** Staff email "Lead description". */
  leadDesc: string | null
  /** KH portal `enquirySourceId`; null for the partial codes. */
  enquirySourceId: number | null
  /** Dynamics `campaignid@odata.bind` target; null for the partial codes. */
  dynamicsCampaignId: string | null
  /** HubSpot `campaign_source`; an empty string counts as unset. */
  hsCampaignSource: string | null
}

export const campaignCodes: CampaignCode[] = [
  { code: "mcryc2l0", line: 4, leadSrc: "IHNA Website", leadDesc: "ihna.edu.au Enquiry from IHNA Website", enquirySourceId: 76, dynamicsCampaignId: "c54d0f9a-e303-eb11-a813-000d3a6a96b8", hsCampaignSource: "IHNA Website" },
  { code: "rpl", line: 11, leadSrc: "RPL Landing Page", leadDesc: "ihna.edu.au Enquiry from RPL Landing Page", enquirySourceId: 227, dynamicsCampaignId: "074e0f9a-e303-eb11-a813-000d3a6a96b8", hsCampaignSource: "RPL Landing Page" },
  { code: "blog", line: 18, leadSrc: "IHNA Blog", leadDesc: "IHNA Blog", enquirySourceId: 483, dynamicsCampaignId: "1bfd6fd0-2925-ed11-9db1-00224891ef89", hsCampaignSource: "IHNA Blog" },
  { code: "youtube", line: 25, leadSrc: "IHNA YouTube", leadDesc: "IHNA YouTube", enquirySourceId: 484, dynamicsCampaignId: "a05805e2-2925-ed11-9db2-00224891e279", hsCampaignSource: "IHNA YouTube" },
  { code: "pillarDMseo", line: 32, leadSrc: "Pillar Pages Digital Marketing SEO", leadDesc: "Enquiry through Pillar Pages Digital Marketing SEO", enquirySourceId: 500, dynamicsCampaignId: "bc861492-134a-ed11-bba2-0022489331d1", hsCampaignSource: "Pillar Pages Digital Marketing SEO" },
  { code: "fbbutton", line: 39, leadSrc: "Facebook Page Button", leadDesc: "Facebook Page Button", enquirySourceId: 508, dynamicsCampaignId: "2fe75be6-aa77-ed11-81ac-00224893382a", hsCampaignSource: "Facebook Page Button" },
  { code: "mwtstaff", line: 46, leadSrc: "MWT Staff", leadDesc: "MWT Staff", enquirySourceId: 542, dynamicsCampaignId: "009cea85-5eea-ed11-8848-0022489330d1", hsCampaignSource: "MWT Staff" },
  { code: "osmarketing", line: 53, leadSrc: "Organic Social Media", leadDesc: "Organic Social Media", enquirySourceId: 586, dynamicsCampaignId: "55f61d3e-1926-ee11-9965-0022489330ba", hsCampaignSource: "Organic Social Media" },
  { code: "ga", line: 60, leadSrc: "Google Adwords", leadDesc: "Google Adwords", enquirySourceId: 600, dynamicsCampaignId: "a6c4800d-0135-ee11-bdf5-0022489330d1", hsCampaignSource: "Google Adwords" },
  { code: "ihnaindia", line: 67, leadSrc: "IHNA India Website", leadDesc: "IHNA India Website", enquirySourceId: 519, dynamicsCampaignId: "1882b867-ed8f-ed11-aad1-0022489330d1", hsCampaignSource: "IHNA India Website" },
  { code: "zw1hawxjbxa", line: 74, leadSrc: "Email Campaign", leadDesc: "ihna.edu.au Enquiry from Email Campaign", enquirySourceId: 27, dynamicsCampaignId: "ab4d0f9a-e303-eb11-a813-000d3a6a96b8", hsCampaignSource: "Email Campaign" },
  { code: "gasyd", line: 81, leadSrc: "Google Ad Sydney", leadDesc: "Google Ad Sydney", enquirySourceId: 594, dynamicsCampaignId: "61ded25e-9a32-ee11-bdf3-00224893ba85", hsCampaignSource: "Google Ad Sydney" },
  { code: "gaperth", line: 88, leadSrc: "Google Ad Perth", leadDesc: "Google Ad Perth", enquirySourceId: 595, dynamicsCampaignId: "bd6ef667-9a32-ee11-bdf4-0022489330d1", hsCampaignSource: "Google Ad Perth" },
  { code: "gamelb", line: 95, leadSrc: "Google Ad Melbourne", leadDesc: "Google Ad Melbourne", enquirySourceId: 596, dynamicsCampaignId: "d96b7d6f-9a32-ee11-bdf4-002248933d62", hsCampaignSource: "Google Ad Melbourne" },
  { code: "gakochi", line: 102, leadSrc: "Google Ad Kochi", leadDesc: "Google Ad Kochi", enquirySourceId: 589, dynamicsCampaignId: "38dd68b9-c431-ee11-bdf3-002248933bb1", hsCampaignSource: "Google Ad Kochi" },
  { code: "fbsyd", line: 110, leadSrc: "Facebook Ad Sydney", leadDesc: "Facebook Ad Sydney", enquirySourceId: 590, dynamicsCampaignId: "8c07d85b-9932-ee11-bdf4-00224893382a", hsCampaignSource: "Facebook Ad Sydney" },
  { code: "fbperth", line: 117, leadSrc: "Facebook Ad Perth", leadDesc: "Facebook Ad Perth", enquirySourceId: 591, dynamicsCampaignId: "272a6162-9932-ee11-bdf4-002248933f01", hsCampaignSource: "Facebook Ad Perth" },
  { code: "fbmelb", line: 124, leadSrc: "Facebook Ad Melbourne", leadDesc: "Facebook Ad Melbourne", enquirySourceId: 592, dynamicsCampaignId: "2507506e-9932-ee11-bdf4-00224893382a", hsCampaignSource: "Facebook Ad Melbourne" },
  { code: "fbkochi", line: 131, leadSrc: "Facebook Ad Kochi", leadDesc: "Facebook Ad Kochi", enquirySourceId: 593, dynamicsCampaignId: "97830175-9932-ee11-bdf4-0022489330d1", hsCampaignSource: "Facebook Ad Kochi" },
  { code: "zwsilmo", line: 139, leadSrc: "Email", leadDesc: "Email", enquirySourceId: 602, dynamicsCampaignId: "52ac2e16-d440-ee11-bdf3-002248933b6d", hsCampaignSource: "" },
  { code: "fbadtasmania", line: 146, leadSrc: "Facebook Ad Tasmania", leadDesc: "Facebook Ad Tasmania", enquirySourceId: 606, dynamicsCampaignId: "f144f8af-0447-ee11-be6f-002248933832", hsCampaignSource: "Facebook Ad Tasmania" },
  { code: "gadtasmania", line: 153, leadSrc: "Google Ad Tasmania", leadDesc: "Google Ad Tasmania", enquirySourceId: 605, dynamicsCampaignId: "a42b9f8b-0447-ee11-be6f-0022489330d1", hsCampaignSource: "Google Ad Tasmania" },
  { code: "fbadqueensland", line: 160, leadSrc: "Facebook Ad Queensland", leadDesc: "Facebook Ad Queensland", enquirySourceId: 604, dynamicsCampaignId: "e799df76-0447-ee11-be6f-002248933f01", hsCampaignSource: "Facebook Ad Queensland" },
  { code: "gadqueensland", line: 167, leadSrc: "Google Ad Queensland", leadDesc: "Google Ad Queensland", enquirySourceId: 603, dynamicsCampaignId: "45bb455f-0347-ee11-be6f-002248933463", hsCampaignSource: "Google Ad Queensland" },
  { code: "gabrisbane", line: 174, leadSrc: "Google Ad Brisbane", leadDesc: "Google Ad Brisbane", enquirySourceId: 611, dynamicsCampaignId: "13a89b2e-1c82-ee11-8179-002248933419", hsCampaignSource: "Google Ad Brisbane" },
  { code: "fbbrisbane", line: 181, leadSrc: "Facebook Ad Brisbane", leadDesc: "Facebook Ad Brisbane", enquirySourceId: 612, dynamicsCampaignId: "a00ad677-1c82-ee11-8179-002248933419", hsCampaignSource: "Facebook Ad Brisbane" },
  { code: "sydneywalkin", line: 188, leadSrc: "Sydney Walkin", leadDesc: "Sydney Walkin", enquirySourceId: 616, dynamicsCampaignId: "e5fbff49-03b1-ee11-a569-002248933b6d", hsCampaignSource: "Sydney Walkin" },
  { code: "melbournewalkin", line: 195, leadSrc: "Melbourne Walkin", leadDesc: "Melbourne Walkin", enquirySourceId: 615, dynamicsCampaignId: "b9a74c3f-03b1-ee11-a569-002248933e23", hsCampaignSource: "Melbourne Walkin" },
  { code: "perthwalkin", line: 202, leadSrc: "Perth Walkin", leadDesc: "Perth Walkin", enquirySourceId: 614, dynamicsCampaignId: "9c7e4433-03b1-ee11-a569-002248933f01", hsCampaignSource: "Perth Walkin" },
  { code: "pm", line: 209, leadSrc: "DON Print Media", leadDesc: "DON Print Media", enquirySourceId: 624, dynamicsCampaignId: "0eb02594-e0b6-ef11-b8e8-000d3ad17c16", hsCampaignSource: "DON Print Media" },
  { code: "donctis", line: 216, leadSrc: "DON CT IS", leadDesc: "DON CT IS", enquirySourceId: 628, dynamicsCampaignId: "3b74c41c-f9ec-ef11-9342-002248967891", hsCampaignSource: "DON CT IS" },
  { code: "doncthsa", line: 223, leadSrc: "DON CT HSA", leadDesc: "DON CT HSA", enquirySourceId: 626, dynamicsCampaignId: "ed427801-f9ec-ef11-9342-000d3ad1445f", hsCampaignSource: "DON CT HSA" },
  { code: "donctpc", line: 230, leadSrc: "DON CT PC", leadDesc: "DON CT PC", enquirySourceId: 627, dynamicsCampaignId: "45e00c14-f9ec-ef11-9342-000d3ad1445f", hsCampaignSource: "DON CT PC" },
  { code: "fbmelblp", line: 237, leadSrc: "Facebook Ad Melbourne LP", leadDesc: "Facebook Ad Melbourne LP", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Facebook Ad Melbourne LP" },
  { code: "fbperthlp", line: 242, leadSrc: "Facebook Ad Perth LP", leadDesc: "Facebook Ad Perth LP", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Facebook Ad Perth LP" },
  { code: "fbsydlp", line: 247, leadSrc: "Facebook Ad Sydney LP", leadDesc: "Facebook Ad Sydney LP", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Facebook Ad Sydney LP" },
  { code: "fbbrisblp", line: 252, leadSrc: "Facebook Ad Brisbane LP", leadDesc: "Facebook Ad Brisbane LP", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Facebook Ad Brisbane LP" },
  { code: "tollfree", line: 257, leadSrc: "Reception Toll Free Number", leadDesc: "Reception Toll Free Number", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Reception Toll Free Number" },
  { code: "gamelbsub", line: 262, leadSrc: "Google Ad Melbourne Suburb", leadDesc: "Google Ad Melbourne Suburb", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Google Ad Melbourne Suburb" },
  { code: "gasydsub", line: 267, leadSrc: "Google Ad Sydney Suburb", leadDesc: "Google Ad Sydney Suburb", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Google Ad Sydney Suburb" },
  { code: "gabrisbanesub", line: 272, leadSrc: "Google Ad Brisbane Suburb", leadDesc: "Google Ad Brisbane Suburb", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Google Ad Brisbane Suburb" },
  { code: "fbads", line: 277, leadSrc: "Facebook Ads", leadDesc: "Facebook Ads", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Facebook Ads" },
  { code: "fbbris", line: 282, leadSrc: "Facebook Ad Brisbane", leadDesc: "Facebook Ad Brisbane", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Facebook Ad Brisbane" },
  { code: "gamelbperfmax", line: 287, leadSrc: "DON Google Ad Melbourne - Perf Max", leadDesc: "DON Google Ad Melbourne - Perf Max", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "DON Google Ad Melbourne - Perf Max" },
  { code: "gasydperfmax", line: 292, leadSrc: "DON Google Ad Sydney - Perf Max", leadDesc: "DON Google Ad Sydney - Perf Max", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "DON Google Ad Sydney - Perf Max" },
  { code: "gabrisperfmax", line: 297, leadSrc: "DON Google Ad Brisbane - Perf Max", leadDesc: "DON Google Ad Brisbane - Perf Max", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "DON Google Ad Brisbane - Perf Max" },
  { code: "nineads", line: 302, leadSrc: "DON Nine Ads Paid", leadDesc: "DON Nine Ads Paid", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "DON Nine Ads Paid" },
  { code: "fbadbrislocaliq", line: 312, leadSrc: "Facebook Ad Brisbane - Localiq", leadDesc: "Facebook Ad Brisbane - Localiq", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Facebook Ad Brisbane - Localiq" },
  { code: "gapmaxsyd", line: 317, leadSrc: "DON Google Ad Sydney - Perf Max", leadDesc: "DON Google Ad Sydney - Perf Max", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "DON Google Ad Sydney - Perf Max" },
  { code: "gadbrispmaxlocaliq", line: 322, leadSrc: "Google Ad Brisbane Perf Max - Localiq", leadDesc: "Google Ad Brisbane Perf Max - Localiq", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Google Ad Brisbane Perf Max - Localiq" },
  { code: "gadbrislocaliq", line: 327, leadSrc: "Google Ad Brisbane - Localiq", leadDesc: "Google Ad Brisbane - Localiq", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Google Ad Brisbane - Localiq" },
  { code: "gadperfmax", line: 332, leadSrc: "Google Ad Australia Perf Max", leadDesc: "Google Ad Australia Perf Max", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Google Ad Australia Perf Max" },
  { code: "gapmaxmel", line: 337, leadSrc: "DON Google Ad Melbourne - Perf Max", leadDesc: "DON Google Ad Melbourne - Perf Max", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "DON Google Ad Melbourne - Perf Max" },
  { code: "gadintaus", line: 342, leadSrc: "Google Ad International AUS", leadDesc: "Google Ad International AUS", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "Google Ad International AUS" },
  { code: "garetarget", line: 347, leadSrc: "DON Retarget ads Google", leadDesc: "DON Retarget ads Google", enquirySourceId: null, dynamicsCampaignId: null, hsCampaignSource: "DON Retarget ads Google" },
  { code: "lp_default", line: 352, leadSrc: "IHNA Landing Pages", leadDesc: "IHNA Landing Pages", enquirySourceId: 597, dynamicsCampaignId: "c0b70c7f-9a32-ee11-bdf3-002248933bb1", hsCampaignSource: "IHNA Landing Pages" },
  { code: "default", line: 359, leadSrc: "IHNA Web Site", leadDesc: "Enquiry from IHNA Website", enquirySourceId: 2, dynamicsCampaignId: "194e0f9a-e303-eb11-a813-000d3a6a96b8", hsCampaignSource: "IHNA Website" },
]

const byCode = new Map(campaignCodes.map((c) => [c.code, c]))

/** The table row for a code (case-sensitive, as on the old site), or null. */
export const campaignByCode = (code: string | null | undefined): CampaignCode | null => (code ? byCode.get(code) ?? null : null)
