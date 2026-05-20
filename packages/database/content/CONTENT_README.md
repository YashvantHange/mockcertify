# Question content pipeline

## Overview

- **Target:** 500 active, syllabus-aligned MCQs per certification (16 certs = 8,000 total)
- **Sources:** Official exam guides and vendor documentation only
- **No auto-filler:** `pnpm db:seed:questions` validates counts only; it does not generate template questions

## Directory layout

| Path | Purpose |
|------|---------|
| `blueprints/<slug>.json` | Official domain weights and objective IDs |
| `templates/<slug>.csv` | Import template with 2 example rows |
| `generated/<slug>.csv` | Blueprint-generated question banks (run generator) |
| `questions/<slug>.csv` | Hand-reviewed CSV batches (optional) |
| `progress/<slug>.yaml` | Per-cert content track progress |
| `reports/validation-report.md` | QA output from validate script |

## Workflow (per certification track)

1. Lock blueprint: `packages/database/content/blueprints/<slug>.json`
2. Author 500 original MCQs mapped to `objective_id`
3. Peer review and dedupe
4. Import in batches of 50: Admin → Bulk CSV Import, or CLI below
5. Run validation: `pnpm db:validate-bank`

## Commands

```bash
# Regenerate blueprint JSON from build script
node packages/database/content/build-blueprints.mjs

# Templates + progress files
pnpm content:init

# Generate 500 questions per cert from blueprints (syllabus-mapped)
pnpm db:generate-questions

# Import all CSVs from generated/ and questions/
pnpm db:import-content

# Validate bank vs blueprints
pnpm db:validate-bank

# Deactivate legacy auto-generated / generic-domain questions
pnpm db:cleanup-legacy

# Sync domains to DB after blueprint changes
pnpm --filter @certprep/database sync-domains
```

## CSV format

```csv
certification_slug,domain_slug,objective_id,title,description,option_a,option_b,option_c,option_d,correct_option,difficulty,tags,explanation,reference_urls
```

- `tags` and `reference_urls`: pipe-separated (`aws-saa-c03|RA-1|reviewed`)
- `correct_option`: A, B, C, or D
- `difficulty`: EASY, MEDIUM, or HARD

## API (admin)

- `GET /api/v1/admin/questions/csv-template/:certSlug`
- `GET /api/v1/admin/questions/slug-cheat-sheet`
- `POST /api/v1/admin/questions/validate-csv` — pre-flight, no DB writes
- `POST /api/v1/admin/questions/bulk-csv` — import; skips duplicate titles
