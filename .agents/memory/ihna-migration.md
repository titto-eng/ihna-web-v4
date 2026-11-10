---
name: IHNA migration scope
description: User intent and boundaries for the existing IHNA website import.
---
Import the user's completed IHNA website with its database and deployment resources, preserving Next.js, Payload CMS, Node, and PostgreSQL rather than redesigning or recreating it.

**Why:** The user built the entire website already and wants a Replit test deployment to show authorised reviewers.

**How to apply:** Treat this as a migration. Preserve the existing CMS and appearance, isolate test data from live services, and confirm reviewer access protection before publishing.

The user wants to develop both locally with a local database and in Replit, exchanging code changes in both directions through GitHub, then quickly republishing. Database updates must also have an explicit transfer workflow.

**Why:** The user wants neither editing environment to become a separate, diverging project.

**How to apply:** Keep one canonical repository and portable runtime configuration. Distinguish Git code synchronisation, database schema changes, CMS content transfer, and uploaded assets; never treat a Git pull as a database merge.
