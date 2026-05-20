# Deploy MockCertify (live on the internet)

Three pieces: **PostgreSQL** (Render), **API** (Render), **Web** (Vercel).

Estimated time: ~20 minutes (first time).

---

## Prerequisites

1. [GitHub](https://github.com) account  
2. [Render](https://render.com) account (free)  
3. [Vercel](https://vercel.com) account (free)  
4. Push this project to a GitHub repository  

---

## Step 1 — Push code to GitHub

```powershell
cd c:\Users\Yashvant\Desktop\Website
git init
git add .
git commit -m "MockCertify platform ready for deploy"
gh repo create mockcertify --public --source=. --push
```

(Or create a repo in GitHub UI and `git remote add origin` + `git push`.)

---

## Step 2 — Deploy API + database on Render

1. Open https://dashboard.render.com  
2. **New** → **Blueprint**  
3. Connect your GitHub repo  
4. Render reads `render.yaml` and creates:
   - `mockcertify-db` (PostgreSQL)
   - `mockcertify-api` (Node web service)
5. When prompted, set **manual env vars**:
   - `CLIENT_URL` = your Vercel URL (set after Step 3, e.g. `https://mockcertify.vercel.app`)
   - `ADMIN_PASSWORD` = strong password for `admin@certprep.local`
6. Wait for deploy (~10–15 min first time; imports 8k questions if `RUN_DB_IMPORT=true`).
7. Copy the API URL, e.g. `https://mockcertify-api.onrender.com`  
8. Test: open `https://YOUR-API.onrender.com/health` → `{"status":"ok"}`

**Note:** Free Render services spin down after inactivity; first request may take ~30s.

---

## Step 3 — Deploy web on Vercel

### Option A — Vercel Dashboard (recommended)

1. https://vercel.com/new → Import Git repository  
2. **Root Directory:** `apps/web`  
3. Framework: **Next.js** (auto-detected)  
4. **Environment variables:**

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `same-origin` |
| `API_PROXY_TARGET` | `https://YOUR-API.onrender.com` |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-PROJECT.vercel.app` |

5. Deploy  
6. Go back to Render → set `CLIENT_URL` to your Vercel URL → **Manual Deploy** on API  

### Option B — Vercel CLI

```powershell
npm i -g vercel
cd apps\web
vercel login
vercel --prod
```

Set env vars in Vercel project settings as in the table above.

---

## Step 4 — Verify production

```powershell
# Replace URLs
$API="https://mockcertify-api.onrender.com"
$WEB="https://your-app.vercel.app"

Invoke-WebRequest "$API/health"
```

Open `$WEB` in Chrome:

- Home and certification pages load  
- A cert shows **500 questions**  
- Log in: `admin@certprep.local` / your `ADMIN_PASSWORD`  
- Start a practice exam  

---

## Architecture (production)

```
User → Vercel (Next.js)
         ↳ /api/v1/* rewritten to → Render (Express API) → Render Postgres
```

Cookies work via **same-origin** proxy (`API_PROXY_TARGET` + `NEXT_PUBLIC_API_URL=same-origin`).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API 502 / slow cold start | Normal on Render free tier; wait 30s and retry |
| Login fails | Set `CLIENT_URL` on API = exact Vercel URL (no trailing slash) |
| 0 questions | Render shell: `node scripts/render-bootstrap.mjs` |
| CORS errors | Use `same-origin` + `API_PROXY_TARGET`, not split cookies |
| Build fails on Vercel | Root = `apps/web`; install runs from monorepo root via `vercel.json` |

---

## Optional: Google OAuth

On Render API env:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL` = `https://YOUR-API.onrender.com/api/v1/auth/google/callback`

On Vercel, keep using proxy; Google redirect still hits API URL directly.

---

## Re-import questions

```bash
# Render Shell or local with production DATABASE_URL
node scripts/import-content.mjs
```

---

See also `PROJECT_HANDBOOK.md` for full system documentation.
