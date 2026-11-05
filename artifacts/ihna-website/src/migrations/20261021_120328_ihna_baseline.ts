import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'marketing', 'events', 'finance', 'viewer');
  CREATE TYPE "public"."enum_documents_listings_section" AS ENUM('student-policies', 'student-procedures', 'staff-policies', 'staff-procedures', 'glossary');
  CREATE TYPE "public"."enum_documents_category" AS ENUM('policy', 'procedure', 'staff-policy', 'form', 'guide', 'handbook', 'brochure', 'other');
  CREATE TYPE "public"."enum_documents_audience" AS ENUM('students', 'staff', 'public');
  CREATE TYPE "public"."enum_courses_sections_slot" AS ENUM('overview', 'entry', 'structure', 'careers', 'placements', 'pathways', 'faq', 'fees', 'additional');
  CREATE TYPE "public"."enum_courses_student_type" AS ENUM('domestic', 'international', 'both');
  CREATE TYPE "public"."enum_courses_course_type" AS ENUM('award', 'non-award');
  CREATE TYPE "public"."enum_courses_kh_id_source" AS ENUM('dump', 'scrape');
  CREATE TYPE "public"."enum_courses_import_import_class" AS ENUM('A', 'B', 'C-lite', 'C', 'D', 'new');
  CREATE TYPE "public"."enum_courses_import_review_status" AS ENUM('auto', 'check', 'needs-rebuild', 'kh-unresolved', 'ok');
  CREATE TYPE "public"."enum_courses_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__courses_v_version_sections_slot" AS ENUM('overview', 'entry', 'structure', 'careers', 'placements', 'pathways', 'faq', 'fees', 'additional');
  CREATE TYPE "public"."enum__courses_v_version_student_type" AS ENUM('domestic', 'international', 'both');
  CREATE TYPE "public"."enum__courses_v_version_course_type" AS ENUM('award', 'non-award');
  CREATE TYPE "public"."enum__courses_v_version_kh_id_source" AS ENUM('dump', 'scrape');
  CREATE TYPE "public"."enum__courses_v_version_import_import_class" AS ENUM('A', 'B', 'C-lite', 'C', 'D', 'new');
  CREATE TYPE "public"."enum__courses_v_version_import_review_status" AS ENUM('auto', 'check', 'needs-rebuild', 'kh-unresolved', 'ok');
  CREATE TYPE "public"."enum__courses_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_category" AS ENUM('blog', 'news');
  CREATE TYPE "public"."enum_posts_import_import_class" AS ENUM('A', 'B', 'C-lite', 'C', 'D', 'new');
  CREATE TYPE "public"."enum_posts_import_review_status" AS ENUM('auto', 'check', 'needs-rebuild', 'kh-unresolved', 'ok');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('blog', 'news');
  CREATE TYPE "public"."enum__posts_v_version_import_import_class" AS ENUM('A', 'B', 'C-lite', 'C', 'D', 'new');
  CREATE TYPE "public"."enum__posts_v_version_import_review_status" AS ENUM('auto', 'check', 'needs-rebuild', 'kh-unresolved', 'ok');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_galleries_campuses" AS ENUM('melbourne', 'sydney', 'perth', 'brisbane');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_testimonials_source" AS ENUM('mwt', 'hardcoded', 'alumni');
  CREATE TYPE "public"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_version_source" AS ENUM('mwt', 'hardcoded', 'alumni');
  CREATE TYPE "public"."enum__testimonials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_staff_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__staff_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_enquiries_deliveries_status" AS ENUM('pending', 'sent', 'failed', 'dead', 'held', 'dry_run');
  CREATE TYPE "public"."enum_enquiries_status" AS ENUM('received', 'delivering', 'delivered', 'partial', 'dead', 'held', 'spam');
  CREATE TYPE "public"."enum_enquiries_captcha_status" AS ENUM('ok', 'low', 'unverified', 'missing');
  CREATE TYPE "public"."enum_enquiries_source" AS ENUM('api', 'legacy-post');
  CREATE TYPE "public"."enum_products_gateways" AS ENUM('payway', 'securepay', 'airwallex', 'convera', 'flywire');
  CREATE TYPE "public"."enum_products_kind" AS ENUM('prep-package', 'mock-test');
  CREATE TYPE "public"."enum_products_currency" AS ENUM('AUD');
  CREATE TYPE "public"."enum__products_v_version_gateways" AS ENUM('payway', 'securepay', 'airwallex', 'convera', 'flywire');
  CREATE TYPE "public"."enum__products_v_version_kind" AS ENUM('prep-package', 'mock-test');
  CREATE TYPE "public"."enum__products_v_version_currency" AS ENUM('AUD');
  CREATE TYPE "public"."enum_payments_kind" AS ENUM('invoice', 'product', 'sae', 'portalReturn');
  CREATE TYPE "public"."enum_payments_status" AS ENUM('pending', 'paid', 'failed', 'refunded', 'flagged', 'cancelled', 'expired');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'deliverEnquiry', 'scrubEnquiryIps', 'afterPaid', 'reconcilePending', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'deliverEnquiry', 'scrubEnquiryIps', 'afterPaid', 'reconcilePending', 'schedulePublish');
  CREATE TYPE "public"."enum_course_shared_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__course_shared_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "alumni_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "alumni" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"graduation_year" numeric,
  	"course" varchar,
  	"marketing_consent" boolean DEFAULT false,
  	"legacy_id" numeric,
  	"password_set_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"_verified" boolean,
  	"_verificationtoken" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"credit" varchar,
  	"legacy_path" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "documents_listings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" "enum_documents_listings_section" NOT NULL,
  	"order" numeric DEFAULT 0 NOT NULL
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"category" "enum_documents_category" DEFAULT 'policy' NOT NULL,
  	"audience" "enum_documents_audience" DEFAULT 'public' NOT NULL,
  	"effective_date" timestamp(3) with time zone,
  	"public_path" varchar NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "courses_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slot" "enum_courses_sections_slot",
  	"title" varchar,
  	"layout" jsonb
  );
  
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"path" varchar,
  	"code" varchar,
  	"cricos_code" varchar,
  	"course_status" varchar,
  	"student_type" "enum_courses_student_type" DEFAULT 'both',
  	"course_type" "enum_courses_course_type" DEFAULT 'award',
  	"facts_duration_show" boolean DEFAULT true,
  	"facts_duration_value" varchar,
  	"facts_duration_detail" varchar,
  	"facts_units_show" boolean DEFAULT true,
  	"facts_units_value" varchar,
  	"facts_units_detail" varchar,
  	"facts_delivery_show" boolean DEFAULT true,
  	"facts_delivery_value" varchar,
  	"facts_delivery_detail" varchar,
  	"facts_level_show" boolean DEFAULT true,
  	"facts_level_value" varchar,
  	"facts_level_detail" varchar,
  	"facts_campuses_show" boolean DEFAULT true,
  	"facts_campuses_value" varchar,
  	"facts_campuses_detail" varchar,
  	"facts_cricos_show" boolean DEFAULT true,
  	"facts_cricos_value" varchar,
  	"facts_cricos_detail" varchar,
  	"facts_fee_show" boolean DEFAULT true,
  	"facts_fee_value" varchar,
  	"facts_fee_detail" varchar,
  	"facts_international_duration_show" boolean DEFAULT true,
  	"facts_international_duration_value" varchar,
  	"facts_international_duration_detail" varchar,
  	"facts_international_units_show" boolean DEFAULT true,
  	"facts_international_units_value" varchar,
  	"facts_international_units_detail" varchar,
  	"facts_international_delivery_show" boolean DEFAULT true,
  	"facts_international_delivery_value" varchar,
  	"facts_international_delivery_detail" varchar,
  	"facts_international_level_show" boolean DEFAULT true,
  	"facts_international_level_value" varchar,
  	"facts_international_level_detail" varchar,
  	"facts_international_campuses_show" boolean DEFAULT true,
  	"facts_international_campuses_value" varchar,
  	"facts_international_campuses_detail" varchar,
  	"facts_international_cricos_show" boolean DEFAULT true,
  	"facts_international_cricos_value" varchar,
  	"facts_international_cricos_detail" varchar,
  	"facts_international_fee_show" boolean DEFAULT true,
  	"facts_international_fee_value" varchar,
  	"facts_international_fee_detail" varchar,
  	"kh_id" numeric,
  	"kh_id_source" "enum_courses_kh_id_source",
  	"show_start_dates" boolean DEFAULT false,
  	"school_id" integer,
  	"hero_image_id" integer,
  	"excerpt" varchar,
  	"accreditation" varchar,
  	"units" numeric,
  	"apply_link" varchar,
  	"brochure_id" integer,
  	"brochure_url" varchar,
  	"handbook_url" varchar,
  	"hubspot_course_id" varchar,
  	"dynamics_course_option" varchar,
  	"spl_id" varchar,
  	"featured" boolean DEFAULT false,
  	"featured_order" numeric,
  	"seo_noindex" boolean DEFAULT false,
  	"seo_canonical" varchar,
  	"seo_structured_data" jsonb,
  	"import_wp_id" numeric,
  	"import_import_class" "enum_courses_import_import_class",
  	"import_review_status" "enum_courses_import_review_status",
  	"import_import_report" jsonb,
  	"import_reviewed_by" varchar,
  	"import_reviewed_at" timestamp(3) with time zone,
  	"fees_display_amount" varchar,
  	"fees_note" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_courses_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "courses_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"disciplines_id" integer,
  	"levels_id" integer,
  	"campuses_id" integer,
  	"delivery_modes_id" integer,
  	"durations_id" integer,
  	"universities_id" integer,
  	"courses_id" integer
  );
  
  CREATE TABLE "_courses_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slot" "enum__courses_v_version_sections_slot",
  	"title" varchar,
  	"layout" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_courses_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_path" varchar,
  	"version_code" varchar,
  	"version_cricos_code" varchar,
  	"version_course_status" varchar,
  	"version_student_type" "enum__courses_v_version_student_type" DEFAULT 'both',
  	"version_course_type" "enum__courses_v_version_course_type" DEFAULT 'award',
  	"version_facts_duration_show" boolean DEFAULT true,
  	"version_facts_duration_value" varchar,
  	"version_facts_duration_detail" varchar,
  	"version_facts_units_show" boolean DEFAULT true,
  	"version_facts_units_value" varchar,
  	"version_facts_units_detail" varchar,
  	"version_facts_delivery_show" boolean DEFAULT true,
  	"version_facts_delivery_value" varchar,
  	"version_facts_delivery_detail" varchar,
  	"version_facts_level_show" boolean DEFAULT true,
  	"version_facts_level_value" varchar,
  	"version_facts_level_detail" varchar,
  	"version_facts_campuses_show" boolean DEFAULT true,
  	"version_facts_campuses_value" varchar,
  	"version_facts_campuses_detail" varchar,
  	"version_facts_cricos_show" boolean DEFAULT true,
  	"version_facts_cricos_value" varchar,
  	"version_facts_cricos_detail" varchar,
  	"version_facts_fee_show" boolean DEFAULT true,
  	"version_facts_fee_value" varchar,
  	"version_facts_fee_detail" varchar,
  	"version_facts_international_duration_show" boolean DEFAULT true,
  	"version_facts_international_duration_value" varchar,
  	"version_facts_international_duration_detail" varchar,
  	"version_facts_international_units_show" boolean DEFAULT true,
  	"version_facts_international_units_value" varchar,
  	"version_facts_international_units_detail" varchar,
  	"version_facts_international_delivery_show" boolean DEFAULT true,
  	"version_facts_international_delivery_value" varchar,
  	"version_facts_international_delivery_detail" varchar,
  	"version_facts_international_level_show" boolean DEFAULT true,
  	"version_facts_international_level_value" varchar,
  	"version_facts_international_level_detail" varchar,
  	"version_facts_international_campuses_show" boolean DEFAULT true,
  	"version_facts_international_campuses_value" varchar,
  	"version_facts_international_campuses_detail" varchar,
  	"version_facts_international_cricos_show" boolean DEFAULT true,
  	"version_facts_international_cricos_value" varchar,
  	"version_facts_international_cricos_detail" varchar,
  	"version_facts_international_fee_show" boolean DEFAULT true,
  	"version_facts_international_fee_value" varchar,
  	"version_facts_international_fee_detail" varchar,
  	"version_kh_id" numeric,
  	"version_kh_id_source" "enum__courses_v_version_kh_id_source",
  	"version_show_start_dates" boolean DEFAULT false,
  	"version_school_id" integer,
  	"version_hero_image_id" integer,
  	"version_excerpt" varchar,
  	"version_accreditation" varchar,
  	"version_units" numeric,
  	"version_apply_link" varchar,
  	"version_brochure_id" integer,
  	"version_brochure_url" varchar,
  	"version_handbook_url" varchar,
  	"version_hubspot_course_id" varchar,
  	"version_dynamics_course_option" varchar,
  	"version_spl_id" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_featured_order" numeric,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_seo_canonical" varchar,
  	"version_seo_structured_data" jsonb,
  	"version_import_wp_id" numeric,
  	"version_import_import_class" "enum__courses_v_version_import_import_class",
  	"version_import_review_status" "enum__courses_v_version_import_review_status",
  	"version_import_import_report" jsonb,
  	"version_import_reviewed_by" varchar,
  	"version_import_reviewed_at" timestamp(3) with time zone,
  	"version_fees_display_amount" varchar,
  	"version_fees_note" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__courses_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_courses_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"disciplines_id" integer,
  	"levels_id" integer,
  	"campuses_id" integer,
  	"delivery_modes_id" integer,
  	"durations_id" integer,
  	"universities_id" integer,
  	"courses_id" integer
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"path" varchar,
  	"url_date" varchar,
  	"category" "enum_posts_category" DEFAULT 'blog',
  	"topic_id" integer,
  	"featured" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"author" varchar,
  	"hero_image_id" integer,
  	"card_image_id" integer,
  	"excerpt" varchar,
  	"read_time" numeric,
  	"content" jsonb,
  	"seo_noindex" boolean DEFAULT false,
  	"seo_canonical" varchar,
  	"seo_structured_data" jsonb,
  	"import_wp_id" numeric,
  	"import_import_class" "enum_posts_import_import_class",
  	"import_review_status" "enum_posts_import_review_status",
  	"import_import_report" jsonb,
  	"import_reviewed_by" varchar,
  	"import_reviewed_at" timestamp(3) with time zone,
  	"import_apprunner_id" varchar,
  	"import_source_updated_at" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_path" varchar,
  	"version_url_date" varchar,
  	"version_category" "enum__posts_v_version_category" DEFAULT 'blog',
  	"version_topic_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_author" varchar,
  	"version_hero_image_id" integer,
  	"version_card_image_id" integer,
  	"version_excerpt" varchar,
  	"version_read_time" numeric,
  	"version_content" jsonb,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_seo_canonical" varchar,
  	"version_seo_structured_data" jsonb,
  	"version_import_wp_id" numeric,
  	"version_import_import_class" "enum__posts_v_version_import_import_class",
  	"version_import_review_status" "enum__posts_v_version_import_review_status",
  	"version_import_import_report" jsonb,
  	"version_import_reviewed_by" varchar,
  	"version_import_reviewed_at" timestamp(3) with time zone,
  	"version_import_apprunner_id" varchar,
  	"version_import_source_updated_at" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "blog_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"legacy_code" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "galleries_campuses" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_galleries_campuses",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "galleries_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"title" varchar,
  	"caption" varchar,
  	"apprunner_id" varchar
  );
  
  CREATE TABLE "galleries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"event_date" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"cover_image_id" integer,
  	"apprunner_id" varchar,
  	"source_updated_at" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "levels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "delivery_modes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "durations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"legacy_id" numeric,
  	"months" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "universities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"legacy_id" numeric,
  	"image_id" integer,
  	"detail_path" varchar,
  	"enquiry_email" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "campuses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"legacy_id" numeric,
  	"image_id" integer,
  	"detail_path" varchar,
  	"enquiry_email" varchar,
  	"portal_campus_id" numeric,
  	"hubspot_campus_value" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "disciplines" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"legacy_id" numeric,
  	"description" varchar,
  	"image_id" integer,
  	"color" varchar,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"legacy_id" numeric,
  	"description" varchar,
  	"image_id" integer,
  	"color" varchar,
  	"parent_id" integer,
  	"enquiry_email" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"starts_at" timestamp(3) with time zone,
  	"day_label" varchar,
  	"time_text" varchar,
  	"frequency" varchar,
  	"discipline_id" integer,
  	"description" varchar,
  	"speaker" varchar,
  	"speaker_bio" varchar,
  	"venue" varchar,
  	"hosted_by" varchar,
  	"join_url" varchar,
  	"secondary_url" varchar,
  	"image_id" integer,
  	"registration_open" boolean DEFAULT true,
  	"form_key" varchar DEFAULT 'event-registration',
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "events_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_starts_at" timestamp(3) with time zone,
  	"version_day_label" varchar,
  	"version_time_text" varchar,
  	"version_frequency" varchar,
  	"version_discipline_id" integer,
  	"version_description" varchar,
  	"version_speaker" varchar,
  	"version_speaker_bio" varchar,
  	"version_venue" varchar,
  	"version_hosted_by" varchar,
  	"version_join_url" varchar,
  	"version_secondary_url" varchar,
  	"version_image_id" integer,
  	"version_registration_open" boolean DEFAULT true,
  	"version_form_key" varchar DEFAULT 'event-registration',
  	"version_legacy_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_events_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"course_id" integer,
  	"quote" varchar,
  	"image_id" integer,
  	"video_url" varchar,
  	"headline" varchar,
  	"subheadline" varchar,
  	"featured" boolean DEFAULT false,
  	"source" "enum_testimonials_source",
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_testimonials_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_testimonials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_course_id" integer,
  	"version_quote" varchar,
  	"version_image_id" integer,
  	"version_video_url" varchar,
  	"version_headline" varchar,
  	"version_subheadline" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_source" "enum__testimonials_v_version_source",
  	"version_legacy_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__testimonials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "staff_research" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"category" varchar,
  	"title" varchar,
  	"authors" varchar,
  	"year" varchar,
  	"journal" varchar,
  	"description" varchar,
  	"view_link" varchar,
  	"article_link" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "staff_grants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"amount" varchar,
  	"year" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "staff_activities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"category" varchar,
  	"title" varchar,
  	"detail" varchar,
  	"year" varchar
  );
  
  CREATE TABLE "staff_supervision" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"title" varchar,
  	"institution" varchar,
  	"year" varchar
  );
  
  CREATE TABLE "staff" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"position" varchar,
  	"post_nominals" varchar,
  	"school_id" integer,
  	"photo_id" integer,
  	"bio" varchar,
  	"email" varchar,
  	"linkedin" varchar,
  	"google_scholar" varchar,
  	"orcid" varchar,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_staff_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "staff_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"courses_id" integer
  );
  
  CREATE TABLE "_staff_research_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" varchar,
  	"title" varchar,
  	"authors" varchar,
  	"year" varchar,
  	"journal" varchar,
  	"description" varchar,
  	"view_link" varchar,
  	"article_link" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_staff_grants_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"amount" varchar,
  	"year" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_staff_activities_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" varchar,
  	"title" varchar,
  	"detail" varchar,
  	"year" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_staff_supervision_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"title" varchar,
  	"institution" varchar,
  	"year" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_staff_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_position" varchar,
  	"version_post_nominals" varchar,
  	"version_school_id" integer,
  	"version_photo_id" integer,
  	"version_bio" varchar,
  	"version_email" varchar,
  	"version_linkedin" varchar,
  	"version_google_scholar" varchar,
  	"version_orcid" varchar,
  	"version_active" boolean DEFAULT true,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_legacy_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__staff_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_staff_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"courses_id" integer
  );
  
  CREATE TABLE "enquiries_deliveries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"adapter" varchar NOT NULL,
  	"target" varchar,
  	"status" "enum_enquiries_deliveries_status" DEFAULT 'pending',
  	"attempts" numeric DEFAULT 0,
  	"at" timestamp(3) with time zone,
  	"response_code" numeric,
  	"external_id" varchar,
  	"last_error" varchar,
  	"dry_run_request" jsonb,
  	"hs_source_fallback" boolean DEFAULT false
  );
  
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"public_id" varchar,
  	"submission_id" varchar NOT NULL,
  	"form_key" varchar NOT NULL,
  	"status" "enum_enquiries_status" DEFAULT 'received' NOT NULL,
  	"captcha_status" "enum_enquiries_captcha_status",
  	"captcha_score" numeric,
  	"honeypot" boolean DEFAULT false,
  	"first_name" varchar,
  	"last_name" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"country" varchar,
  	"student_type" varchar,
  	"consent" boolean,
  	"course_id" integer,
  	"campus_id" integer,
  	"campaign_code" varchar,
  	"utm_utm_source" varchar,
  	"utm_utm_medium" varchar,
  	"utm_utm_campaign" varchar,
  	"utm_utm_term" varchar,
  	"utm_utm_content" varchar,
  	"utm_gclid" varchar,
  	"utm_gbraid" varchar,
  	"utm_wbraid" varchar,
  	"utm_fbclid" varchar,
  	"utm_msclkid" varchar,
  	"utm_referrer" varchar,
  	"utm_landing_path" varchar,
  	"utm_first_touch" jsonb,
  	"hutk" varchar,
  	"data" jsonb,
  	"page_url" varchar,
  	"source" "enum_enquiries_source" DEFAULT 'api',
  	"ip" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_gateways" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_gateways",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sku" varchar NOT NULL,
  	"legacy_e2_btn" numeric,
  	"name" varchar NOT NULL,
  	"kind" "enum_products_kind" NOT NULL,
  	"description" varchar,
  	"price_cents" numeric NOT NULL,
  	"currency" "enum_products_currency" DEFAULT 'AUD',
  	"student_discount_percent" numeric DEFAULT 50,
  	"access_months" numeric,
  	"active" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_products_v_version_gateways" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_gateways",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_sku" varchar NOT NULL,
  	"version_legacy_e2_btn" numeric,
  	"version_name" varchar NOT NULL,
  	"version_kind" "enum__products_v_version_kind" NOT NULL,
  	"version_description" varchar,
  	"version_price_cents" numeric NOT NULL,
  	"version_currency" "enum__products_v_version_currency" DEFAULT 'AUD',
  	"version_student_discount_percent" numeric DEFAULT 50,
  	"version_access_months" numeric,
  	"version_active" boolean DEFAULT true,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payments_status_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" varchar NOT NULL,
  	"at" timestamp(3) with time zone,
  	"note" varchar
  );
  
  CREATE TABLE "payments_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar NOT NULL,
  	"status" varchar,
  	"attempts" numeric DEFAULT 0
  );
  
  CREATE TABLE "payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"payment_id" varchar NOT NULL,
  	"kind" "enum_payments_kind",
  	"product_id" integer,
  	"payment_for" varchar,
  	"invoice_no" varchar,
  	"student_id" varchar,
  	"payer_name" varchar,
  	"payer_email" varchar,
  	"amount_cents" numeric NOT NULL,
  	"base_cents" numeric,
  	"surcharge_cents" numeric,
  	"currency" varchar DEFAULT 'AUD',
  	"gateway" varchar,
  	"gateway_ref" varchar,
  	"status" "enum_payments_status" DEFAULT 'pending' NOT NULL,
  	"portal_payment_id" varchar,
  	"flags" jsonb,
  	"ip" varchar,
  	"settled_at" timestamp(3) with time zone,
  	"last_synced_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"meta" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"alumni_id" integer,
  	"media_id" integer,
  	"documents_id" integer,
  	"courses_id" integer,
  	"posts_id" integer,
  	"blog_categories_id" integer,
  	"galleries_id" integer,
  	"levels_id" integer,
  	"delivery_modes_id" integer,
  	"durations_id" integer,
  	"universities_id" integer,
  	"campuses_id" integer,
  	"disciplines_id" integer,
  	"categories_id" integer,
  	"events_id" integer,
  	"testimonials_id" integer,
  	"staff_id" integer,
  	"enquiries_id" integer,
  	"products_id" integer,
  	"payments_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"alumni_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "course_shared" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" jsonb,
  	"_status" "enum_course_shared_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_course_shared_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_layout" jsonb,
  	"version__status" "enum__course_shared_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "alumni_sessions" ADD CONSTRAINT "alumni_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."alumni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_listings" ADD CONSTRAINT "documents_listings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_sections" ADD CONSTRAINT "courses_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_school_id_categories_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_brochure_id_documents_id_fk" FOREIGN KEY ("brochure_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_disciplines_fk" FOREIGN KEY ("disciplines_id") REFERENCES "public"."disciplines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_levels_fk" FOREIGN KEY ("levels_id") REFERENCES "public"."levels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_campuses_fk" FOREIGN KEY ("campuses_id") REFERENCES "public"."campuses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_delivery_modes_fk" FOREIGN KEY ("delivery_modes_id") REFERENCES "public"."delivery_modes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_durations_fk" FOREIGN KEY ("durations_id") REFERENCES "public"."durations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_universities_fk" FOREIGN KEY ("universities_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_sections" ADD CONSTRAINT "_courses_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_parent_id_courses_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_school_id_categories_id_fk" FOREIGN KEY ("version_school_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_brochure_id_documents_id_fk" FOREIGN KEY ("version_brochure_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_disciplines_fk" FOREIGN KEY ("disciplines_id") REFERENCES "public"."disciplines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_levels_fk" FOREIGN KEY ("levels_id") REFERENCES "public"."levels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_campuses_fk" FOREIGN KEY ("campuses_id") REFERENCES "public"."campuses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_delivery_modes_fk" FOREIGN KEY ("delivery_modes_id") REFERENCES "public"."delivery_modes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_durations_fk" FOREIGN KEY ("durations_id") REFERENCES "public"."durations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_universities_fk" FOREIGN KEY ("universities_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_topic_id_blog_categories_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."blog_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_card_image_id_media_id_fk" FOREIGN KEY ("card_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_topic_id_blog_categories_id_fk" FOREIGN KEY ("version_topic_id") REFERENCES "public"."blog_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_card_image_id_media_id_fk" FOREIGN KEY ("version_card_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "galleries_campuses" ADD CONSTRAINT "galleries_campuses_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "galleries_items" ADD CONSTRAINT "galleries_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "galleries_items" ADD CONSTRAINT "galleries_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "galleries" ADD CONSTRAINT "galleries_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "universities" ADD CONSTRAINT "universities_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "campuses" ADD CONSTRAINT "campuses_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "disciplines" ADD CONSTRAINT "disciplines_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "disciplines" ADD CONSTRAINT "disciplines_parent_id_disciplines_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."disciplines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_discipline_id_disciplines_id_fk" FOREIGN KEY ("discipline_id") REFERENCES "public"."disciplines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_texts" ADD CONSTRAINT "events_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_discipline_id_disciplines_id_fk" FOREIGN KEY ("version_discipline_id") REFERENCES "public"."disciplines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_texts" ADD CONSTRAINT "_events_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_parent_id_testimonials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_course_id_courses_id_fk" FOREIGN KEY ("version_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staff_research" ADD CONSTRAINT "staff_research_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staff_grants" ADD CONSTRAINT "staff_grants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staff_activities" ADD CONSTRAINT "staff_activities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staff_supervision" ADD CONSTRAINT "staff_supervision_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staff" ADD CONSTRAINT "staff_school_id_categories_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staff" ADD CONSTRAINT "staff_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staff_rels" ADD CONSTRAINT "staff_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staff_rels" ADD CONSTRAINT "staff_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_staff_research_v" ADD CONSTRAINT "_staff_research_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_staff_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_staff_grants_v" ADD CONSTRAINT "_staff_grants_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_staff_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_staff_activities_v" ADD CONSTRAINT "_staff_activities_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_staff_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_staff_supervision_v" ADD CONSTRAINT "_staff_supervision_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_staff_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_staff_v" ADD CONSTRAINT "_staff_v_parent_id_staff_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_staff_v" ADD CONSTRAINT "_staff_v_version_school_id_categories_id_fk" FOREIGN KEY ("version_school_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_staff_v" ADD CONSTRAINT "_staff_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_staff_v_rels" ADD CONSTRAINT "_staff_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_staff_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_staff_v_rels" ADD CONSTRAINT "_staff_v_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries_deliveries" ADD CONSTRAINT "enquiries_deliveries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gateways" ADD CONSTRAINT "products_gateways_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_gateways" ADD CONSTRAINT "_products_v_version_gateways_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments_status_history" ADD CONSTRAINT "payments_status_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payments_steps" ADD CONSTRAINT "payments_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_alumni_fk" FOREIGN KEY ("alumni_id") REFERENCES "public"."alumni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_galleries_fk" FOREIGN KEY ("galleries_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_levels_fk" FOREIGN KEY ("levels_id") REFERENCES "public"."levels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_delivery_modes_fk" FOREIGN KEY ("delivery_modes_id") REFERENCES "public"."delivery_modes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_durations_fk" FOREIGN KEY ("durations_id") REFERENCES "public"."durations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_universities_fk" FOREIGN KEY ("universities_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_campuses_fk" FOREIGN KEY ("campuses_id") REFERENCES "public"."campuses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_disciplines_fk" FOREIGN KEY ("disciplines_id") REFERENCES "public"."disciplines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_staff_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_alumni_fk" FOREIGN KEY ("alumni_id") REFERENCES "public"."alumni"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "alumni_sessions_order_idx" ON "alumni_sessions" USING btree ("_order");
  CREATE INDEX "alumni_sessions_parent_id_idx" ON "alumni_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "alumni_legacy_id_idx" ON "alumni" USING btree ("legacy_id");
  CREATE INDEX "alumni_updated_at_idx" ON "alumni" USING btree ("updated_at");
  CREATE INDEX "alumni_created_at_idx" ON "alumni" USING btree ("created_at");
  CREATE UNIQUE INDEX "alumni_email_idx" ON "alumni" USING btree ("email");
  CREATE UNIQUE INDEX "media_legacy_path_idx" ON "media" USING btree ("legacy_path");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "documents_listings_order_idx" ON "documents_listings" USING btree ("_order");
  CREATE INDEX "documents_listings_parent_id_idx" ON "documents_listings" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "documents_public_path_idx" ON "documents" USING btree ("public_path");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE INDEX "courses_sections_order_idx" ON "courses_sections" USING btree ("_order");
  CREATE INDEX "courses_sections_parent_id_idx" ON "courses_sections" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");
  CREATE UNIQUE INDEX "courses_path_idx" ON "courses" USING btree ("path");
  CREATE INDEX "courses_code_idx" ON "courses" USING btree ("code");
  CREATE INDEX "courses_kh_id_idx" ON "courses" USING btree ("kh_id");
  CREATE INDEX "courses_school_idx" ON "courses" USING btree ("school_id");
  CREATE INDEX "courses_hero_image_idx" ON "courses" USING btree ("hero_image_id");
  CREATE INDEX "courses_brochure_idx" ON "courses" USING btree ("brochure_id");
  CREATE INDEX "courses_featured_idx" ON "courses" USING btree ("featured");
  CREATE UNIQUE INDEX "courses_import_import_wp_id_idx" ON "courses" USING btree ("import_wp_id");
  CREATE INDEX "courses_import_import_import_class_idx" ON "courses" USING btree ("import_import_class");
  CREATE INDEX "courses_import_import_review_status_idx" ON "courses" USING btree ("import_review_status");
  CREATE INDEX "courses_meta_meta_image_idx" ON "courses" USING btree ("meta_image_id");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE INDEX "courses__status_idx" ON "courses" USING btree ("_status");
  CREATE INDEX "courses_rels_order_idx" ON "courses_rels" USING btree ("order");
  CREATE INDEX "courses_rels_parent_idx" ON "courses_rels" USING btree ("parent_id");
  CREATE INDEX "courses_rels_path_idx" ON "courses_rels" USING btree ("path");
  CREATE INDEX "courses_rels_categories_id_idx" ON "courses_rels" USING btree ("categories_id");
  CREATE INDEX "courses_rels_disciplines_id_idx" ON "courses_rels" USING btree ("disciplines_id");
  CREATE INDEX "courses_rels_levels_id_idx" ON "courses_rels" USING btree ("levels_id");
  CREATE INDEX "courses_rels_campuses_id_idx" ON "courses_rels" USING btree ("campuses_id");
  CREATE INDEX "courses_rels_delivery_modes_id_idx" ON "courses_rels" USING btree ("delivery_modes_id");
  CREATE INDEX "courses_rels_durations_id_idx" ON "courses_rels" USING btree ("durations_id");
  CREATE INDEX "courses_rels_universities_id_idx" ON "courses_rels" USING btree ("universities_id");
  CREATE INDEX "courses_rels_courses_id_idx" ON "courses_rels" USING btree ("courses_id");
  CREATE INDEX "_courses_v_version_sections_order_idx" ON "_courses_v_version_sections" USING btree ("_order");
  CREATE INDEX "_courses_v_version_sections_parent_id_idx" ON "_courses_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_parent_idx" ON "_courses_v" USING btree ("parent_id");
  CREATE INDEX "_courses_v_version_version_slug_idx" ON "_courses_v" USING btree ("version_slug");
  CREATE INDEX "_courses_v_version_version_path_idx" ON "_courses_v" USING btree ("version_path");
  CREATE INDEX "_courses_v_version_version_code_idx" ON "_courses_v" USING btree ("version_code");
  CREATE INDEX "_courses_v_version_version_kh_id_idx" ON "_courses_v" USING btree ("version_kh_id");
  CREATE INDEX "_courses_v_version_version_school_idx" ON "_courses_v" USING btree ("version_school_id");
  CREATE INDEX "_courses_v_version_version_hero_image_idx" ON "_courses_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_courses_v_version_version_brochure_idx" ON "_courses_v" USING btree ("version_brochure_id");
  CREATE INDEX "_courses_v_version_version_featured_idx" ON "_courses_v" USING btree ("version_featured");
  CREATE INDEX "_courses_v_version_import_version_import_wp_id_idx" ON "_courses_v" USING btree ("version_import_wp_id");
  CREATE INDEX "_courses_v_version_import_version_import_import_class_idx" ON "_courses_v" USING btree ("version_import_import_class");
  CREATE INDEX "_courses_v_version_import_version_import_review_status_idx" ON "_courses_v" USING btree ("version_import_review_status");
  CREATE INDEX "_courses_v_version_meta_version_meta_image_idx" ON "_courses_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_courses_v_version_version_updated_at_idx" ON "_courses_v" USING btree ("version_updated_at");
  CREATE INDEX "_courses_v_version_version_created_at_idx" ON "_courses_v" USING btree ("version_created_at");
  CREATE INDEX "_courses_v_version_version__status_idx" ON "_courses_v" USING btree ("version__status");
  CREATE INDEX "_courses_v_created_at_idx" ON "_courses_v" USING btree ("created_at");
  CREATE INDEX "_courses_v_updated_at_idx" ON "_courses_v" USING btree ("updated_at");
  CREATE INDEX "_courses_v_latest_idx" ON "_courses_v" USING btree ("latest");
  CREATE INDEX "_courses_v_autosave_idx" ON "_courses_v" USING btree ("autosave");
  CREATE INDEX "_courses_v_rels_order_idx" ON "_courses_v_rels" USING btree ("order");
  CREATE INDEX "_courses_v_rels_parent_idx" ON "_courses_v_rels" USING btree ("parent_id");
  CREATE INDEX "_courses_v_rels_path_idx" ON "_courses_v_rels" USING btree ("path");
  CREATE INDEX "_courses_v_rels_categories_id_idx" ON "_courses_v_rels" USING btree ("categories_id");
  CREATE INDEX "_courses_v_rels_disciplines_id_idx" ON "_courses_v_rels" USING btree ("disciplines_id");
  CREATE INDEX "_courses_v_rels_levels_id_idx" ON "_courses_v_rels" USING btree ("levels_id");
  CREATE INDEX "_courses_v_rels_campuses_id_idx" ON "_courses_v_rels" USING btree ("campuses_id");
  CREATE INDEX "_courses_v_rels_delivery_modes_id_idx" ON "_courses_v_rels" USING btree ("delivery_modes_id");
  CREATE INDEX "_courses_v_rels_durations_id_idx" ON "_courses_v_rels" USING btree ("durations_id");
  CREATE INDEX "_courses_v_rels_universities_id_idx" ON "_courses_v_rels" USING btree ("universities_id");
  CREATE INDEX "_courses_v_rels_courses_id_idx" ON "_courses_v_rels" USING btree ("courses_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE UNIQUE INDEX "posts_path_idx" ON "posts" USING btree ("path");
  CREATE INDEX "posts_url_date_idx" ON "posts" USING btree ("url_date");
  CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category");
  CREATE INDEX "posts_topic_idx" ON "posts" USING btree ("topic_id");
  CREATE INDEX "posts_featured_idx" ON "posts" USING btree ("featured");
  CREATE INDEX "posts_published_at_idx" ON "posts" USING btree ("published_at");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_card_image_idx" ON "posts" USING btree ("card_image_id");
  CREATE UNIQUE INDEX "posts_import_import_wp_id_idx" ON "posts" USING btree ("import_wp_id");
  CREATE INDEX "posts_import_import_import_class_idx" ON "posts" USING btree ("import_import_class");
  CREATE INDEX "posts_import_import_review_status_idx" ON "posts" USING btree ("import_review_status");
  CREATE UNIQUE INDEX "posts_import_import_apprunner_id_idx" ON "posts" USING btree ("import_apprunner_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_path_idx" ON "_posts_v" USING btree ("version_path");
  CREATE INDEX "_posts_v_version_version_url_date_idx" ON "_posts_v" USING btree ("version_url_date");
  CREATE INDEX "_posts_v_version_version_category_idx" ON "_posts_v" USING btree ("version_category");
  CREATE INDEX "_posts_v_version_version_topic_idx" ON "_posts_v" USING btree ("version_topic_id");
  CREATE INDEX "_posts_v_version_version_featured_idx" ON "_posts_v" USING btree ("version_featured");
  CREATE INDEX "_posts_v_version_version_published_at_idx" ON "_posts_v" USING btree ("version_published_at");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_version_card_image_idx" ON "_posts_v" USING btree ("version_card_image_id");
  CREATE INDEX "_posts_v_version_import_version_import_wp_id_idx" ON "_posts_v" USING btree ("version_import_wp_id");
  CREATE INDEX "_posts_v_version_import_version_import_import_class_idx" ON "_posts_v" USING btree ("version_import_import_class");
  CREATE INDEX "_posts_v_version_import_version_import_review_status_idx" ON "_posts_v" USING btree ("version_import_review_status");
  CREATE INDEX "_posts_v_version_import_version_import_apprunner_id_idx" ON "_posts_v" USING btree ("version_import_apprunner_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "blog_categories_slug_idx" ON "blog_categories" USING btree ("slug");
  CREATE INDEX "blog_categories_active_idx" ON "blog_categories" USING btree ("active");
  CREATE UNIQUE INDEX "blog_categories_legacy_code_idx" ON "blog_categories" USING btree ("legacy_code");
  CREATE INDEX "blog_categories_updated_at_idx" ON "blog_categories" USING btree ("updated_at");
  CREATE INDEX "blog_categories_created_at_idx" ON "blog_categories" USING btree ("created_at");
  CREATE INDEX "galleries_campuses_order_idx" ON "galleries_campuses" USING btree ("order");
  CREATE INDEX "galleries_campuses_parent_idx" ON "galleries_campuses" USING btree ("parent_id");
  CREATE INDEX "galleries_campuses_value_idx" ON "galleries_campuses" USING btree ("value");
  CREATE INDEX "galleries_items_order_idx" ON "galleries_items" USING btree ("_order");
  CREATE INDEX "galleries_items_parent_id_idx" ON "galleries_items" USING btree ("_parent_id");
  CREATE INDEX "galleries_items_image_idx" ON "galleries_items" USING btree ("image_id");
  CREATE UNIQUE INDEX "galleries_slug_idx" ON "galleries" USING btree ("slug");
  CREATE INDEX "galleries_event_date_idx" ON "galleries" USING btree ("event_date");
  CREATE INDEX "galleries_featured_idx" ON "galleries" USING btree ("featured");
  CREATE INDEX "galleries_active_idx" ON "galleries" USING btree ("active");
  CREATE INDEX "galleries_cover_image_idx" ON "galleries" USING btree ("cover_image_id");
  CREATE UNIQUE INDEX "galleries_apprunner_id_idx" ON "galleries" USING btree ("apprunner_id");
  CREATE INDEX "galleries_updated_at_idx" ON "galleries" USING btree ("updated_at");
  CREATE INDEX "galleries_created_at_idx" ON "galleries" USING btree ("created_at");
  CREATE UNIQUE INDEX "levels_slug_idx" ON "levels" USING btree ("slug");
  CREATE INDEX "levels_active_idx" ON "levels" USING btree ("active");
  CREATE UNIQUE INDEX "levels_legacy_id_idx" ON "levels" USING btree ("legacy_id");
  CREATE INDEX "levels_updated_at_idx" ON "levels" USING btree ("updated_at");
  CREATE INDEX "levels_created_at_idx" ON "levels" USING btree ("created_at");
  CREATE UNIQUE INDEX "delivery_modes_slug_idx" ON "delivery_modes" USING btree ("slug");
  CREATE INDEX "delivery_modes_active_idx" ON "delivery_modes" USING btree ("active");
  CREATE UNIQUE INDEX "delivery_modes_legacy_id_idx" ON "delivery_modes" USING btree ("legacy_id");
  CREATE INDEX "delivery_modes_updated_at_idx" ON "delivery_modes" USING btree ("updated_at");
  CREATE INDEX "delivery_modes_created_at_idx" ON "delivery_modes" USING btree ("created_at");
  CREATE UNIQUE INDEX "durations_slug_idx" ON "durations" USING btree ("slug");
  CREATE INDEX "durations_active_idx" ON "durations" USING btree ("active");
  CREATE UNIQUE INDEX "durations_legacy_id_idx" ON "durations" USING btree ("legacy_id");
  CREATE INDEX "durations_updated_at_idx" ON "durations" USING btree ("updated_at");
  CREATE INDEX "durations_created_at_idx" ON "durations" USING btree ("created_at");
  CREATE UNIQUE INDEX "universities_slug_idx" ON "universities" USING btree ("slug");
  CREATE INDEX "universities_active_idx" ON "universities" USING btree ("active");
  CREATE UNIQUE INDEX "universities_legacy_id_idx" ON "universities" USING btree ("legacy_id");
  CREATE INDEX "universities_image_idx" ON "universities" USING btree ("image_id");
  CREATE INDEX "universities_updated_at_idx" ON "universities" USING btree ("updated_at");
  CREATE INDEX "universities_created_at_idx" ON "universities" USING btree ("created_at");
  CREATE UNIQUE INDEX "campuses_slug_idx" ON "campuses" USING btree ("slug");
  CREATE INDEX "campuses_active_idx" ON "campuses" USING btree ("active");
  CREATE UNIQUE INDEX "campuses_legacy_id_idx" ON "campuses" USING btree ("legacy_id");
  CREATE INDEX "campuses_image_idx" ON "campuses" USING btree ("image_id");
  CREATE INDEX "campuses_portal_campus_id_idx" ON "campuses" USING btree ("portal_campus_id");
  CREATE INDEX "campuses_updated_at_idx" ON "campuses" USING btree ("updated_at");
  CREATE INDEX "campuses_created_at_idx" ON "campuses" USING btree ("created_at");
  CREATE UNIQUE INDEX "disciplines_slug_idx" ON "disciplines" USING btree ("slug");
  CREATE INDEX "disciplines_active_idx" ON "disciplines" USING btree ("active");
  CREATE UNIQUE INDEX "disciplines_legacy_id_idx" ON "disciplines" USING btree ("legacy_id");
  CREATE INDEX "disciplines_image_idx" ON "disciplines" USING btree ("image_id");
  CREATE INDEX "disciplines_parent_idx" ON "disciplines" USING btree ("parent_id");
  CREATE INDEX "disciplines_updated_at_idx" ON "disciplines" USING btree ("updated_at");
  CREATE INDEX "disciplines_created_at_idx" ON "disciplines" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_active_idx" ON "categories" USING btree ("active");
  CREATE UNIQUE INDEX "categories_legacy_id_idx" ON "categories" USING btree ("legacy_id");
  CREATE INDEX "categories_image_idx" ON "categories" USING btree ("image_id");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_starts_at_idx" ON "events" USING btree ("starts_at");
  CREATE INDEX "events_discipline_idx" ON "events" USING btree ("discipline_id");
  CREATE INDEX "events_image_idx" ON "events" USING btree ("image_id");
  CREATE UNIQUE INDEX "events_legacy_id_idx" ON "events" USING btree ("legacy_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "events_texts_order_parent" ON "events_texts" USING btree ("order","parent_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_starts_at_idx" ON "_events_v" USING btree ("version_starts_at");
  CREATE INDEX "_events_v_version_version_discipline_idx" ON "_events_v" USING btree ("version_discipline_id");
  CREATE INDEX "_events_v_version_version_image_idx" ON "_events_v" USING btree ("version_image_id");
  CREATE INDEX "_events_v_version_version_legacy_id_idx" ON "_events_v" USING btree ("version_legacy_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_autosave_idx" ON "_events_v" USING btree ("autosave");
  CREATE INDEX "_events_v_texts_order_parent" ON "_events_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "testimonials_course_idx" ON "testimonials" USING btree ("course_id");
  CREATE INDEX "testimonials_image_idx" ON "testimonials" USING btree ("image_id");
  CREATE INDEX "testimonials_featured_idx" ON "testimonials" USING btree ("featured");
  CREATE UNIQUE INDEX "testimonials_legacy_id_idx" ON "testimonials" USING btree ("legacy_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "testimonials__status_idx" ON "testimonials" USING btree ("_status");
  CREATE INDEX "_testimonials_v_parent_idx" ON "_testimonials_v" USING btree ("parent_id");
  CREATE INDEX "_testimonials_v_version_version_course_idx" ON "_testimonials_v" USING btree ("version_course_id");
  CREATE INDEX "_testimonials_v_version_version_image_idx" ON "_testimonials_v" USING btree ("version_image_id");
  CREATE INDEX "_testimonials_v_version_version_featured_idx" ON "_testimonials_v" USING btree ("version_featured");
  CREATE INDEX "_testimonials_v_version_version_legacy_id_idx" ON "_testimonials_v" USING btree ("version_legacy_id");
  CREATE INDEX "_testimonials_v_version_version_updated_at_idx" ON "_testimonials_v" USING btree ("version_updated_at");
  CREATE INDEX "_testimonials_v_version_version_created_at_idx" ON "_testimonials_v" USING btree ("version_created_at");
  CREATE INDEX "_testimonials_v_version_version__status_idx" ON "_testimonials_v" USING btree ("version__status");
  CREATE INDEX "_testimonials_v_created_at_idx" ON "_testimonials_v" USING btree ("created_at");
  CREATE INDEX "_testimonials_v_updated_at_idx" ON "_testimonials_v" USING btree ("updated_at");
  CREATE INDEX "_testimonials_v_latest_idx" ON "_testimonials_v" USING btree ("latest");
  CREATE INDEX "_testimonials_v_autosave_idx" ON "_testimonials_v" USING btree ("autosave");
  CREATE INDEX "staff_research_order_idx" ON "staff_research" USING btree ("_order");
  CREATE INDEX "staff_research_parent_id_idx" ON "staff_research" USING btree ("_parent_id");
  CREATE INDEX "staff_grants_order_idx" ON "staff_grants" USING btree ("_order");
  CREATE INDEX "staff_grants_parent_id_idx" ON "staff_grants" USING btree ("_parent_id");
  CREATE INDEX "staff_activities_order_idx" ON "staff_activities" USING btree ("_order");
  CREATE INDEX "staff_activities_parent_id_idx" ON "staff_activities" USING btree ("_parent_id");
  CREATE INDEX "staff_supervision_order_idx" ON "staff_supervision" USING btree ("_order");
  CREATE INDEX "staff_supervision_parent_id_idx" ON "staff_supervision" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "staff_slug_idx" ON "staff" USING btree ("slug");
  CREATE INDEX "staff_school_idx" ON "staff" USING btree ("school_id");
  CREATE INDEX "staff_photo_idx" ON "staff" USING btree ("photo_id");
  CREATE INDEX "staff_active_idx" ON "staff" USING btree ("active");
  CREATE UNIQUE INDEX "staff_legacy_id_idx" ON "staff" USING btree ("legacy_id");
  CREATE INDEX "staff_updated_at_idx" ON "staff" USING btree ("updated_at");
  CREATE INDEX "staff_created_at_idx" ON "staff" USING btree ("created_at");
  CREATE INDEX "staff__status_idx" ON "staff" USING btree ("_status");
  CREATE INDEX "staff_rels_order_idx" ON "staff_rels" USING btree ("order");
  CREATE INDEX "staff_rels_parent_idx" ON "staff_rels" USING btree ("parent_id");
  CREATE INDEX "staff_rels_path_idx" ON "staff_rels" USING btree ("path");
  CREATE INDEX "staff_rels_courses_id_idx" ON "staff_rels" USING btree ("courses_id");
  CREATE INDEX "_staff_research_v_order_idx" ON "_staff_research_v" USING btree ("_order");
  CREATE INDEX "_staff_research_v_parent_id_idx" ON "_staff_research_v" USING btree ("_parent_id");
  CREATE INDEX "_staff_grants_v_order_idx" ON "_staff_grants_v" USING btree ("_order");
  CREATE INDEX "_staff_grants_v_parent_id_idx" ON "_staff_grants_v" USING btree ("_parent_id");
  CREATE INDEX "_staff_activities_v_order_idx" ON "_staff_activities_v" USING btree ("_order");
  CREATE INDEX "_staff_activities_v_parent_id_idx" ON "_staff_activities_v" USING btree ("_parent_id");
  CREATE INDEX "_staff_supervision_v_order_idx" ON "_staff_supervision_v" USING btree ("_order");
  CREATE INDEX "_staff_supervision_v_parent_id_idx" ON "_staff_supervision_v" USING btree ("_parent_id");
  CREATE INDEX "_staff_v_parent_idx" ON "_staff_v" USING btree ("parent_id");
  CREATE INDEX "_staff_v_version_version_slug_idx" ON "_staff_v" USING btree ("version_slug");
  CREATE INDEX "_staff_v_version_version_school_idx" ON "_staff_v" USING btree ("version_school_id");
  CREATE INDEX "_staff_v_version_version_photo_idx" ON "_staff_v" USING btree ("version_photo_id");
  CREATE INDEX "_staff_v_version_version_active_idx" ON "_staff_v" USING btree ("version_active");
  CREATE INDEX "_staff_v_version_version_legacy_id_idx" ON "_staff_v" USING btree ("version_legacy_id");
  CREATE INDEX "_staff_v_version_version_updated_at_idx" ON "_staff_v" USING btree ("version_updated_at");
  CREATE INDEX "_staff_v_version_version_created_at_idx" ON "_staff_v" USING btree ("version_created_at");
  CREATE INDEX "_staff_v_version_version__status_idx" ON "_staff_v" USING btree ("version__status");
  CREATE INDEX "_staff_v_created_at_idx" ON "_staff_v" USING btree ("created_at");
  CREATE INDEX "_staff_v_updated_at_idx" ON "_staff_v" USING btree ("updated_at");
  CREATE INDEX "_staff_v_latest_idx" ON "_staff_v" USING btree ("latest");
  CREATE INDEX "_staff_v_autosave_idx" ON "_staff_v" USING btree ("autosave");
  CREATE INDEX "_staff_v_rels_order_idx" ON "_staff_v_rels" USING btree ("order");
  CREATE INDEX "_staff_v_rels_parent_idx" ON "_staff_v_rels" USING btree ("parent_id");
  CREATE INDEX "_staff_v_rels_path_idx" ON "_staff_v_rels" USING btree ("path");
  CREATE INDEX "_staff_v_rels_courses_id_idx" ON "_staff_v_rels" USING btree ("courses_id");
  CREATE INDEX "enquiries_deliveries_order_idx" ON "enquiries_deliveries" USING btree ("_order");
  CREATE INDEX "enquiries_deliveries_parent_id_idx" ON "enquiries_deliveries" USING btree ("_parent_id");
  CREATE INDEX "enquiries_public_id_idx" ON "enquiries" USING btree ("public_id");
  CREATE UNIQUE INDEX "enquiries_submission_id_idx" ON "enquiries" USING btree ("submission_id");
  CREATE INDEX "enquiries_form_key_idx" ON "enquiries" USING btree ("form_key");
  CREATE INDEX "enquiries_status_idx" ON "enquiries" USING btree ("status");
  CREATE INDEX "enquiries_email_idx" ON "enquiries" USING btree ("email");
  CREATE INDEX "enquiries_course_idx" ON "enquiries" USING btree ("course_id");
  CREATE INDEX "enquiries_campus_idx" ON "enquiries" USING btree ("campus_id");
  CREATE INDEX "enquiries_campaign_code_idx" ON "enquiries" USING btree ("campaign_code");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  CREATE INDEX "products_gateways_order_idx" ON "products_gateways" USING btree ("order");
  CREATE INDEX "products_gateways_parent_idx" ON "products_gateways" USING btree ("parent_id");
  CREATE UNIQUE INDEX "products_sku_idx" ON "products" USING btree ("sku");
  CREATE UNIQUE INDEX "products_legacy_e2_btn_idx" ON "products" USING btree ("legacy_e2_btn");
  CREATE INDEX "products_active_idx" ON "products" USING btree ("active");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "_products_v_version_gateways_order_idx" ON "_products_v_version_gateways" USING btree ("order");
  CREATE INDEX "_products_v_version_gateways_parent_idx" ON "_products_v_version_gateways" USING btree ("parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_sku_idx" ON "_products_v" USING btree ("version_sku");
  CREATE INDEX "_products_v_version_version_legacy_e2_btn_idx" ON "_products_v" USING btree ("version_legacy_e2_btn");
  CREATE INDEX "_products_v_version_version_active_idx" ON "_products_v" USING btree ("version_active");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "payments_status_history_order_idx" ON "payments_status_history" USING btree ("_order");
  CREATE INDEX "payments_status_history_parent_id_idx" ON "payments_status_history" USING btree ("_parent_id");
  CREATE INDEX "payments_steps_order_idx" ON "payments_steps" USING btree ("_order");
  CREATE INDEX "payments_steps_parent_id_idx" ON "payments_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "payments_payment_id_idx" ON "payments" USING btree ("payment_id");
  CREATE INDEX "payments_product_idx" ON "payments" USING btree ("product_id");
  CREATE INDEX "payments_invoice_no_idx" ON "payments" USING btree ("invoice_no");
  CREATE INDEX "payments_student_id_idx" ON "payments" USING btree ("student_id");
  CREATE INDEX "payments_payer_email_idx" ON "payments" USING btree ("payer_email");
  CREATE INDEX "payments_gateway_idx" ON "payments" USING btree ("gateway");
  CREATE INDEX "payments_gateway_ref_idx" ON "payments" USING btree ("gateway_ref");
  CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");
  CREATE INDEX "payments_updated_at_idx" ON "payments" USING btree ("updated_at");
  CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_alumni_id_idx" ON "payload_locked_documents_rels" USING btree ("alumni_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_blog_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_categories_id");
  CREATE INDEX "payload_locked_documents_rels_galleries_id_idx" ON "payload_locked_documents_rels" USING btree ("galleries_id");
  CREATE INDEX "payload_locked_documents_rels_levels_id_idx" ON "payload_locked_documents_rels" USING btree ("levels_id");
  CREATE INDEX "payload_locked_documents_rels_delivery_modes_id_idx" ON "payload_locked_documents_rels" USING btree ("delivery_modes_id");
  CREATE INDEX "payload_locked_documents_rels_durations_id_idx" ON "payload_locked_documents_rels" USING btree ("durations_id");
  CREATE INDEX "payload_locked_documents_rels_universities_id_idx" ON "payload_locked_documents_rels" USING btree ("universities_id");
  CREATE INDEX "payload_locked_documents_rels_campuses_id_idx" ON "payload_locked_documents_rels" USING btree ("campuses_id");
  CREATE INDEX "payload_locked_documents_rels_disciplines_id_idx" ON "payload_locked_documents_rels" USING btree ("disciplines_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_staff_id_idx" ON "payload_locked_documents_rels" USING btree ("staff_id");
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_payments_id_idx" ON "payload_locked_documents_rels" USING btree ("payments_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_rels_alumni_id_idx" ON "payload_preferences_rels" USING btree ("alumni_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "course_shared__status_idx" ON "course_shared" USING btree ("_status");
  CREATE INDEX "_course_shared_v_version_version__status_idx" ON "_course_shared_v" USING btree ("version__status");
  CREATE INDEX "_course_shared_v_created_at_idx" ON "_course_shared_v" USING btree ("created_at");
  CREATE INDEX "_course_shared_v_updated_at_idx" ON "_course_shared_v" USING btree ("updated_at");
  CREATE INDEX "_course_shared_v_latest_idx" ON "_course_shared_v" USING btree ("latest");
  CREATE INDEX "_course_shared_v_autosave_idx" ON "_course_shared_v" USING btree ("autosave");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "alumni_sessions" CASCADE;
  DROP TABLE "alumni" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "documents_listings" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "courses_sections" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "courses_rels" CASCADE;
  DROP TABLE "_courses_v_version_sections" CASCADE;
  DROP TABLE "_courses_v" CASCADE;
  DROP TABLE "_courses_v_rels" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "blog_categories" CASCADE;
  DROP TABLE "galleries_campuses" CASCADE;
  DROP TABLE "galleries_items" CASCADE;
  DROP TABLE "galleries" CASCADE;
  DROP TABLE "levels" CASCADE;
  DROP TABLE "delivery_modes" CASCADE;
  DROP TABLE "durations" CASCADE;
  DROP TABLE "universities" CASCADE;
  DROP TABLE "campuses" CASCADE;
  DROP TABLE "disciplines" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_texts" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_texts" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "_testimonials_v" CASCADE;
  DROP TABLE "staff_research" CASCADE;
  DROP TABLE "staff_grants" CASCADE;
  DROP TABLE "staff_activities" CASCADE;
  DROP TABLE "staff_supervision" CASCADE;
  DROP TABLE "staff" CASCADE;
  DROP TABLE "staff_rels" CASCADE;
  DROP TABLE "_staff_research_v" CASCADE;
  DROP TABLE "_staff_grants_v" CASCADE;
  DROP TABLE "_staff_activities_v" CASCADE;
  DROP TABLE "_staff_supervision_v" CASCADE;
  DROP TABLE "_staff_v" CASCADE;
  DROP TABLE "_staff_v_rels" CASCADE;
  DROP TABLE "enquiries_deliveries" CASCADE;
  DROP TABLE "enquiries" CASCADE;
  DROP TABLE "products_gateways" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "_products_v_version_gateways" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "payments_status_history" CASCADE;
  DROP TABLE "payments_steps" CASCADE;
  DROP TABLE "payments" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "course_shared" CASCADE;
  DROP TABLE "_course_shared_v" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_documents_listings_section";
  DROP TYPE "public"."enum_documents_category";
  DROP TYPE "public"."enum_documents_audience";
  DROP TYPE "public"."enum_courses_sections_slot";
  DROP TYPE "public"."enum_courses_student_type";
  DROP TYPE "public"."enum_courses_course_type";
  DROP TYPE "public"."enum_courses_kh_id_source";
  DROP TYPE "public"."enum_courses_import_import_class";
  DROP TYPE "public"."enum_courses_import_review_status";
  DROP TYPE "public"."enum_courses_status";
  DROP TYPE "public"."enum__courses_v_version_sections_slot";
  DROP TYPE "public"."enum__courses_v_version_student_type";
  DROP TYPE "public"."enum__courses_v_version_course_type";
  DROP TYPE "public"."enum__courses_v_version_kh_id_source";
  DROP TYPE "public"."enum__courses_v_version_import_import_class";
  DROP TYPE "public"."enum__courses_v_version_import_review_status";
  DROP TYPE "public"."enum__courses_v_version_status";
  DROP TYPE "public"."enum_posts_category";
  DROP TYPE "public"."enum_posts_import_import_class";
  DROP TYPE "public"."enum_posts_import_review_status";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_category";
  DROP TYPE "public"."enum__posts_v_version_import_import_class";
  DROP TYPE "public"."enum__posts_v_version_import_review_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_galleries_campuses";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum_testimonials_source";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum__testimonials_v_version_source";
  DROP TYPE "public"."enum__testimonials_v_version_status";
  DROP TYPE "public"."enum_staff_status";
  DROP TYPE "public"."enum__staff_v_version_status";
  DROP TYPE "public"."enum_enquiries_deliveries_status";
  DROP TYPE "public"."enum_enquiries_status";
  DROP TYPE "public"."enum_enquiries_captcha_status";
  DROP TYPE "public"."enum_enquiries_source";
  DROP TYPE "public"."enum_products_gateways";
  DROP TYPE "public"."enum_products_kind";
  DROP TYPE "public"."enum_products_currency";
  DROP TYPE "public"."enum__products_v_version_gateways";
  DROP TYPE "public"."enum__products_v_version_kind";
  DROP TYPE "public"."enum__products_v_version_currency";
  DROP TYPE "public"."enum_payments_kind";
  DROP TYPE "public"."enum_payments_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_course_shared_status";
  DROP TYPE "public"."enum__course_shared_v_version_status";`)
}
