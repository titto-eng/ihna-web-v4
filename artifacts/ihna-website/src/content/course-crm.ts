// CRM reference data for IHNA's enquiry destinations (40 §6). Hand-edited constants; keep it plain data.
// Sources: the old handlers' option lists (walk-in and course-enquiry pages, RDynamics.php course map, functions.php campus maps,
// countries_phone.php). The shared pipeline reads these through src/lib/enquiries/conditions.ts and the adapters; a site without
// them exports empty tables. Course-dependent rules key off the KH id / course code here, not off course collection fields.

/** A course as the CRMs know it. `khId` is the KH portal course id; `code` the national code HubSpot and IHNA Online use. */
export type CrmCourse = {
  khId: number
  code: string
  title: string
  /** Dynamics `new_courseinterested` option value (RDynamics.php). */
  dynamicsOption?: string
  /** On the course pickers of the walk-in and course-enquiry pages. */
  picker?: boolean
}

export const crmCourses: CrmCourse[] = [
  { khId: 363, code: 'HLT54121', title: 'HLT54121 - Diploma of Nursing', dynamicsOption: '100000038', picker: true },
  { khId: 387, code: 'HLT37015', title: 'HLT37015 - Certificate III in Sterilisation Services', dynamicsOption: '100000017', picker: true },
  { khId: 77, code: 'HLT37525', title: 'HLT37525 - Certificate III in Pathology Collection', dynamicsOption: '100000013', picker: true },
  { khId: 396, code: 'HLT35021', title: 'HLT35021 - Certificate III in Dental Assisting', dynamicsOption: '100000031', picker: true },
  { khId: 409, code: 'HLT43021', title: 'HLT43021 - Certificate IV in Allied Health Assistance', picker: true },
  { khId: 384, code: 'CHC51015', title: 'CHC51015 - Diploma of Counselling', dynamicsOption: '100000018', picker: true },
  { khId: 350, code: 'CHC53315', title: 'CHC53315 - Diploma of Mental Health', dynamicsOption: '100000090', picker: true },
  { khId: 406, code: 'CHC52025', title: 'CHC52025 - Diploma of Community Services (Case Management)', picker: true },
  { khId: 388, code: 'CHC52021', title: 'CHC52021 - Diploma of Community Services (Case Management)', dynamicsOption: '100000014' },
  { khId: 395, code: 'CHC43015', title: 'CHC43015 - Certificate IV in Ageing Support', dynamicsOption: '100000005', picker: true },
  { khId: 408, code: 'CHC33021', title: 'CHC33021 - Certificate III in Individual Support (Ageing and Disability)', picker: true },
  { khId: 389, code: 'CHC33015', title: 'CHC33015 - Certificate III in Individual Support (Ageing, Disability)', dynamicsOption: '100000001' },
  { khId: 67, code: 'CHC33015', title: 'CHC33015 - Certificate III in Individual Support (Ageing, Disability)' },
  { khId: 407, code: 'CHC43121', title: 'CHC43121 - Certificate IV in Disability Support', picker: true },
  { khId: 349, code: 'HLT33115', title: 'HLT33115 - Certificate III in Health Services Assistance', dynamicsOption: '100000200', picker: true },
  { khId: 391, code: 'HLT33115', title: 'HLT33115 - Certificate III in Health Services Assistance (Assisting in Nursing Work in Acute Care)', dynamicsOption: '100000003', picker: true },
  { khId: 385, code: 'CHC30121', title: 'CHC30121 - Certificate III in Early Childhood Education and Care', dynamicsOption: '100000019', picker: true },
  { khId: 386, code: 'CHC50121', title: 'CHC50121 - Diploma of Early Childhood Education and Care', dynamicsOption: '100000020', picker: true },
  { khId: 357, code: 'BSB50420', title: 'BSB50420 - Diploma of Leadership and Management', dynamicsOption: '100000101', picker: true },
  { khId: 71, code: 'HLT47315', title: 'HLT47315 - Certificate IV in Health Administration', dynamicsOption: '100000007', picker: true },
  { khId: 72, code: 'HLT57715', title: 'HLT57715 - Diploma of Practice Management', dynamicsOption: '100000008', picker: true },
  { khId: 358, code: 'BSB40520', title: 'BSB40520 - Certificate IV in Leadership and Management', dynamicsOption: '100000102', picker: true },
  { khId: 362, code: 'CHCSS00088', title: 'CHCSS00088 - Induction', picker: true },
  { khId: 80, code: 'CHCSS00070', title: 'CHCSS00070 - Assist Clients with Medication Skill Set', picker: true },
  { khId: 361, code: 'HLTWHS005', title: 'HLTWHS005 - Conduct Manual Tasks Safely', picker: true },
  { khId: 355, code: 'CHCSS00114', title: 'CHCSS00114 - Entry into Care Roles Skill Set', dynamicsOption: '100000100', picker: true },
  { khId: 347, code: 'HLTSS00064', title: 'HLTSS00064 - Infection Control Skill Set', dynamicsOption: '100000083', picker: true },
  { khId: 14, code: 'IVCN', title: 'IVCN - Intravenous Cannulation (IV Cannulation)', dynamicsOption: '100000026', picker: true },
  { khId: 115, code: 'HLTAID011', title: 'HLTAID011 - Provide First Aid', dynamicsOption: '100000091', picker: true },
  { khId: 352, code: 'HLTAID009', title: 'HLTAID009 - Provide Cardiopulmonary Resuscitation (CPR)', dynamicsOption: '100000092', picker: true },
  { khId: 397, code: 'HLTAID010', title: 'HLTAID010 - Provide Basic Emergency Life Support', picker: true },
  { khId: 340, code: 'HLT43015', title: 'HLT43015 - Certificate IV in Allied Health Assistance (Physiotherapy)', dynamicsOption: '100000088' },
  { khId: 78, code: 'HLTENN007', title: 'HLTENN007 - Administer and Monitor Medicines and Intravenous Therapy', dynamicsOption: '100000025' },
  { khId: 110, code: 'FLINDERS-BDDE', title: 'IHNA to Flinders University - Bachelor of Disability and Developmental Education' },
  // The old quick-enquiry handler treats KH 400 as the anaesthetic technology course (extra staff email); RDynamics.php's comment on
  // option 100000059 names another course. TODO(ihna): confirm KH 400 and its Dynamics option with the CRM owner.
  { khId: 400, code: 'HLT57921', title: 'HLT57921 - Diploma of Anaesthetic Technology and Practice' },
]

