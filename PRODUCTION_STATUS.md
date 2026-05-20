# Production status (auto-wired)

**Site:** https://mockcertify-web.vercel.app

## What is live now

| Feature | Status |
|---------|--------|
| Categories & cert pages | Working (real DB via API tunnel) |
| Email/password login | Working |
| Google sign-in button | Visible — needs Google Console redirect URI (see below) |
| Exams, dashboard, leaderboard | Working while API tunnel is running |

## Temporary API bridge

The API is exposed via a **Cloudflare tunnel** from your PC to Vercel:

- Tunnel URL is set as `API_PROXY_TARGET` on Vercel
- **Keep running on this machine:** Docker Postgres, API (`pnpm --filter @certprep/api dev`), and the cloudflared process

When you deploy **Render** (permanent), run:

```bash
node scripts/set-vercel-production.mjs https://mockcertify-api.onrender.com
```

## Google OAuth — one step for you

In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), edit your OAuth client and add:

**Authorized redirect URI:**
```
https://tennessee-abu-filtering-florist.trycloudflare.com/api/v1/auth/google/callback
```

**Authorized JavaScript origin:**
```
https://mockcertify-web.vercel.app
```

(After Render deploy, change the redirect URI to `https://mockcertify-api.onrender.com/api/v1/auth/google/callback`.)

## Render (permanent hosting)

Browser tab: [Deploy blueprint](https://dashboard.render.com/blueprint/new?repo=https://github.com/YashvantHange/mockcertify)

Sign in with GitHub → approve blueprint. `CLIENT_URL` is preset in `render.yaml`.

## Admin login

- Email: `admin@certprep.local`
- Password: `Admin123!@#` (or your local `ADMIN_PASSWORD`)
