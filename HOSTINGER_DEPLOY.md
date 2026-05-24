# Host MockCertify on mockcertify.com (Hostinger)

You need a **Hostinger VPS** (KVM) plan — basic shared hosting cannot run Next.js + Node API.

Keep using **Neon** for PostgreSQL (already set up) or Hostinger’s managed Postgres if you add it later.

---

## Step 1 — Point your domain to the VPS

In **Hostinger hPanel** → **Domains** → **mockcertify.com** → **DNS / Nameservers**:

| Type | Name | Value |
|------|------|--------|
| **A** | `@` | Your VPS public IP |
| **A** | `www` | Same VPS IP |

Remove conflicting A/CNAME records. Wait 5–30 minutes for DNS.

---

## Step 2 — Open the VPS and install Docker (recommended)

SSH into the VPS (Hostinger → VPS → SSH access):

```bash
ssh root@YOUR_VPS_IP
```

Install Docker:

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
```

Clone the project:

```bash
cd /opt
git clone https://github.com/YashvantHange/mockcertify.git
cd mockcertify
```

Create production env:

```bash
cp deploy/hostinger/.env.example deploy/hostinger/.env
nano deploy/hostinger/.env
```

Fill in at minimum:

- `DATABASE_URL` — Neon connection string (from Neon dashboard)
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — run `openssl rand -hex 32` twice
- `ADMIN_PASSWORD` — your admin password
- `APP_URL=https://mockcertify.com`
- `CLIENT_URL=https://mockcertify.com`
- `RUN_DB_IMPORT=false` (DB already seeded on Render/Neon)

Build and start:

```bash
docker compose -f deploy/hostinger/docker-compose.yml --env-file deploy/hostinger/.env up -d --build
```

HTTPS:

```bash
apt install -y certbot
docker compose -f deploy/hostinger/docker-compose.yml stop nginx
certbot certonly --standalone -d mockcertify.com -d www.mockcertify.com
# Then add SSL server block to deploy/hostinger/nginx.conf and restart nginx container
```

---

## Step 2 (alternative) — PM2 install script (no Docker)

On Ubuntu VPS after cloning the repo:

```bash
chmod +x deploy/hostinger/install.sh
sudo DOMAIN=mockcertify.com bash deploy/hostinger/install.sh
```

Ensure `deploy/hostinger/.env` exists first (copy from `.env.example`).

---

## Step 3 — Verify

```bash
curl https://mockcertify.com/api/v1/categories
curl https://mockcertify.com/health   # via Next proxy → API
```

From your PC:

```powershell
cd c:\Users\Yashvant\Desktop\Website
node scripts/test-auth-production.mjs https://mockcertify.com
node scripts/smoke-production.mjs
```

Set `API_URL` for smoke test:

```powershell
$env:API_URL="https://mockcertify.com/api/v1"
node scripts/smoke-production.mjs
```

---

## Architecture on Hostinger VPS

```
Browser → mockcertify.com (Nginx :443)
           → Next.js :3000
           → /api/v1/* proxied to Express :4000
           → Neon PostgreSQL (cloud)
```

Same-origin cookies: `NEXT_PUBLIC_API_URL=same-origin`, `API_PROXY_TARGET=http://api:4000` (Docker) or `http://127.0.0.1:4000` (PM2).

---

## Optional: domain only on Hostinger, app on Vercel + Render

If you prefer not to run a VPS:

1. Hostinger DNS: `CNAME` `@` and `www` → `cname.vercel-dns.com` (Vercel will show exact target)
2. Vercel → Project → Domains → add `mockcertify.com`
3. Render API env: `CLIENT_URL=https://mockcertify.com`
4. Vercel env: `NEXT_PUBLIC_APP_URL=https://mockcertify.com`, `API_PROXY_TARGET=https://mockcertify-api.onrender.com`

This uses Hostinger only for DNS, not server hosting.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 502 Bad Gateway | `pm2 logs` or `docker compose logs api web` |
| Login fails | `CLIENT_URL` must match `https://mockcertify.com` exactly |
| Build OOM on small VPS | Use 4 GB RAM VPS or build locally and copy `.next` |
| SSL | Run certbot after port 80 points to VPS |

---

## Update after code changes

```bash
cd /opt/mockcertify && git pull
docker compose -f deploy/hostinger/docker-compose.yml --env-file deploy/hostinger/.env up -d --build
```

Or with PM2: pull, rebuild filters, `pm2 restart all`.
