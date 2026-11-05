-- IHNA fixture rows (hand-written, synthetic; tests/portal/ihna-queries.test.ts). Run the queries with today = '2026-10-16' (AS_OF).
-- No real student, staff or agent data (rule 4): people and agencies are "Fixture ...", emails end in example.test.
-- Real ids only where the old theme proves them: course 363 (Diploma of Nursing, functions.php:1323), campus 8 (functions.php:1316,
-- template-monthly-calendar.php:58; its name is not known, so it is a fixture name), the six ihna_web_packages (RDynamics.php:991).
-- Ids: campuses 5, 8; courses 363, 92xx; batches 60xx; batch dates 61xx; units 70xx; units of study 80xx; partners 95xx; invoices 99xx.
SET NAMES utf8mb4;

INSERT INTO campuses (id, campus_name) VALUES
  (5, 'Fixture Campus Five'),
  (8, 'Fixture Campus Eight');

INSERT INTO courses (id, course_name, enable, normal_hours, application_form5, application_form6, course_code, course_category_id, refer_friend, application_form10) VALUES
  (363, 'Diploma of Nursing', 1, NULL, 1, 1, 'HLT54121', 3, 1, 0),
  (9201, 'Fixture Census Course', 1, NULL, 1, 0, 'FIX9201', 3, 0, 0),
  (9202, 'Fixture Pre-2018 Course', 1, NULL, 1, 0, 'FIX9202', 3, 0, 0),
  (9203, 'Fixture Disabled Census Course', 0, NULL, 1, 0, 'FIX9203', 3, 0, 0);

-- course_batches: 363 at campus 8 (intakes, calendar, census), one at campus 1 and one hidden (both excluded from campus-8 reads).
INSERT INTO course_batches (id, course_id, campus_id, partner_id, status, enable, show_in_website, intake_id, mod_of_delivery_id, start_date, end_date, graduation_day, orientation_date, batch_name, batch_status_id) VALUES
  (6001, 363, 8, 1, 'Active', 1, 1, 1, 1, '2026-11-09', '2028-05-05', NULL, NULL, 'DN-2026-NOV', 1),
  (6002, 363, 8, 1, 'Active', 1, 1, 1, 1, '2027-02-08', '2028-08-04', NULL, NULL, 'DN-2027-FEB', 2),
  (6003, 363, 8, 1, 'Active', 1, 1, 1, 3, '2026-12-07', '2028-06-02', NULL, NULL, 'DN-2026-DEC-BL', 1),
  (6004, 363, 1, 1, 'Active', 1, 1, 1, 1, '2026-11-16', '2028-05-12', NULL, NULL, 'DN-2026-NOV-C1', 1),
  (6005, 363, 8, 1, 'Active', 1, 0, 1, 1, '2026-11-23', '2028-05-19', NULL, NULL, 'DN-2026-NOV-HIDDEN', 1),
  (6006, 363, 8, 1, 'Active', 1, 1, 1, 1, '2025-03-03', '2026-08-28', NULL, NULL, 'DN-2025-MAR', 3),
  (6007, 9201, 8, 1, 'Active', 1, 1, 1, 1, '2025-07-14', '2026-12-18', NULL, NULL, 'FIX-2025-JUL', 2),
  (6008, 9201, 2, 1, 'Active', 1, 1, 1, 1, '2025-07-14', '2026-12-18', NULL, NULL, 'FIX-2025-JUL-C2', 1),
  (6009, 9202, 8, 1, 'Active', 1, 1, 1, 1, '2017-05-01', '2018-11-30', NULL, NULL, 'FIX-2017', 1),
  (6010, 9201, 8, 1, 'Active', 1, 1, 1, 1, '2025-01-13', '2026-06-26', NULL, NULL, 'FIX-2025-JAN-CLOSED', 4),
  (6011, 9203, 8, 1, 'Active', 1, 1, 1, 1, '2025-02-03', '2026-07-31', NULL, NULL, 'FIX-2025-FEB-DISABLED', 1);

