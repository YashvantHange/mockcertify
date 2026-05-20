# MockCertify — Certification Exam Practice Platform

Full-stack monorepo for IT certification practice exams (AWS, Azure, Security+, CISSP, CCNA, and 16+ certs).

**GitHub:** https://github.com/YashvantHange/mockcertify  
**Go live:** follow **[DEPLOY.md](./DEPLOY.md)** (Vercel + Render, ~15 minutes)

## Stack

- **Frontend:** Next.js 15, React, Tailwind CSS, Framer Motion, Recharts
- **Backend:** Express.js, JWT + Google OAuth
- **Database:** PostgreSQL + Prisma
- **Hosting:** Vercel (web) + Render/EC2 (API)

## Quick start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local Postgres)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment

```bash
cp .env.example .env
cp .env.example apps/api/.env
```

Edit `DATABASE_URL` and JWT secrets.

### 3. Start Postgres

```bash
docker compose up -d
```

### 4. Database migrate & seed

```bash
pnpm db:generate
# With Postgres running (docker compose up -d):
pnpm db:migrate
# Or push schema without migration history:
cd packages/database && npx prisma db push
cd ../.. && pnpm db:seed
```

Default admin: `admin@certprep.local` / `Admin123!@#` (override with `ADMIN_PASSWORD`).

### 5. Run dev servers

```bash
# Terminal 1 — API (port 4000)
pnpm dev:api

# Terminal 2 — Web (port 3000)
pnpm dev:web
```

Open http://localhost:3000

## Project structure

```
apps/web/          Next.js frontend
apps/api/          Express REST API
packages/database/ Prisma schema + seed
packages/shared/   Zod validation schemas
```

## API endpoints

Base URL: `http://localhost:4000/api/v1`

| Group | Examples |
|-------|----------|
| Auth | `POST /auth/register`, `/auth/login`, `GET /auth/google` |
| Exams | `POST /exams/start`, `PATCH /exams/:id/answer`, `POST /exams/:id/submit` |
| Analytics | `GET /analytics/dashboard` |
| Admin | `POST /admin/questions/bulk-csv`, `POST /admin/questions/validate-csv` |

## Question bank (500 per certification)

Production questions are **syllabus-aligned originals** imported via CSV — not auto-generated template filler.

```bash
pnpm content:init              # blueprints, CSV templates, progress YAML
pnpm --filter @certprep/database sync-domains
pnpm db:generate-questions     # 500 MCQs per cert from official blueprints
pnpm db:import-content         # load into PostgreSQL
pnpm db:validate-bank          # QA report
pnpm db:cleanup-legacy         # deactivate old auto-generated questions
```

See `packages/database/content/CONTENT_README.md` for the full content pipeline.

## Deployment

### Vercel (frontend)

- Root directory: `apps/web`
- Build: `cd ../.. && pnpm install && pnpm --filter @certprep/web build`
- Env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`

### Render (API)

- Build: `pnpm install && pnpm db:generate && pnpm --filter @certprep/api build`
- Start: `node apps/api/dist/index.js`
- Add PostgreSQL and set `DATABASE_URL`, `CLIENT_URL`, JWT secrets

### Migrations (production)

```bash
pnpm --filter @certprep/database migrate:deploy
```

## Features

- Timed, practice, and review exam modes
- Auto-save answers, flag questions, explanations
- Dashboard analytics, weak areas, streaks
- Leaderboards, community discussions, bookmarks, notes
- Admin panel with CSV validate/import and blueprint templates
- 500-question pools per certification (official blueprint–driven)
- Dark mode, SEO (sitemap, JSON-LD)

## License

MIT
