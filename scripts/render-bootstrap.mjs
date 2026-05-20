/**
 * One-time production bootstrap: seed + import questions.
 * Run on Render shell or locally with production DATABASE_URL.
 * Set RUN_DB_IMPORT=true to execute on API startup (see apps/api/src/index.ts).
 */
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const prisma = new PrismaClient();

async function alreadyBootstrapped() {
  const count = await prisma.question.count({ where: { isActive: true } });
  return count >= 1000;
}

async function main() {
  console.log("MockCertify production bootstrap...");
  if (await alreadyBootstrapped()) {
    console.log("Database already has questions — skip bootstrap.");
    return;
  }

  execSync("pnpm --filter @certprep/database seed", { cwd: ROOT, stdio: "inherit" });
  execSync("pnpm --filter @certprep/database sync-domains", { cwd: ROOT, stdio: "inherit" });
  execSync("node scripts/import-content.mjs", { cwd: ROOT, stdio: "inherit", env: process.env });
  execSync("pnpm --filter @certprep/database seed:aws-ml", { cwd: ROOT, stdio: "inherit" });

  const total = await prisma.question.count({ where: { isActive: true } });
  console.log(`Bootstrap complete. Active questions: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