INSERT INTO course_batch_dates (id, course_batch_id, enrollment_end_date, semester_census_date, semester, start_date, semester_end_date, sem_flag) VALUES
  (6101, 6001, '2026-11-02', NULL, 1, '2026-11-09', '2027-04-30', 1),
  (6102, 6001, NULL, NULL, 2, '2027-05-10', '2027-10-29', 1),
  (6103, 6002, '2027-02-01', NULL, 1, '2027-02-08', '2027-07-30', 1),
  (6104, 6002, NULL, NULL, 0, '2027-02-08', NULL, 0),
  (6105, 6003, '2026-11-30', NULL, 0, '2026-12-07', '2027-05-28', 1),
  (6106, 6004, '2026-11-09', NULL, 1, '2026-11-16', '2027-05-07', 1),
  (6107, 6005, '2026-11-16', NULL, 1, '2026-11-23', '2027-05-14', 1),
  (6108, 6006, NULL, NULL, 1, '2025-03-03', '2025-08-29', 1),
  (6109, 6006, NULL, NULL, 2, '2025-09-08', '2026-02-27', 1),
  (6110, 6007, NULL, NULL, 1, '2025-07-14', '2025-12-12', 1),
  (6111, 6007, NULL, NULL, 1, '2025-07-14', '2025-12-19', 0);

INSERT INTO semesters (id, name) VALUES
  (1, 'Semester 1'),
  (2, 'Semester 2');

INSERT INTO course_units (id, unit_code, unit_name, semester) VALUES
  (7001, 'HLTENN035', 'Fixture unit A', 1),
  (7002, 'HLTENN036', 'Fixture unit B', 1),
  (7003, 'HLTENN037', 'Fixture unit C', 2),
  (7004, 'CHCDIV001', 'Fixture unit D', 1),
  (7101, 'FIXU101', 'Fixture unit E', 1);

-- user_id 0 = the batch template rows; 4321 is a synthetic per-student row the census reads must ignore.
INSERT INTO course_unit_of_studies (id, course_id, course_batch_id, semester_id, user_id, course_unit_of_study_id, census_date, eftsl_factor) VALUES
  (8001, 363, 6006, 1, 0, 8001, '2025-04-11', 0.0625),
  (8002, 363, 6006, 1, 0, 8002, '2025-05-16', 0.0500),
  (8003, 363, 6006, 2, 0, 8003, '2025-10-10', 0.0750),
  (8004, 363, 6006, 1, 4321, 8004, '2025-04-18', 0.0625),
  (8005, 363, 6001, 1, 0, 8005, '2026-12-11', 0.0625),
  (8006, 9201, 6007, 1, 0, 8006, NULL, 0.1250),
  (8007, 9202, 6009, 1, 0, 8007, '2017-06-01', 0.1000),
  (8008, 9201, 6010, 1, 0, 8008, '2025-02-14', 0.1000),
  (8009, 9203, 6011, 1, 0, 8009, '2025-03-07', 0.1000),
  (8010, 9201, 6008, 1, 0, 8010, '2025-08-15', 0.1000);

INSERT INTO course_unit_of_study_units (id, course_unit_of_study_id, course_unit_id) VALUES
  (1, 8001, 7001),
  (2, 8002, 7002),
  (3, 8002, 7004),
  (4, 8003, 7003),
  (5, 8004, 7001),
  (6, 8005, 7001),
  (7, 8006, 7101),
  (8, 8007, 7101),
  (9, 8008, 7101),
  (10, 8009, 7101),
  (11, 8010, 7101);

INSERT INTO course_unit_timetable_details (id, course_batch_id, course_unit_id, start_date_time) VALUES
  (1, 6006, 7001, '2025-03-10 09:00:00'),
  (2, 6006, 7001, '2025-03-03 09:00:00'),
  (3, 6006, 7002, '2025-04-07 09:30:00'),
  (4, 6007, 7101, '2025-07-21 09:00:00');

