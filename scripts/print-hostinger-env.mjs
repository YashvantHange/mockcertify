/**
 * Print env vars for deploy/hostinger/.env (fill DATABASE_URL and secrets locally).
 * Usage: node scripts/print-hostinger-env.mjs [https://mockcertify.com]
 */
import { randomBytes } from "crypto";

const appUrl = (process.argv[2] ?? "https://mockcertify.com").replace(/\/$/, "");
const domain = new URL(appUrl).hostname;

console.log(`# Paste into deploy/hostinger/.env on your Hostinger VPS
APP_URL=${appUrl}
DOMAIN=${domain}
CLIENT_URL=${appUrl}
ALLOWED_ORIGINS=${appUrl},https://www.${domain}
NEXT_PUBLIC_APP_URL=${appUrl}

DATABASE_URL=<your-neon-connection-string>
JWT_ACCESS_SECRET=${randomBytes(32).toString("hex")}
JWT_REFRESH_SECRET=${randomBytes(32).toString("hex")}
ADMIN_PASSWORD=Admin123!@#
RUN_DB_IMPORT=false

GOOGLE_OAUTH_ENABLED=false
GOOGLE_CALLBACK_URL=${appUrl}/api/v1/auth/google/callback
`);
