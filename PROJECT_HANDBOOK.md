# MockCertify — Project Handbook

> **Purpose of this document:** Single source of truth for humans and AI assistants resuming work on this codebase. Read this first when returning after a break.

**Last updated:** May 2026  
**Product name:** MockCertify (public-facing)  
**Internal package names:** `@certprep/*` (historical; not renamed in `package.json`)

---

## 1. What this project is

**MockCertify** is a full-stack IT certification practice platform. Users browse certifications, start practice/timed/review exams, see explanations, track progress, use community features, and (admins) manage content via CSV import.

| Metric | Value |
|--------|-------|
| Certifications | **16** |
| Questions per cert (target) | **500 active** |
| Total question bank | **8,000** |
| Categories | 5 (cloud, cybersecurity, networking, ai-ml, project-management) |

**Out of scope by design:** third-party exam dumps, scraping paid PDFs, auto-generated template filler to hit 500 questions (`generateQuestionBatch` is retired).

---

## 2. Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion, Recharts |
| Backend | Express.js, TypeScript, `tsx` in dev |
| Database | PostgreSQL 16 (Docker locally), Prisma ORM |
| Auth | JWT (httpOnly cookies) + optional Google OAuth |
| Validation | Zod in `packages/shared` |
| Monorepo | pnpm workspaces |

**Ports (local):**

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- API base path: `/api/v1`

---

## 3. Repository layout

```
Website/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   └── src/
│   │       ├── app/         # Routes (pages)
│   │       ├── components/  # UI (navbar, exam player, results, etc.)
│   │       ├── hooks/       # useApi, etc.
│   │       └── lib/         # api client, exam-cache, utils
│   └── api/                 # Express API
│       └── src/
│           ├── routes/      # REST route modules
│           ├── services/    # exam, leaderboard, etc.
│           ├── middleware/  # auth, validate, cache
│           └── utils/       # question-pool, recent-questions, csv-import
├── packages/
│   ├── database/            # Prisma schema, seeds, content/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   ├── seed-data.ts
│   │   │   ├── seed-questions.ts   # validation only (no auto-gen)
│   │   │   ├── seed-aws-ml.ts      # curated AWS ML questions only
│   │   │   └── aws-ml-specialty-questions.ts
│   │   └── content/
│   │       ├── blueprints/          # 16 × official blueprint JSON
│   │       ├── generated/           # 16 × 500-row CSV (from generator)
│   │       ├── templates/           # CSV import templates per cert
│   │       ├── progress/            # YAML progress per cert track
│   │       └── reports/             # validation-report.md
│   └── shared/              # Zod schemas (auth, exam, admin CSV, etc.)
├── scripts/                 # CLI: import, validate, smoke tests
├── docker-compose.yml       # Postgres for local dev
├── README.md                # Quick start
└── PROJECT_HANDBOOK.md      # ← this file
```

---

## 4. How the website works (user flows)

### 4.1 Browse & certify

1. Home / categories list certifications grouped by category slug.
2. **Certification detail** (`/certifications/[slug]`):
   - Shows name, provider, **active question count** (from API `_count.questions`), duration, pass %.
   - Lists official **domains** with weights from blueprint JSON.
3. User must be logged in to start an exam (redirects to `/login?redirect=...`).

### 4.2 Exam modes

| Mode | Behavior |
|------|----------|
| **PRACTICE** | User picks question count (5–min(100, pool)) and optional timer via **Customize & Start** modal |
| **TIMED** | Same customize flow; default timer from cert `durationMinutes` |
| **REVIEW** | Loads previously missed/flagged style review (existing API behavior) |

**Start exam API:** `POST /api/v1/exams/start`  
Body: `{ certificationId, mode, questionCount?, timeLimitMinutes? }`

**During exam:** `PATCH /exams/:attemptId/answer` (auto-save), flag, navigate.  
**Finish:** `POST /exams/:attemptId/submit` → results UI with domain breakdown (`exam-results.tsx`).

### 4.3 Question selection (anti-repetition)

Implemented in `apps/api/src/services/exam.service.ts` + `utils/question-pool.ts` + `utils/recent-questions.ts`:

- Pool = active questions for certification (`isActive: true`).
- `questionCount` capped by pool size and max **100** per attempt.
- **Excludes** question IDs from recent completed attempts (configurable window) so repeat exams feel fresh.
- **Shuffles answer options** at exam time (`utils/shuffle.ts`) so correct answer isn’t always the same letter in the UI.

### 4.4 Other features

- **Dashboard / analytics** — attempts, weak domains, streaks
- **Leaderboards** — recalculated on cron every 6 hours
- **Community** — discussions per question/cert
- **Bookmarks & notes** — per question
- **Admin** — stats, users, CSV import, blueprint templates
- **Dark mode** — `next-themes` in `Providers`
- **Pricing page** — removed; `/pricing` redirects home (product decision)

---

## 5. Authentication

| Method | Details |
|--------|---------|
| Email/password | Register, login, forgot password |
| Google OAuth | Optional; needs `GOOGLE_CLIENT_*` in `apps/api/.env` |
| Tokens | Access + refresh JWT in httpOnly cookies |
| Admin user | Seeded: `admin@certprep.local` / `Admin123!@#` (override `ADMIN_PASSWORD`) |

**Config loading:** `apps/api/src/config.ts` loads root `.env` then `apps/api/.env` via dotenv.

**Frontend API client:** `apps/web/src/lib/api.ts` — `credentials: "include"` for cookies.

---

## 6. Database model (Prisma highlights)

Key models in `packages/database/prisma/schema.prisma`:

| Model | Role |
|-------|------|
| `User` | Accounts, role (`USER` \| `ADMIN`), streaks |
| `Category` | Top-level groupings (cloud, cybersecurity, …) |
| `Certification` | Exam product (slug, provider, duration, passingScore) |
| `Domain` | Official exam domains per cert (`slug`, `weightPercent`) |
| `Question` | MCQ; optional **`objectiveId`** for syllabus traceability |
| `QuestionOption` | A–D keys, `isCorrect` |
| `QuestionExplanation` | Body + `referenceLinks` JSON |
| `ExamAttempt` | User session; `timeLimitMinutes`, `questionCount`, score |
| `ExamQuestion` / `AttemptAnswer` | Junction + user answers |

**Important fields on `Question`:**

- `objectiveId` — maps to blueprint objective (e.g. `RA-1`)
- `tags` — e.g. `blueprint-seed`, `curated`, `reviewed`
- `isActive` — false = hidden from exams and counts

**Indexes:** `(certificationId, isActive)`, `(certificationId, domainId, difficulty)`, `(certificationId, objectiveId)`.

---

## 7. Question content system (500 × 16)

### 7.1 Philosophy

- Questions align to **official exam blueprints** (domains + objective IDs).
- Sources: public exam guides, vendor docs — **not** brain dumps or paid third-party PDFs.
- Production path: **CSV import** or small **curated TypeScript** modules (AWS ML pattern).
- Old **`generateQuestionBatch`** in `seed-data.ts` is **deprecated**; `pnpm db:seed:questions` only **validates counts**.

### 7.2 Blueprint registry

One JSON per cert: `packages/database/content/blueprints/<slug>.json`

Contains: `examCode`, `officialGuideUrl`, `lastReviewed`, `domains[]` (slug, name, weightPercent, objectives[]), `difficultyMix`, `questionsTarget: 500`, `referenceUrls[]`.

**Regenerate JSON files:**

```bash
node packages/database/content/build-blueprints.mjs
```

**Domains in DB** come from blueprints via `getDomainsForCert()` in `seed-data.ts` (reads JSON; fallback generic domains only if JSON missing).

### 7.3 Generating & importing the bank

```bash
# One-time / after blueprint changes
pnpm content:init                    # blueprints + CSV templates + progress YAML

pnpm db:generate-questions           # writes packages/database/content/generated/*.csv (500 each)

pnpm db:seed                         # categories, certs, domains, admin, plans
pnpm --filter @certprep/database sync-domains

pnpm db:cleanup-legacy               # remove generic domains + deactivate old auto-gen
pnpm db:import-content               # import generated/ + questions/ CSVs into Postgres

pnpm db:validate-bank                # report → content/reports/validation-report.md
pnpm db:seed:questions               # check all certs ≥ 500 (exit 1 if not)
```

