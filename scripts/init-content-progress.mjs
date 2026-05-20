/**
 * Creates progress tracking YAML for each certification content track.
 * Run: node scripts/init-content-progress.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLUEPRINTS_DIR = join(__dirname, "../packages/database/content/blueprints");
const PROGRESS_DIR = join(__dirname, "../packages/database/content/progress");

mkdirSync(PROGRESS_DIR, { recursive: true });

for (const file of readdirSync(BLUEPRINTS_DIR).filter((f) => f.endsWith(".json"))) {
  const bp = JSON.parse(readFileSync(join(BLUEPRINTS_DIR, file), "utf-8"));
  const lines = [
    `cert: ${bp.slug}`,
    `exam_code: ${bp.examCode}`,
    `target: ${bp.questionsTarget ?? 500}`,
    `owner: unassigned`,
    `status: in_progress`,
    `last_updated: ${new Date().toISOString().slice(0, 10)}`,
    "domains:",
  ];

  for (const d of bp.domains) {
    const target = Math.round(((bp.questionsTarget ?? 500) * d.weightPercent) / 100);
    lines.push(`  ${d.slug}: { target: ${target}, drafted: 0, reviewed: 0, imported: 0 }`);
  }

  writeFileSync(join(PROGRESS_DIR, `${bp.slug}.yaml`), lines.join("\n") + "\n");
}

console.log(`Progress files written to ${PROGRESS_DIR}`);
