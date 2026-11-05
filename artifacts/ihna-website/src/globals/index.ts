import type { GlobalConfig } from 'payload'
import { CourseShared } from './CourseShared'

// Header, footer, site settings and enquiry routing are code (src/content/{nav,footer,site,enquiry-routing}.ts), not globals.
export const globals: GlobalConfig[] = [CourseShared]
