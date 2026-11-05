-- Fixture schema for the IHNA-only portal tables read by src/lib/portal/queries.ts (50-portal-data §2, IHNA).
-- PROVISIONAL: column names follow the old theme's SQL (mwt-ihna); types are guesses until SHOW CREATE TABLE arrives (50 §10).
-- Loaded after schema.sql by load.sh. Unqualified table names: the connection database is ihna_portal.
-- users, user_details, student_ids, staffs and user_roles are deliberately absent: no page reads people from the portal.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS semesters;
DROP TABLE IF EXISTS course_units;
DROP TABLE IF EXISTS course_unit_of_studies;
DROP TABLE IF EXISTS course_unit_of_study_units;
DROP TABLE IF EXISTS course_unit_timetable_details;
DROP TABLE IF EXISTS ihna_web_packages;
DROP TABLE IF EXISTS partners;
DROP TABLE IF EXISTS partner_association_accesses;
DROP TABLE IF EXISTS partner_staffs;
DROP TABLE IF EXISTS course_document_categories;
DROP TABLE IF EXISTS course_documents;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS invoice_payments;
SET FOREIGN_KEY_CHECKS = 1;

-- Unit census (template-census-date-details-ajax.php:93-174)
CREATE TABLE semesters (
  id INT NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE course_units (
  id INT NOT NULL PRIMARY KEY,
  unit_code VARCHAR(50) NOT NULL,
  unit_name VARCHAR(255) NULL,
  semester TINYINT NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE course_unit_of_studies (
  id INT NOT NULL PRIMARY KEY,
  course_id INT NOT NULL,
  course_batch_id INT NOT NULL,
  semester_id INT NOT NULL,
  user_id INT NOT NULL DEFAULT 0,          -- 0 = the batch template row (the only rows the site reads)
  course_unit_of_study_id INT NOT NULL,
  census_date DATE NULL,
  eftsl_factor DECIMAL(8,4) NULL,
  KEY idx_cus_batch (course_batch_id, user_id)
) ENGINE=InnoDB;

CREATE TABLE course_unit_of_study_units (
  id INT NOT NULL PRIMARY KEY,
  course_unit_of_study_id INT NOT NULL,
  course_unit_id INT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE course_unit_timetable_details (
  id INT NOT NULL PRIMARY KEY,
  course_batch_id INT NOT NULL,
  course_unit_id INT NOT NULL,
  start_date_time DATETIME NULL
) ENGINE=InnoDB;

-- Enquiry packages (functions.php:368)
CREATE TABLE ihna_web_packages (
  id INT NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ihna_course_id INT NULL
) ENGINE=InnoDB;

-- Education agent directory (template-agent-details.php:13)
CREATE TABLE partners (
  id INT NOT NULL PRIMARY KEY,
  facility_name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NULL,
  address_2 VARCHAR(255) NULL,
  suburb_town VARCHAR(100) NULL,
  state VARCHAR(100) NULL,
  postcode VARCHAR(20) NULL,
  country INT NULL,
  website VARCHAR(255) NULL,
  web_name VARCHAR(255) NULL,
  web_email VARCHAR(254) NULL,
  web_phone_number VARCHAR(50) NULL,
  enable TINYINT(1) NOT NULL DEFAULT 1,
  partner_type_id INT NOT NULL DEFAULT 5,   -- 5 = education agent
  agreement_status INT NOT NULL DEFAULT 5,  -- 5 = signed
  agreement_expiry_date DATE NULL
) ENGINE=InnoDB;

CREATE TABLE partner_association_accesses (
  id INT NOT NULL PRIMARY KEY,
  partner_id INT NOT NULL,
  partner_association_id INT NOT NULL,      -- 2 = IHNA
  enable TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- Read by the old directory (contact person, email, phone). This site never selects it; the fixture keeps one row so tests prove that.
CREATE TABLE partner_staffs (
  id INT NOT NULL PRIMARY KEY,
  partner_id INT NOT NULL,
  name VARCHAR(255) NULL,
  email VARCHAR(254) NULL,
  phone_number VARCHAR(50) NULL,
  enable TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- [HandBookUrl] (functions.php:1530)
CREATE TABLE course_document_categories (
  id INT NOT NULL PRIMARY KEY,
  course_id INT NOT NULL,
  name VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE course_documents (
  id INT NOT NULL PRIMARY KEY,
  course_document_category_id INT NOT NULL,
  course_document_type INT NOT NULL,        -- 1 = student handbook
  document_file VARCHAR(255) NULL
) ENGINE=InnoDB;

-- Pay-form invoice lookup (template-pay-online.php:29). Only the invoice number and the amount due are read.
CREATE TABLE invoices (
  id INT NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  invoice_number VARCHAR(100) NOT NULL,
  due_amount DECIMAL(10,2) NULL,
  created DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE invoice_payments (
  id INT NOT NULL PRIMARY KEY,
  invoice_id INT NOT NULL,
  student_id INT NOT NULL,
  surcharge_amount DECIMAL(10,2) NULL
) ENGINE=InnoDB;