/** KH ids of the self-enrol short courses: KH portal + self-enrol autoresponder + /short-course-enquiry-thanks/ (functions.php:~900-1013). */
export const SHORT_COURSE_KH_IDS = [352, 397, 361, 14, 115]
/** Course codes whose quick enquiries also go to IHNA Online (functions.php:698). */
export const IHNA_ONLINE_COURSE_CODES = ['CHC33021', 'HLT33115', 'HLT35021', 'CHC52025']

/** Dynamics package options keyed by `ihna_web_package_id` (RDynamics.php); a package overrides the course option. */
export const dynamicsPackageOptions: Record<string, string> = {
  '1': '100000017', '2': '100000018', '5': '100000019', '3': '100000020', '7': '100000021', '4': '100000030',
}

/** A campus as each CRM numbers it. Keys are the `campus` select values of the IHNA forms. */
export type CrmCampus = { label: string; hubspot?: string; kh?: number; dynamics?: number }

export const crmCampuses: Record<string, CrmCampus> = {
  'melbourne-heidelberg': { label: 'Melbourne (Heidelberg)', hubspot: '1', kh: 1, dynamics: 100000004 },
  'melbourne-cbd': { label: 'Melbourne CBD', hubspot: '2', kh: 4, dynamics: 100000005 },
  'perth-sgt': { label: 'Perth (SGT)', hubspot: '4', kh: 13, dynamics: 100000000 },
  'sydney-parramatta': { label: 'Sydney (Parramatta)', hubspot: '5', kh: 3, dynamics: 100000007 },
  // TODO(ihna): Dynamics has no Brisbane option yet (brief §2); the lead goes without a preferred campus.
  brisbane: { label: 'Brisbane', hubspot: '10', kh: 10 },
  online: { label: 'Online', hubspot: '3', kh: 5, dynamics: 100000003 },
  cochin: { label: 'Cochin, India', hubspot: '6', kh: 6, dynamics: 100000008 },
}

