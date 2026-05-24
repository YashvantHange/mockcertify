/**
 * Update Render mockcertify-api env vars via Render API.
 * Usage: RENDER_API_KEY=rnd_xxx node scripts/set-render-production.mjs
 */
const apiKey = process.env.RENDER_API_KEY;
if (!apiKey) {
  console.error("Set RENDER_API_KEY (Render Dashboard → Account → API Keys)");
  process.exit(1);
}

const serviceName = "mockcertify-api";
const appUrl = "https://mockcertify.com";
const apiUrl = "https://mockcertify-api.onrender.com";

const googleId = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!googleId || !googleSecret) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment or .env");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
};

const envUpdates = {
  CLIENT_URL: appUrl,
  ALLOWED_ORIGINS: `${appUrl},https://www.mockcertify.com,https://mockcertify-web.vercel.app`,
  GOOGLE_CLIENT_ID: googleId,
  GOOGLE_CLIENT_SECRET: googleSecret,
  GOOGLE_OAUTH_ENABLED: "true",
  GOOGLE_CALLBACK_URL: `${appUrl}/api/v1/auth/google/callback`,
};

const services = await fetch("https://api.render.com/v1/services?limit=100", { headers }).then((r) =>
  r.json()
);
const service = services.find?.((s) => s.service?.name === serviceName)?.service
  ?? services.find?.((s) => s.name === serviceName);
if (!service?.id) {
  console.error(`Service ${serviceName} not found`);
  process.exit(1);
}

const serviceId = service.id;
console.log(`Updating ${serviceName} (${serviceId})...`);

for (const [key, value] of Object.entries(envUpdates)) {
  const list = await fetch(`https://api.render.com/v1/services/${serviceId}/env-vars`, { headers }).then((r) =>
    r.json()
  );
  const existing = list.find?.((e) => e.envVar?.key === key)?.envVar ?? list.find?.((e) => e.key === key);

  if (existing?.id) {
    const res = await fetch(`https://api.render.com/v1/services/${serviceId}/env-vars/${existing.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ value }),
    });
    if (!res.ok) throw new Error(`PUT ${key}: ${await res.text()}`);
    console.log(`Updated ${key}`);
  } else {
    const res = await fetch(`https://api.render.com/v1/services/${serviceId}/env-vars`, {
      method: "POST",
      headers,
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) throw new Error(`POST ${key}: ${await res.text()}`);
    console.log(`Created ${key}`);
  }
}

const deployRes = await fetch(`https://api.render.com/v1/services/${serviceId}/deploys`, {
  method: "POST",
  headers,
  body: JSON.stringify({ clearCache: "do_not_clear" }),
});
if (!deployRes.ok) {
  console.warn("Deploy trigger:", await deployRes.text());
} else {
  const d = await deployRes.json();
  console.log("Render redeploy triggered:", d.deploy?.id ?? d.id);
}

console.log("\nDone. Google callback:", envUpdates.GOOGLE_CALLBACK_URL);