-- RDynamics.php:991 (name and IHNA course id from its comments).
INSERT INTO ihna_web_packages (id, name, ihna_course_id) VALUES
  (1, 'ELICOS + CHC43015 Certificate IV in Ageing Support', 76),
  (2, 'ELICOS + HLT47315 Certificate IV in Health Administration', 71),
  (3, 'EAP + HLT47315 Certificate IV in Health Administration', 71),
  (4, 'EAP + CHC43015 Certificate IV in Ageing Support + CHC50113 Diploma of Early Childhood Education and Care', 76),
  (5, 'EAP + HLT47315 Certificate IV in Health Administration + HLT57715 Diploma of Practice Management', 71),
  (7, 'HLT54115 Diploma of Nursing + CHC43015 Certificate IV in Ageing Support', 75);

-- Agents: 9501, 9503, 9506 are listed (9506 has two access rows: listed once); 9502 expired, 9504 not an agent, 9505 not IHNA, 9507 disabled.
INSERT INTO partners (id, facility_name, address, address_2, suburb_town, state, postcode, country, website, web_name, web_email, web_phone_number, enable, partner_type_id, agreement_status, agreement_expiry_date) VALUES
  (9501, 'Fixture Agency Alpha', '1 Fixture Road', NULL, 'Fixtureville', 'Fixture State', '000001', 2, 'https://alpha.example.test', 'Alpha Admissions', 'admissions@alpha.example.test', '+91 00000 00001', 1, 5, 5, '2099-12-31'),
  (9502, 'Fixture Agency Expired', '2 Fixture Road', NULL, 'Fixtureville', 'Fixture State', '000002', 2, NULL, NULL, NULL, NULL, 1, 5, 5, '2020-01-01'),
  (9503, 'Fixture Agency Gamma', '3 Fixture Lane', 'Level 2', 'Fixturetown', NULL, '00003', 3, NULL, 'Gamma Office', 'office@gamma.example.test', '+977 0000000', 1, 5, 5, '2026-10-16'),
  (9504, 'Fixture University Partner', '4 Fixture Road', NULL, 'Fixtureville', NULL, NULL, 2, NULL, NULL, NULL, NULL, 1, 4, 5, '2099-12-31'),
  (9505, 'Fixture Agency Other Brand', '5 Fixture Road', NULL, 'Fixtureville', NULL, NULL, 2, NULL, NULL, NULL, NULL, 1, 5, 5, '2099-12-31'),
  (9506, 'Fixture Agency Delta', '6 Fixture Road', NULL, 'Fixtureville', NULL, NULL, 2, NULL, NULL, NULL, NULL, 1, 5, 5, '2099-12-31'),
  (9507, 'Fixture Agency Disabled', '7 Fixture Road', NULL, 'Fixtureville', NULL, NULL, 2, NULL, NULL, NULL, NULL, 0, 5, 5, '2099-12-31');

INSERT INTO partner_association_accesses (id, partner_id, partner_association_id, enable) VALUES
  (1, 9501, 2, 1), (2, 9502, 2, 1), (3, 9503, 2, 1), (4, 9504, 2, 1), (5, 9505, 1, 1), (6, 9506, 2, 1), (7, 9506, 2, 1), (8, 9507, 2, 1);

INSERT INTO partner_staffs (id, partner_id, name, email, phone_number, enable) VALUES
  (1, 9501, 'Fixture Contact Person', 'contact.person@example.test', '+91 00000 00099', 1);

INSERT INTO course_document_categories (id, course_id, name) VALUES
  (1, 363, 'Handbooks'),
  (2, 9201, 'Handbooks');

INSERT INTO course_documents (id, course_document_category_id, course_document_type, document_file) VALUES
  (1, 1, 2, 'fixture-other-document.pdf'),
  (2, 1, 1, 'Fixture Student Handbook.pdf'),
  (3, 2, 1, '');

INSERT INTO invoices (id, user_id, invoice_number, due_amount, created) VALUES
  (9901, 555, 'FIX-INV-9901', 1200.50, '2026-09-01 10:00:00'),
  (9902, 556, 'FIX-INV-9902', 300.00, '2026-09-02 10:00:00');

INSERT INTO invoice_payments (id, invoice_id, student_id, surcharge_amount) VALUES
  (1, 9901, 555, 18.01);