/** KH course id a form without a course picker always sends (portalCrm). IHNA: none. */
export const fixedKhCourseByForm: Record<string, number> = {}
/** KH course id picked from a form's own select values (portalCrm). IHNA: none. */
export const selectKhCourseByForm: Record<string, { field: string; values: Record<string, number> }> = {}

/** `campus` select options for a form, in the order given. */
export const campusOptions = (...keys: string[]) => keys.map((value) => ({ value, label: crmCampuses[value]?.label ?? value }))

/** KH portal country ids (`ihna_portal.countries`, from countries_phone.php). The forms keep country names; portalCrm sends the id. */
const KH_COUNTRIES: [number, string][] = [
  [1, "Afghanistan"], [2, "Albania"], [3, "Algeria"], [4, "American Samoa"], [5, "Andorra"], [6, "Angola"], [7, "Anguilla"],
  [8, "Antarctica"], [9, "Antigua and Barbuda"], [10, "Argentina"], [11, "Armenia"], [12, "Aruba"], [13, "Australia"], [14, "Austria"],
  [15, "Azerbaijan"], [16, "Bahamas"], [17, "Bahrain"], [18, "Bangladesh"], [19, "Barbados"], [20, "Belarus"], [21, "Belgium"],
  [22, "Belize"], [23, "Benin"], [24, "Bermuda"], [25, "Bhutan"], [26, "Bolivia"], [27, "Bosnia and Herzegovina"], [28, "Botswana"],
  [29, "Bouvet Island"], [30, "Brazil"], [31, "British Indian Ocean Territory"], [32, "Brunei Darussalam"], [33, "Bulgaria"],
  [34, "Burkina Faso"], [35, "Burundi"], [36, "Cambodia"], [37, "Cameroon"], [38, "Canada"], [39, "Cape Verde"], [40, "Cayman Islands"],
  [41, "Central African Republic"], [42, "Chad"], [43, "Chile"], [44, "China"], [45, "Christmas Island"], [46, "Cocos (Keeling) Islands"],
  [47, "Colombia"], [48, "Comoros"], [49, "Congo"], [50, "Congo, the Democratic Republic of the"], [51, "Cook Islands"],
  [52, "Costa Rica"], [53, "Cote D'Ivoire"], [54, "Croatia"], [55, "Cuba"], [56, "Cyprus"], [57, "Czech Republic"], [58, "Denmark"],
  [59, "Djibouti"], [60, "Dominica"], [61, "Dominican Republic"], [62, "Ecuador"], [63, "Egypt"], [64, "El Salvador"],
  [65, "Equatorial Guinea"], [66, "Eritrea"], [67, "Estonia"], [68, "Ethiopia"], [69, "Falkland Islands (Malvinas)"],
  [70, "Faroe Islands"], [71, "Fiji"], [72, "Finland"], [73, "France"], [74, "French Guiana"], [75, "French Polynesia"],
  [76, "French Southern Territories"], [77, "Gabon"], [78, "Gambia"], [79, "Georgia"], [80, "Germany"], [81, "Ghana"], [82, "Gibraltar"],
  [83, "Greece"], [84, "Greenland"], [85, "Grenada"], [86, "Guadeloupe"], [87, "Guam"], [88, "Guatemala"], [89, "Guinea"],
  [90, "Guinea-Bissau"], [91, "Guyana"], [92, "Haiti"], [93, "Heard Island and Mcdonald Islands"], [94, "Holy See (Vatican City State)"],
  [95, "Honduras"], [96, "Hong Kong"], [97, "Hungary"], [98, "Iceland"], [99, "India"], [100, "Indonesia"],
  [101, "Iran, Islamic Republic of"], [102, "Iraq"], [103, "Ireland"], [104, "Israel"], [105, "Italy"], [106, "Jamaica"], [107, "Japan"],
  [108, "Jordan"], [109, "Kazakhstan"], [110, "Kenya"], [111, "Kiribati"], [112, "Korea, Democratic People's Republic of"],
  [113, "Korea, Republic of"], [114, "Kuwait"], [115, "Kyrgyzstan"], [116, "Lao People's Democratic Republic"], [117, "Latvia"],
  [118, "Lebanon"], [119, "Lesotho"], [120, "Liberia"], [121, "Libyan Arab Jamahiriya"], [122, "Liechtenstein"], [123, "Lithuania"],
  [124, "Luxembourg"], [125, "Macao"], [126, "Macedonia, the Former Yugoslav Republic of"], [127, "Madagascar"], [128, "Malawi"],
  [129, "Malaysia"], [130, "Maldives"], [131, "Mali"], [132, "Malta"], [133, "Marshall Islands"], [134, "Martinique"], [135, "Mauritania"],
  [136, "Mauritius"], [137, "Mayotte"], [138, "Mexico"], [139, "Micronesia, Federated States of"], [140, "Moldova, Republic of"],
  [141, "Monaco"], [142, "Mongolia"], [143, "Montserrat"], [144, "Morocco"], [145, "Mozambique"], [146, "Myanmar"], [147, "Namibia"],
  [148, "Nauru"], [149, "Nepal"], [150, "Netherlands"], [151, "Netherlands Antilles"], [152, "New Caledonia"], [153, "New Zealand"],
  [154, "Nicaragua"], [155, "Niger"], [156, "Nigeria"], [157, "Niue"], [158, "Norfolk Island"], [159, "Northern Mariana Islands"],
  [160, "Norway"], [161, "Oman"], [162, "Pakistan"], [163, "Palau"], [164, "Palestinian Territory, Occupied"], [165, "Panama"],
  [166, "Papua New Guinea"], [167, "Paraguay"], [168, "Peru"], [169, "Philippines"], [170, "Pitcairn"], [171, "Poland"], [172, "Portugal"],
  [173, "Puerto Rico"], [174, "Qatar"], [175, "Reunion"], [176, "Romania"], [177, "Russian Federation"], [178, "Rwanda"],
  [179, "Saint Helena"], [180, "Saint Kitts and Nevis"], [181, "Saint Lucia"], [182, "Saint Pierre and Miquelon"],
  [183, "Saint Vincent and the Grenadines"], [184, "Samoa"], [185, "San Marino"], [186, "Sao Tome and Principe"], [187, "Saudi Arabia"],
  [188, "Senegal"], [189, "Serbia and Montenegro"], [190, "Seychelles"], [191, "Sierra Leone"], [192, "Singapore"], [193, "Slovakia"],
  [194, "Slovenia"], [195, "Solomon Islands"], [196, "Somalia"], [197, "South Africa"],
  [198, "South Georgia and the South Sandwich Islands"], [199, "Spain"], [200, "Sri Lanka"], [201, "Sudan"], [202, "Suriname"],
  [203, "Svalbard and Jan Mayen"], [204, "Swaziland"], [205, "Sweden"], [206, "Switzerland"], [207, "Syrian Arab Republic"],
  [208, "Taiwan, Province of China"], [209, "Tajikistan"], [210, "Tanzania, United Republic of"], [211, "Thailand"], [212, "Timor-Leste"],
  [213, "Togo"], [214, "Tokelau"], [215, "Tonga"], [216, "Trinidad and Tobago"], [217, "Tunisia"], [218, "Turkey"], [219, "Turkmenistan"],
  [220, "Turks and Caicos Islands"], [221, "Tuvalu"], [222, "Uganda"], [223, "Ukraine"], [224, "United Arab Emirates"],
  [225, "United Kingdom"], [226, "United States"], [227, "United States Minor Outlying Islands"], [228, "Uruguay"], [229, "Uzbekistan"],
  [230, "Vanuatu"], [231, "Venezuela"], [232, "Viet Nam"], [233, "Virgin Islands, British"], [234, "Virgin Islands, U.s."],
  [235, "Wallis and Futuna"], [236, "Western Sahara"], [237, "Yemen"], [238, "Zambia"], [239, "Zimbabwe"],]

