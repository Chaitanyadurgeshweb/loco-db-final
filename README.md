# Loco Portal

Independent, unofficial Indian Railways locomotive reference. Not affiliated with Indian Railways, any zone, division, production unit or government authority.

## Overview

* **Public site:** search and browse locomotives by number, class, shed, zone and manufacturer.
* **Administrators:** submit new locomotives, request changes to existing records, upload Excel files in bulk and add comments. Administrators cannot change live records directly.
* **Master Administrators:** review every submission, compare current and proposed values, then approve or decline. Only an approval changes live data.
* **Audit trail:** every submission, approval and decline is recorded with who and when.

## Configuration

Copy `.env.example` to `.env.local` and fill in the values. Never commit real values or share them in documentation. Server-side secrets are never exposed to the browser.

## Local development

```bash
npm install
npm run dev
npm run build   # type-checks and builds
```

## Database

Migrations are in `supabase/migrations`, applied in numeric order. `0003_approval_workflow.sql` adds the approval workflow and removes direct write access to locomotive records for administrators.

## Documentation notes

Data in the portal is informational and may be incomplete or out of date. See the in-site About, Data status and Legal pages.
