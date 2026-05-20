/**
 * Set production env vars on mockcertify-web and trigger redeploy.
 * Usage: node scripts/set-vercel-production.mjs https://mockcertify-api.onrender.com
 */
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const apiUrl = process.argv[2]?.replace(/\/$/, "");
if (!apiUrl) {
  console.error("Usage: node scripts/set-vercel-production.mjs <API_URL>");
  console.error("Example: node scripts/set-vercel-production.mjs https://mockcertify-api.onrender.com");
  process.exit(1);
}

const authPath = join(
  homedir(),
  "AppData",
  "Roaming",
  "xdg.data",
  "com.vercel.cli",
  "auth.json"
);
const { token } = JSON.parse(readFileSync(authPath, "utf8"));
const teamId = "team_KKhROmeOE0SchKWh3Mf2WVwH";
const projectId = "prj_aRS7Iz3WZilepeO2TTWSrzyw8l9y";
const appUrl = "https://mockcertify-web.vercel.app";

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function upsertEnv(key, value, target = ["production"]) {
  const list = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}`,
    { headers }
  ).then((r) => r.json());

  const existing = list.envs?.find((e) => e.key === key && e.target?.includes("production"));
  const body = {
    key,
    value,
    type: "plain",
    target,
  };

  if (existing) {
    const res = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/env/${existing.id}?teamId=${teamId}`,
      { method: "PATCH", headers, body: JSON.stringify(body) }
    );
    if (!res.ok) throw new Error(`PATCH ${key}: ${await res.text()}`);
    console.log(`Updated ${key}`);
  } else {
    const res = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}`,
      { method: "POST", headers, body: JSON.stringify(body) }
    );
    if (!res.ok) throw new Error(`POST ${key}: ${await res.text()}`);
    console.log(`Created ${key}`);
  }
}

await upsertEnv("NEXT_PUBLIC_API_URL", "same-origin");
await upsertEnv("API_PROXY_TARGET", apiUrl);
await upsertEnv("NEXT_PUBLIC_APP_URL", appUrl);

// Optional: enable Google button hint on static auth/config fallback
const googleId = process.env.GOOGLE_CLIENT_ID;
if (googleId) {
  await upsertEnv("GOOGLE_CLIENT_ID", googleId);
}

const deployRes = await fetch(
  `https://api.vercel.com/v13/deployments?teamId=${teamId}`,
  {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "mockcertify-web",
      project: projectId,
      target: "production",
      gitSource: {
        type: "github",
        org: "YashvantHange",
        repo: "mockcertify",
        ref: "master",
      },
    }),
  }
);
if (!deployRes.ok) {
  console.warn("Redeploy request:", await deployRes.text());
  console.log("Env vars set. Redeploy from Vercel dashboard if needed.");
} else {
  const d = await deployRes.json();
  console.log("Production redeploy triggered:", d.url ?? d.id);
}

console.log("\nDone. API proxy:", apiUrl);
console.log("Test: curl", `${appUrl}/api/v1/categories`);
