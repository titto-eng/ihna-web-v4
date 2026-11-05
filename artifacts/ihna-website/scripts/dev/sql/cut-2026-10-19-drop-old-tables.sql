-- Drops the tables, columns and enums of collections and globals that are code in this repo (pages, landingPages, campaigns,
-- formDefinitions, redirects, header, footer, siteSettings, enquiryRouting) from a database that still has them.
-- Run it yourself against a DEV database only, after `pg_dump` if you want the rows back:
--   psql postgres://localhost:5432/ihm -v ON_ERROR_STOP=1 -f scripts/dev/sql/cut-2026-10-19-drop-old-tables.sql
-- Production starts from a fresh database with `payload migrate` (src/migrations/), so nothing to drop there.
BEGIN;
ALTER TABLE campuses DROP COLUMN IF EXISTS detail_page_id;
ALTER TABLE universities DROP COLUMN IF EXISTS detail_page_id;
ALTER TABLE enquiries DROP COLUMN IF EXISTS campaign_id;
ALTER TABLE events DROP COLUMN IF EXISTS form_key_id, DROP COLUMN IF EXISTS campaign_id;
ALTER TABLE _events_v DROP COLUMN IF EXISTS version_form_key_id, DROP COLUMN IF EXISTS version_campaign_id;
ALTER TABLE staff_rels DROP COLUMN IF EXISTS pages_id;
ALTER TABLE _staff_v_rels DROP COLUMN IF EXISTS pages_id;
ALTER TABLE payload_locked_documents_rels
  DROP COLUMN IF EXISTS pages_id, DROP COLUMN IF EXISTS landing_pages_id, DROP COLUMN IF EXISTS campaigns_id,
  DROP COLUMN IF EXISTS form_definitions_id, DROP COLUMN IF EXISTS redirects_id;
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    AND table_name ~ '^(pages|_pages_v|landing_pages|_landing_pages_v|campaigns|_campaigns_v|form_definitions|_form_definitions_v|redirects|header|_header_v|footer|_footer_v|site_settings|_site_settings_v|enquiry_routing)(_|$)'
  LOOP EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', r.table_name); END LOOP;
  FOR r IN SELECT typname FROM pg_type
    WHERE typname ~ '^enum_(pages|_pages_v|landing_pages|_landing_pages_v|campaigns|_campaigns_v|form_definitions|_form_definitions_v|redirects|header|_header_v|footer|_footer_v|site_settings|_site_settings_v|enquiry_routing)_'
  LOOP EXECUTE format('DROP TYPE IF EXISTS %I CASCADE', r.typname); END LOOP;
END $$;
COMMIT;
