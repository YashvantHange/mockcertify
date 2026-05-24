#!/usr/bin/env bash
# MockCertify — one-time setup on Hostinger VPS (Ubuntu 22.04+).
# Run as root or with sudo on a fresh VPS after cloning the repo.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="${REPO_ROOT}/deploy/hostinger/.env"
DOMAIN="${DOMAIN:-mockcertify.com}"

echo "==> MockCertify Hostinger install (repo: $REPO_ROOT)"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Copy deploy/hostinger/.env.example to deploy/hostinger/.env and fill in DATABASE_URL, secrets, APP_URL."
  exit 1
fi

# shellcheck disable=SC1090
set -a && source "$ENV_FILE" && set +a

export APP_URL="${APP_URL:-https://mockcertify.com}"
export CLIENT_URL="${CLIENT_URL:-$APP_URL}"

echo "==> Installing system packages..."
apt-get update -qq
apt-get install -y -qq curl git nginx certbot python3-certbot-nginx

if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable
  corepack prepare pnpm@9.15.0 --activate
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

echo "==> Building application..."
cd "$REPO_ROOT"
pnpm install --prod=false
pnpm db:generate
pnpm --filter @certprep/shared build
pnpm --filter @certprep/database build
pnpm --filter @certprep/api build
HOSTINGER_BUILD=1 NEXT_PUBLIC_APP_URL="$APP_URL" NEXT_PUBLIC_API_URL=same-origin API_PROXY_TARGET=http://127.0.0.1:4000 \
  pnpm --filter @certprep/web build

echo "==> Starting PM2 processes..."
pm2 delete mockcertify-api mockcertify-web 2>/dev/null || true
cd "$REPO_ROOT"
set -a && source "$ENV_FILE" && set +a
export NODE_ENV=production
export PORT=4000
export NEXT_PUBLIC_API_URL=same-origin
export API_PROXY_TARGET=http://127.0.0.1:4000
export NEXT_PUBLIC_APP_URL="$APP_URL"
export HOSTNAME=0.0.0.0

pm2 start apps/api/dist/index.js --name mockcertify-api --cwd "$REPO_ROOT"
STANDALONE="$REPO_ROOT/apps/web/.next/standalone"
PORT=3000 HOSTNAME=0.0.0.0 NEXT_PUBLIC_API_URL=same-origin API_PROXY_TARGET=http://127.0.0.1:4000 \
  NEXT_PUBLIC_APP_URL="$APP_URL" \
  pm2 start apps/web/server.js --name mockcertify-web --cwd "$STANDALONE"
pm2 save
pm2 startup systemd -u "${SUDO_USER:-root}" --hp "${HOME}" 2>/dev/null || pm2 startup

echo "==> Configuring Nginx..."
cat > /etc/nginx/sites-available/mockcertify <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    client_max_body_size 2m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX

ln -sf /etc/nginx/sites-available/mockcertify /etc/nginx/sites-enabled/mockcertify
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> HTTPS (Let's Encrypt)..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@${DOMAIN}" || true

echo ""
echo "Done. Open ${APP_URL}"
echo "Admin: admin@certprep.local / (your ADMIN_PASSWORD from .env)"
echo "PM2: pm2 status | pm2 logs mockcertify-api"
