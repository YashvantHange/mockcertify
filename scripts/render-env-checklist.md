# Render env vars (set in dashboard after blueprint deploy)

| Key | Value |
|-----|--------|
| `CLIENT_URL` | `https://mockcertify-web.vercel.app` (preset in render.yaml) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `https://mockcertify-api.onrender.com/api/v1/auth/google/callback` |

Google Cloud → Credentials → OAuth client:
- **Authorized redirect URI:** same as `GOOGLE_CALLBACK_URL`
- **Authorized JavaScript origin:** `https://mockcertify-web.vercel.app`

After API is healthy, run:
```bash
node scripts/set-vercel-production.mjs https://mockcertify-api.onrender.com
```
