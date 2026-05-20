/**
 * Poll Render API health, then wire Vercel proxy env vars and redeploy.
 * Usage: node scripts/wait-and-wire-production.mjs [API_URL]
 * Default API_URL: https://mockcertify-api.onrender.com
 */
import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const apiUrl = (process.argv[2] ?? "https://mockcertify-api.onrender.com").replace(/\/$/, "");
const healthUrl = `${apiUrl}/health`;
const maxAttempts = 120;
const intervalMs = 15_000;

async function healthOk() {
  try {
    const res = await fetch(healthUrl, { signal: AbortSignal.timeout(90_000) });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === "ok";
  } catch {
    return false;
  }
}

console.log(`Waiting for API at ${healthUrl} (up to ${(maxAttempts * intervalMs) / 60000} min)...`);

for (let i = 1; i <= maxAttempts; i++) {
  if (await healthOk()) {
    console.log(`API healthy after attempt ${i}.`);
    const child = spawn(process.execPath, ["scripts/set-vercel-production.mjs", apiUrl], {
      stdio: "inherit",
      cwd: ROOT,
    });
    child.on("exit", (code) => process.exit(code ?? 0));
    return;
  }
  console.log(`[${i}/${maxAttempts}] not ready yet...`);
  await new Promise((r) => setTimeout(r, intervalMs));
}

console.error("API did not become healthy. Check Render dashboard deploy logs.");
process.exit(1);
