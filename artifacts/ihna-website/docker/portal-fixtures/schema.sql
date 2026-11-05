-- Fixture schema for the five shared portal tables read by src/lib/portal (50-portal-data §2). The IHNA-only tables are in
-- ihna.schema.sql; the IHNA columns below (course_code, batch_name, start_date, ...) are additive and default-valued.
-- PROVISIONAL: column names and types follow the PHP queries; replace with SHOW CREATE TABLE output when the DB access arrives.
-- Unqualified table names: the connection database is ihna_portal (PORTAL_DB_NAME).
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS course_batch_dates;
DROP TABLE IF EXISTS course_batches;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS campuses;
DROP TABLE IF EXISTS countries;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE campuses (
  id INT NOT NULL PRIMARY KEY,
  campus_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE courses (
  id INT NOT NULL PRIMARY KEY,
  course_name VARCHAR(255) NOT NULL,
  enable TINYINT(1) NOT NULL DEFAULT 1,
  normal_hours INT NULL,
  application_form5 TINYINT(1) NOT NULL DEFAULT 0, -- offered to domestic students
  application_form6 TINYINT(1) NOT NULL DEFAULT 0, -- offered to international students
  crm_courseid VARCHAR(64) NULL,
  crm_staff_id VARCHAR(64) NULL,
  application_form_flag TINYINT NULL,
  application_form2 TINYINT NULL,
  application_form3 TINYINT NULL,
  application_form4 TINYINT NULL,
  application_form7 TINYINT NULL,
  application_form9 TINYINT NULL,
  application_form10 TINYINT NULL,
  course_code VARCHAR(50) NULL,         -- IHNA: census pickers, hc-course-details (template-hc-course-details.php:16)
  course_category_id INT NULL,
  refer_friend TINYINT NULL
) ENGINE=InnoDB;

CREATE TABLE course_batches (
  id INT NOT NULL PRIMARY KEY,
  course_id INT NOT NULL,
  campus_id INT NOT NULL,
  partner_id INT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  enable TINYINT(1) NOT NULL DEFAULT 1,
  show_in_website TINYINT(1) NOT NULL DEFAULT 1,
  intake_id TINYINT NOT NULL,           -- 1 fixed, 2 rolling
  mod_of_delivery_id TINYINT NOT NULL,  -- 1 face to face, 2 online, 3 blended
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  graduation_day DATE NULL,
  orientation_date DATE NULL,
  batch_name VARCHAR(100) NULL,         -- IHNA census batch picker (template-census-date-details-ajax.php:46)
  batch_status_id TINYINT NOT NULL DEFAULT 1, -- IHNA census: 1, 2, 3 are shown
  KEY idx_batches_course (course_id, campus_id),
  KEY idx_batches_start (start_date)
) ENGINE=InnoDB;

CREATE TABLE course_batch_dates (
  id INT NOT NULL PRIMARY KEY,
  course_batch_id INT NOT NULL,
  enrollment_end_date DATE NULL,
  semester_census_date DATE NULL,
  semester TINYINT NOT NULL DEFAULT 1,
  start_date DATE NULL,                 -- IHNA [CourseStartDates] intake dates (functions.php:1305)
  semester_end_date DATE NULL,          -- IHNA unit census end date (template-census-date-details-ajax.php:174)
  sem_flag TINYINT NOT NULL DEFAULT 0,
  KEY idx_dates_batch (course_batch_id)
) ENGINE=InnoDB;

CREATE TABLE countries (
  id INT NOT NULL PRIMARY KEY,
  country_name VARCHAR(100) NOT NULL,
  enable TINYINT(1) NOT NULL DEFAULT 1,
  default_country TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB;
