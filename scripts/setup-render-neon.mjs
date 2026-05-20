/**
 * Print Neon DATABASE_URL and Render deploy steps (for manual paste in Render dashboard).
 */
import { execSync } from "child_process";

let url = process.env.DATABASE_URL;
if (!url) {
  try {
    url = execSync(
      "npx neonctl connection-string main --project-id mute-hat-03447381",
      { encoding: "utf8" }
    )
      .trim()
      .split("\n")
      .pop()
      ?.trim();
  } catch {
    console.error("Run: npx neonctl connection-string main --project-id mute-hat-03447381");
    process.exit(1);
  }
}

console.log(`
=== Permanent hosting (PC can be off) ===

Neon database: mockcertify-prod (project mute-hat-03447381)

1) Deploy API on Render (free):
   https://render.com/deploy?repo=https://github.com/YashvantHange/mockcertify

2) When Render asks for DATABASE_URL, paste this value:
   (also saved in GitHub repo secret DATABASE_URL)

3) Set these optional env vars on Render:
   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
   GOOGLE_CALLBACK_URL=https://mockcertify-api.onrender.com/api/v1/auth/google/callback

4) After deploy (~15 min), run:
   node scripts/deploy-permanent.mjs https://mockcertify-api.onrender.com

DATABASE_URL length: ${url.length} chars
`);
