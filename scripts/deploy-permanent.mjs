/**
 * Wire Vercel to permanent API (Fly or Render) and verify health.
 * Usage:
 *   node scripts/deploy-permanent.mjs https://mockcertify-api.fly.dev
 *   node scripts/deploy-permanent.mjs https://mockcertify-api.onrender.com
 */
import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const apiUrl = (process.argv[2] ?? "https://mockcertify-api.fly.dev").replace(/\/$/, "");

async function healthOk() {
  try {
    const res = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(60_000) });
    const data = await res.json();
    return res.ok && data?.status === "ok";
  } catch {
    return false;
  }
}

console.log(`Checking ${apiUrl}/health ...`);
if (!(await healthOk())) {
  console.error("API not healthy yet. Deploy Fly/Render first.");
  console.error("  Fly: add FLY_API_TOKEN to GitHub secrets, run workflow 'Deploy API (Fly.io + Neon)'");
  console.error("  Render: https://render.com/deploy?repo=https://github.com/YashvantHange/mockcertify");
  process.exit(1);
}

await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, ["scripts/set-vercel-production.mjs", apiUrl], {
    cwd: ROOT,
    stdio: "inherit",
  });
  child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
});

console.log("\nPermanent hosting active. Site works when your PC is off.");
console.log(`  Web: https://mockcertify-web.vercel.app`);
console.log(`  API: ${apiUrl}`);