**Curated AWS ML** (33 hand-written questions in `aws-ml-specialty-questions.ts`):

```bash
pnpm db:seed:aws-ml
```

### 7.4 CSV format (canonical)

```csv
certification_slug,domain_slug,objective_id,title,description,option_a,option_b,option_c,option_d,correct_option,difficulty,tags,explanation,reference_urls
```

- `tags` / `reference_urls`: pipe-separated (`aws-saa-c03|RA-1|reviewed`)
- `correct_option`: A, B, C, or D
- `difficulty`: EASY, MEDIUM, HARD

### 7.5 Admin import API

| Endpoint | Purpose |
|----------|---------|
| `POST /admin/questions/validate-csv` | Pre-flight; blueprint + duplicate checks |
| `POST /admin/questions/bulk-csv` | Import; skips duplicate titles |
| `GET /admin/questions/csv-template/:certSlug` | Download template |
| `GET /admin/questions/slug-cheat-sheet` | Cert/domain/objective IDs |
| `GET /admin/blueprints` | List cert slugs |
| `GET /admin/blueprints/:certSlug` | Full blueprint JSON |

UI: `apps/web/src/app/admin/import/page.tsx`

---

## 8. All 16 certifications

| Slug | Name | Provider |
|------|------|----------|
| `aws-saa-c03` | AWS Solutions Architect Associate | AWS |
| `aws-security-specialty` | AWS Security Specialty | AWS |
| `aws-ml-specialty` | AWS Machine Learning Specialty | AWS |
| `az-900` | Microsoft Azure Fundamentals | Microsoft |
| `sc-200` | Microsoft Security Operations Analyst | Microsoft |
| `google-cloud-associate` | Google Cloud Associate Cloud Engineer | Google |
| `cka` | Certified Kubernetes Administrator | CNCF |
| `ceh` | Certified Ethical Hacker | EC-Council |
| `security-plus` | CompTIA Security+ | CompTIA |
| `cissp` | CISSP | ISC2 |
| `oscp` | OSCP | Offensive Security |
| `ccna` | Cisco CCNA | Cisco |
| `network-plus` | CompTIA Network+ | CompTIA |
| `linux-plus` | CompTIA Linux+ | CompTIA |
| `pmp` | PMP | PMI |
| `itil-foundation` | ITIL 4 Foundation | AXELOS |

---

## 9. Key files to know

| Area | File |
|------|------|
| Cert list & domains | `packages/database/prisma/seed-data.ts` |
| Main DB seed | `packages/database/prisma/seed.ts` |
| Exam start logic | `apps/api/src/services/exam.service.ts` |
| Random pool | `apps/api/src/utils/question-pool.ts` |
| Recent Q exclusion | `apps/api/src/utils/recent-questions.ts` |
| Cert page UI | `apps/web/src/app/certifications/[slug]/page.tsx` |
| Customize modal | `apps/web/src/components/exam-customize-modal.tsx` |
| Exam results | `apps/web/src/components/exam-results.tsx` |
| Admin CSV | `apps/api/src/utils/csv-import.ts`, `blueprint-validator.ts` |
| CSV Zod schema | `packages/shared/src/schemas/admin.ts` |
| AWS ML curated | `packages/database/prisma/aws-ml-specialty-questions.ts` |

---

## 10. Environment variables

Copy from `.env.example` to `.env` and `apps/api/.env`. Web uses `apps/web/.env.local` for public URLs.

