// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// Tests never reach a real CRM, even when a developer's .env goes live for the dev server (DEC-50): cases that need other values pass `env`.
process.env.DRY_RUN = '1'
delete process.env.ENQUIRY_LIVE_ADAPTERS
delete process.env.PAYMENTS_DRY_RUN