-- Dev start dates for the IHNA courses (integration, 2026-10-21): synthetic batches for the KH ids the live course pages carry
-- (scripts/import/out/ihna-course-live.json; 363 has its rows above), so CourseDetail's StartDates and census blocks render with
-- PORTAL_ENABLED=1. Campuses 1-4 of data.sql, fixed intakes, face to face (+ blended at campus 2 for award courses). Additive: ids
-- 62xx/63xx, no `courses` rows (the campus-8 calendar and census reads stay as the tests expect).
INSERT INTO course_batches (id, course_id, campus_id, partner_id, status, enable, show_in_website, intake_id, mod_of_delivery_id, start_date, end_date, graduation_day, orientation_date, batch_name, batch_status_id) VALUES
  (6201, 474, 1, 1, 'Active', 1, 1, 1, 1, '2027-01-18', '2028-07-11', NULL, NULL, 'IHNA-DEV-474-2027-01-C1', 1),
  (6202, 474, 4, 1, 'Active', 1, 1, 1, 1, '2027-03-08', '2028-08-29', NULL, NULL, 'IHNA-DEV-474-2027-03-C4', 1),
  (6203, 474, 2, 1, 'Active', 1, 1, 1, 3, '2027-05-03', '2028-10-24', NULL, NULL, 'IHNA-DEV-474-2027-05-C2', 1),
  (6204, 428, 1, 1, 'Active', 1, 1, 1, 1, '2027-03-08', '2028-08-29', NULL, NULL, 'IHNA-DEV-428-2027-03-C1', 1),
  (6205, 428, 4, 1, 'Active', 1, 1, 1, 1, '2027-05-03', '2028-10-24', NULL, NULL, 'IHNA-DEV-428-2027-05-C4', 1),
  (6206, 428, 2, 1, 'Active', 1, 1, 1, 3, '2027-01-18', '2028-07-11', NULL, NULL, 'IHNA-DEV-428-2027-01-C2', 1),
  (6207, 412, 1, 1, 'Active', 1, 1, 1, 1, '2027-05-03', '2027-05-17', NULL, NULL, 'IHNA-DEV-412-2027-05-C1', 1),
  (6208, 412, 4, 1, 'Active', 1, 1, 1, 1, '2027-01-18', '2027-02-01', NULL, NULL, 'IHNA-DEV-412-2027-01-C4', 1),
  (6209, 430, 1, 1, 'Active', 1, 1, 1, 1, '2027-01-18', '2028-07-11', NULL, NULL, 'IHNA-DEV-430-2027-01-C1', 1),
  (6210, 430, 4, 1, 'Active', 1, 1, 1, 1, '2027-03-08', '2028-08-29', NULL, NULL, 'IHNA-DEV-430-2027-03-C4', 1),
  (6211, 430, 2, 1, 'Active', 1, 1, 1, 3, '2027-05-03', '2028-10-24', NULL, NULL, 'IHNA-DEV-430-2027-05-C2', 1),
  (6212, 477, 1, 1, 'Active', 1, 1, 1, 1, '2027-03-08', '2028-08-29', NULL, NULL, 'IHNA-DEV-477-2027-03-C1', 1),
  (6213, 477, 4, 1, 'Active', 1, 1, 1, 1, '2027-05-03', '2028-10-24', NULL, NULL, 'IHNA-DEV-477-2027-05-C4', 1),
  (6214, 477, 2, 1, 'Active', 1, 1, 1, 3, '2027-01-18', '2028-07-11', NULL, NULL, 'IHNA-DEV-477-2027-01-C2', 1),
  (6215, 408, 1, 1, 'Active', 1, 1, 1, 1, '2027-05-03', '2028-10-24', NULL, NULL, 'IHNA-DEV-408-2027-05-C1', 1),
  (6216, 408, 4, 1, 'Active', 1, 1, 1, 1, '2027-01-18', '2028-07-11', NULL, NULL, 'IHNA-DEV-408-2027-01-C4', 1),
  (6217, 408, 2, 1, 'Active', 1, 1, 1, 3, '2027-03-08', '2028-08-29', NULL, NULL, 'IHNA-DEV-408-2027-03-C2', 1),
  (6218, 397, 1, 1, 'Active', 1, 1, 1, 1, '2027-01-18', '2027-02-01', NULL, NULL, 'IHNA-DEV-397-2027-01-C1', 1),
  (6219, 397, 4, 1, 'Active', 1, 1, 1, 1, '2027-03-08', '2027-03-22', NULL, NULL, 'IHNA-DEV-397-2027-03-C4', 1),
  (6220, 396, 1, 1, 'Active', 1, 1, 1, 1, '2027-03-08', '2028-08-29', NULL, NULL, 'IHNA-DEV-396-2027-03-C1', 1),
  (6221, 396, 4, 1, 'Active', 1, 1, 1, 1, '2027-05-03', '2028-10-24', NULL, NULL, 'IHNA-DEV-396-2027-05-C4', 1),
  (6222, 396, 2, 1, 'Active', 1, 1, 1, 3, '2027-01-18', '2028-07-11', NULL, NULL, 'IHNA-DEV-396-2027-01-C2', 1),
  (6223, 387, 1, 1, 'Active', 1, 1, 1, 1, '2027-05-03', '2028-10-24', NULL, NULL, 'IHNA-DEV-387-2027-05-C1', 1),
  (6224, 387, 4, 1, 'Active', 1, 1, 1, 1, '2027-01-18', '2028-07-11', NULL, NULL, 'IHNA-DEV-387-2027-01-C4', 1),
  (6225, 387, 2, 1, 'Active', 1, 1, 1, 3, '2027-03-08', '2028-08-29', NULL, NULL, 'IHNA-DEV-387-2027-03-C2', 1),
  (6226, 115, 1, 1, 'Active', 1, 1, 1, 1, '2027-01-18', '2027-02-01', NULL, NULL, 'IHNA-DEV-115-2027-01-C1', 1),
  (6227, 115, 4, 1, 'Active', 1, 1, 1, 1, '2027-03-08', '2027-03-22', NULL, NULL, 'IHNA-DEV-115-2027-03-C4', 1),
  (6228, 352, 1, 1, 'Active', 1, 1, 1, 1, '2027-03-08', '2027-03-22', NULL, NULL, 'IHNA-DEV-352-2027-03-C1', 1),
  (6229, 352, 4, 1, 'Active', 1, 1, 1, 1, '2027-05-03', '2027-05-17', NULL, NULL, 'IHNA-DEV-352-2027-05-C4', 1),
  (6230, 426, 1, 1, 'Active', 1, 1, 1, 1, '2027-05-03', '2028-10-24', NULL, NULL, 'IHNA-DEV-426-2027-05-C1', 1),
  (6231, 426, 4, 1, 'Active', 1, 1, 1, 1, '2027-01-18', '2028-07-11', NULL, NULL, 'IHNA-DEV-426-2027-01-C4', 1),
  (6232, 426, 2, 1, 'Active', 1, 1, 1, 3, '2027-03-08', '2028-08-29', NULL, NULL, 'IHNA-DEV-426-2027-03-C2', 1),
  (6233, 391, 1, 1, 'Active', 1, 1, 1, 1, '2027-01-18', '2028-07-11', NULL, NULL, 'IHNA-DEV-391-2027-01-C1', 1),
  (6234, 391, 4, 1, 'Active', 1, 1, 1, 1, '2027-03-08', '2028-08-29', NULL, NULL, 'IHNA-DEV-391-2027-03-C4', 1),
  (6235, 391, 2, 1, 'Active', 1, 1, 1, 3, '2027-05-03', '2028-10-24', NULL, NULL, 'IHNA-DEV-391-2027-05-C2', 1);

