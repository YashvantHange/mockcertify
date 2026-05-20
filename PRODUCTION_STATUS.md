# Production hosting (works when your PC is off)

## Architecture

| Component | Host | URL |
|-----------|------|-----|
| **Web** | Vercel | https://mockcertify-web.vercel.app |
| **Database** | Neon (cloud) | Project `mockcertify-prod` |
| **API** | Render (free) | https://mockcertify-api.onrender.com |

## One-time setup (about 15 minutes)

### Step 1 — Deploy API on Render

1. Open **[Deploy to Render](https://render.com/deploy?repo=https://github.com/YashvantHange/mockcertify)** and sign in with GitHub.
2. When asked for **`DATABASE_URL`**, get it from Neon:
   - [Neon Console](https://console.neon.tech/app/projects/mute-hat-03447381) → Connection string, or
   - Run: `npx neonctl connection-string main --project-id mute-hat-03447381`
3. Optional env vars on Render:
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (from Google Cloud)
   - `GOOGLE_CALLBACK_URL` = `https://mockcertify-api.onrender.com/api/v1/auth/google/callback`
4. Wait for deploy (~10–15 min first time).

### Step 2 — Connect Vercel to Render API

When `https://mockcertify-api.onrender.com/health` returns `{"status":"ok"}`:

```bash
node scripts/deploy-permanent.mjs https://mockcertify-api.onrender.com
```

## Test accounts

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@certprep.local` | `Admin123!@#` |
| New user | Sign up on the site | 8+ characters |

```bash
node scripts/test-auth-production.mjs
```

## Notes

- **Neon** holds all data in the cloud (no PC required after import).
- **Render free** tier sleeps after ~15 min idle; first request may take ~30s to wake.
- Fly.io was skipped (requires a credit card on your account).