| Variable | Where | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | root, api, database | PostgreSQL connection |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | api | Auth tokens |
| `CLIENT_URL` | api | CORS origin (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | web | Browser → API |
| `GOOGLE_CLIENT_ID` / `SECRET` | api | Google OAuth |
| `ADMIN_PASSWORD` | seed | Admin user password |

---

## 11. Commands cheat sheet

```bash
# Dev
pnpm install
docker compose up -d
pnpm db:generate && cd packages/database && npx prisma db push && cd ../..
pnpm db:seed && pnpm db:import-content    # full question bank
pnpm dev                                  # or dev:api + dev:web in two terminals

# Tests
pnpm test:smoke                           # 16 certs × 500, exam overlap, 8k total
pnpm test:api                             # auth, admin, exam flow

# DB GUI
pnpm db:studio

# Production DB setup (run once on deploy)
pnpm db:seed
pnpm --filter @certprep/database sync-domains
pnpm db:cleanup-legacy
pnpm db:import-content
pnpm db:validate-bank
```

---

## 12. Deployment notes

**Full step-by-step:** see **`DEPLOY.md`** (Vercel + Render + Postgres).

| Component | Host | Notes |
|-----------|------|-------|
| Web | **Vercel** | Root directory: `apps/web`; use `API_PROXY_TARGET` + `NEXT_PUBLIC_API_URL=same-origin` |
| API | **Render** | `render.yaml` blueprint; auto-imports questions when `RUN_DB_IMPORT=true` |
| DB | **Render Postgres** | Created by blueprint |

**After deploy:** Set Render `CLIENT_URL` to your Vercel URL. Test `/health` on API and login on web.

---

## 13. Known issues & quirks

### 13.1 Hydration warning in Cursor browser

If you see React hydration errors mentioning `data-cursor-ref` on `navbar.tsx` line 123:

- **Not a production bug.** Cursor’s built-in browser injects `data-cursor-ref` for automation.
- SSR HTML does **not** contain those attributes.
- Test in normal Chrome/Edge to verify; users won’t see this.

### 13.2 Package name vs brand

- UI/branding: **MockCertify**
- npm packages: `@certprep/web`, `@certprep/api`, etc.

### 13.3 Prisma generate on Windows

If `prisma generate` fails with EPERM, stop the running API process first, then regenerate.

### 13.4 `generateQuestionBatch`

Still in `seed-data.ts` but marked `@deprecated`. Do not use for production content. Use blueprint CSV pipeline instead.

### 13.5 Question quality

`pnpm db:generate-questions` produces **syllabus-mapped** questions tagged `blueprint-seed`. For production quality, plan SME review and replace batches with hand-authored CSV (`tags` should include `reviewed`).

---

## 14. Work history (what we built)

Chronological summary for context when resuming:

1. **Platform v1** — Full monorepo: auth, exams, admin, community, analytics, leaderboards.
2. **Docker + seeding** — Local Postgres; initial 200 Q/cert auto-seed (later removed).
3. **Rebrand** — CertPrep → MockCertify (UI, emails, README); packages kept `@certprep/*`.
4. **Google OAuth** — Wired with dotenv fix in API config.
5. **Exam UX** — Customize & Start (question count + timer); improved results page; option shuffle; recent-question exclusion.
6. **AWS ML Specialty** — Real domains + ~33 curated questions in TS; dedicated seed script.
7. **500-question program** — Official blueprints for all 16 certs; 8k CSV bank; import/validate tooling; retired auto-filler; `objectiveId` on questions; admin validate-csv + templates.
8. **Loaded & tested** — 8,000 questions imported locally; smoke + API tests passing; cert pages show 500 questions.

---

## 15. Resuming work (checklist for AI or developer)

When picking this up again:

1. Read this file + `README.md`.
2. `docker compose up -d` → verify `DATABASE_URL`.
3. `pnpm db:seed:questions` — quick health check on question counts.
4. `pnpm test:smoke` with API running.
5. For content changes: edit blueprint JSON → `pnpm db:generate-questions` → `pnpm db:import-content` (skips duplicate titles).
6. For new cert: add to `seed-data.ts` `certifications[]`, add blueprint JSON, run `content:init`, seed, import.
7. Do **not** re-enable `generateQuestionBatch` in `seed-questions.ts` without explicit product approval.

---

## 16. Related docs

| File | Contents |
|------|----------|
| `README.md` | Quick start, deploy summary |
| `packages/database/content/CONTENT_README.md` | Content pipeline details |
| `packages/database/content/reports/validation-report.md` | Last QA run (generated) |

---

*End of handbook. Keep this file updated when making major architectural or content-pipeline changes.*