INSERT INTO course_batch_dates (id, course_batch_id, enrollment_end_date, semester_census_date, semester, start_date, semester_end_date, sem_flag) VALUES
  (6301, 6201, '2027-01-11', '2027-02-22', 1, '2027-01-18', '2027-07-17', 1),
  (6302, 6202, '2027-03-01', '2027-04-12', 1, '2027-03-08', '2027-09-04', 1),
  (6303, 6203, '2027-04-26', '2027-06-07', 1, '2027-05-03', '2027-10-30', 1),
  (6304, 6204, '2027-03-01', '2027-04-12', 1, '2027-03-08', '2027-09-04', 1),
  (6305, 6205, '2027-04-26', '2027-06-07', 1, '2027-05-03', '2027-10-30', 1),
  (6306, 6206, '2027-01-11', '2027-02-22', 1, '2027-01-18', '2027-07-17', 1),
  (6307, 6207, '2027-04-26', NULL, 1, '2027-05-03', '2027-05-17', 1),
  (6308, 6208, '2027-01-11', NULL, 1, '2027-01-18', '2027-02-01', 1),
  (6309, 6209, '2027-01-11', '2027-02-22', 1, '2027-01-18', '2027-07-17', 1),
  (6310, 6210, '2027-03-01', '2027-04-12', 1, '2027-03-08', '2027-09-04', 1),
  (6311, 6211, '2027-04-26', '2027-06-07', 1, '2027-05-03', '2027-10-30', 1),
  (6312, 6212, '2027-03-01', '2027-04-12', 1, '2027-03-08', '2027-09-04', 1),
  (6313, 6213, '2027-04-26', '2027-06-07', 1, '2027-05-03', '2027-10-30', 1),
  (6314, 6214, '2027-01-11', '2027-02-22', 1, '2027-01-18', '2027-07-17', 1),
  (6315, 6215, '2027-04-26', '2027-06-07', 1, '2027-05-03', '2027-10-30', 1),
  (6316, 6216, '2027-01-11', '2027-02-22', 1, '2027-01-18', '2027-07-17', 1),
  (6317, 6217, '2027-03-01', '2027-04-12', 1, '2027-03-08', '2027-09-04', 1),
  (6318, 6218, '2027-01-11', NULL, 1, '2027-01-18', '2027-02-01', 1),
  (6319, 6219, '2027-03-01', NULL, 1, '2027-03-08', '2027-03-22', 1),
  (6320, 6220, '2027-03-01', '2027-04-12', 1, '2027-03-08', '2027-09-04', 1),
  (6321, 6221, '2027-04-26', '2027-06-07', 1, '2027-05-03', '2027-10-30', 1),
  (6322, 6222, '2027-01-11', '2027-02-22', 1, '2027-01-18', '2027-07-17', 1),
  (6323, 6223, '2027-04-26', '2027-06-07', 1, '2027-05-03', '2027-10-30', 1),
  (6324, 6224, '2027-01-11', '2027-02-22', 1, '2027-01-18', '2027-07-17', 1),
  (6325, 6225, '2027-03-01', '2027-04-12', 1, '2027-03-08', '2027-09-04', 1),
  (6326, 6226, '2027-01-11', NULL, 1, '2027-01-18', '2027-02-01', 1),
  (6327, 6227, '2027-03-01', NULL, 1, '2027-03-08', '2027-03-22', 1),
  (6328, 6228, '2027-03-01', NULL, 1, '2027-03-08', '2027-03-22', 1),
  (6329, 6229, '2027-04-26', NULL, 1, '2027-05-03', '2027-05-17', 1),
  (6330, 6230, '2027-04-26', '2027-06-07', 1, '2027-05-03', '2027-10-30', 1),
  (6331, 6231, '2027-01-11', '2027-02-22', 1, '2027-01-18', '2027-07-17', 1),
  (6332, 6232, '2027-03-01', '2027-04-12', 1, '2027-03-08', '2027-09-04', 1),
  (6333, 6233, '2027-01-11', '2027-02-22', 1, '2027-01-18', '2027-07-17', 1),
  (6334, 6234, '2027-03-01', '2027-04-12', 1, '2027-03-08', '2027-09-04', 1),
  (6335, 6235, '2027-04-26', '2027-06-07', 1, '2027-05-03', '2027-10-30', 1);