const norm = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]/g, '')
const KH_BY_NAME = new Map(KH_COUNTRIES.map(([id, name]) => [norm(name), id]))
// Intl names (src/lib/enquiries/countries.ts) that the KH list spells differently.
const ALIASES: Record<string, string> = {
  'Myanmar (Burma)': 'Myanmar', 'Czechia': 'Czech Republic', 'Türkiye': 'Turkey', 'Côte d’Ivoire': "Cote D'Ivoire", 'Eswatini': 'Swaziland',
  'North Macedonia': 'Macedonia, the Former Yugoslav Republic of', Serbia: 'Serbia and Montenegro', Montenegro: 'Serbia and Montenegro', 'Congo - Kinshasa': 'Congo, The Democratic Republic of the', 'Congo - Brazzaville': 'Congo',
  'Hong Kong SAR China': 'Hong Kong', 'Macao SAR China': 'Macao', 'Palestinian Territories': 'Palestinian Territory, Occupied',
  'South Korea': 'Korea, Republic of', 'North Korea': "Korea, Democratic People's Republic of", 'Vietnam': 'Viet Nam',
  'Laos': "Lao People's Democratic Republic", 'Russia': 'Russian Federation', 'Syria': 'Syrian Arab Republic', 'Iran': 'Iran, Islamic Republic of',
  'Moldova': 'Moldova, Republic of', 'Tanzania': 'Tanzania, United Republic of', 'Micronesia': 'Micronesia, Federated States of',
  'Vatican City': 'Holy See (Vatican City State)', 'Brunei': 'Brunei Darussalam', 'Libya': 'Libyan Arab Jamahiriya', 'Timor-Leste': 'East Timor',
  'St. Kitts & Nevis': 'Saint Kitts and Nevis', 'St. Lucia': 'Saint Lucia', 'St. Vincent & Grenadines': 'Saint Vincent and the Grenadines',
  'São Tomé & Príncipe': 'Sao Tome and Principe', Taiwan: 'Taiwan, Province of China', 'Bosnia & Herzegovina': 'Bosnia and Herzegovina',
  'Trinidad & Tobago': 'Trinidad and Tobago', 'Antigua & Barbuda': 'Antigua and Barbuda',
}

/** KH country id for a country name, or undefined. */
export function countryKhId(name: string | null | undefined): number | undefined {
  if (!name) return undefined
  return KH_BY_NAME.get(norm(ALIASES[name] ?? name)) ?? KH_BY_NAME.get(norm(name))
}

export const crmCourseByKhId = (khId: number | null | undefined): CrmCourse | undefined => (khId ? crmCourses.find((c) => c.khId === khId) : undefined)
export const crmCourseByCode = (code: string | null | undefined): CrmCourse | undefined => (code ? crmCourses.find((c) => c.code === code) : undefined)
/** `courseKhId` select options (the walk-in and course-enquiry pickers). */
export const crmCoursePickerOptions = () => crmCourses.filter((c) => c.picker).map((c) => ({ value: String(c.khId), label: c.title }))
