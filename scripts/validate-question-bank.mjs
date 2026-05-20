/**
 * Validates question bank against official blueprints.
 * Run: node scripts/validate-question-bank.mjs
 * Output: packages/database/content/reports/validation-report.md
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BLUEPRINTS_DIR = join(ROOT, "packages/database/content/blueprints");
const REPORT_DIR = join(ROOT, "packages/database/content/reports");

const TARGET = 500;
const WEIGHT_TOLERANCE = 2;
const DIFF_TOLERANCE = 5;

const prisma = new PrismaClient();

function titleSimilarity(a, b) {
  const na = a.toLowerCase().replace(/[^a-z0-9]/g, "");
  const nb = b.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (na === nb) return 1;
  const shorter = na.length < nb.length ? na : nb;
  const longer = na.length >= nb.length ? na : nb;
  return shorter.length / longer.length > 0.9 ? 0.95 : 0;
}

async function validateCert(bp) {
  const issues = [];
  const cert = await prisma.certification.findUnique({ where: { slug: bp.slug } });
  if (!cert) {
    issues.push("Certification not in database — run pnpm db:seed");
    return { slug: bp.slug, count: 0, issues };
  }

  const questions = await prisma.question.findMany({
    where: { certificationId: cert.id, isActive: true },
    include: { domain: true, explanation: true },
  });

  const count = questions.length;
  if (count < TARGET) {
    issues.push(`Count ${count} < target ${TARGET}`);
  }

  for (const d of bp.domains) {
    const domainQs = questions.filter((q) => q.domain.slug === d.slug);
    const actualPct = count > 0 ? (domainQs.length / count) * 100 : 0;
    const delta = Math.abs(actualPct - d.weightPercent);
    if (delta > WEIGHT_TOLERANCE && count >= 50) {
      issues.push(
        `Domain ${d.slug}: ${actualPct.toFixed(1)}% vs blueprint ${d.weightPercent}% (Δ${delta.toFixed(1)}%)`
      );
    }
  }

  const mix = bp.difficultyMix ?? { easy: 30, medium: 40, hard: 30 };
  for (const [diff, expected] of [
    ["EASY", mix.easy],
    ["MEDIUM", mix.medium],
    ["HARD", mix.hard],
  ]) {
    const actual = count > 0 ? (questions.filter((q) => q.difficulty === diff).length / count) * 100 : 0;
    if (Math.abs(actual - expected) > DIFF_TOLERANCE && count >= 50) {
      issues.push(`Difficulty ${diff}: ${actual.toFixed(1)}% vs expected ${expected}%`);
    }
  }

  const titles = questions.map((q) => q.title);
  const dupTitles = titles.filter((t, i) => titles.indexOf(t) !== i);
  if (dupTitles.length > 0) {
    issues.push(`Duplicate titles: ${[...new Set(dupTitles)].slice(0, 3).join(", ")}`);
  }

  for (let i = 0; i < Math.min(questions.length, 200); i++) {
    for (let j = i + 1; j < Math.min(questions.length, 200); j++) {
      if (titleSimilarity(questions[i].title, questions[j].title) >= 0.95) {
        issues.push(`Near-duplicate titles: "${questions[i].title}" / "${questions[j].title}"`);
        break;
      }
    }
  }

  const noExplanation = questions.filter((q) => !q.explanation?.body?.trim()).length;
  if (noExplanation > 0) issues.push(`${noExplanation} questions missing explanation`);

  const noRefs = questions.filter(
    (q) => !q.explanation?.referenceLinks || (Array.isArray(q.explanation.referenceLinks) && q.explanation.referenceLinks.length === 0)
  ).length;
  if (noRefs > count * 0.1) issues.push(`${noRefs} questions missing reference URLs`);

  const noObjective = questions.filter((q) => !q.objectiveId).length;
  if (noObjective > count * 0.05) {
    issues.push(`${noObjective} questions without objective_id`);
  }

  return { slug: bp.slug, count, issues };
}

async function main() {
  mkdirSync(REPORT_DIR, { recursive: true });
  const files = readdirSync(BLUEPRINTS_DIR).filter((f) => f.endsWith(".json"));
  const results = [];

  for (const file of files) {
    const bp = JSON.parse(readFileSync(join(BLUEPRINTS_DIR, file), "utf-8"));
    results.push(await validateCert(bp));
  }

  const lines = [
    "# Question Bank Validation Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "| Certification | Active | Status | Issues |",
    "|---|---:|---|---|",
  ];

  let failCount = 0;
  for (const r of results) {
    const status = r.count >= TARGET && r.issues.length === 0 ? "PASS" : r.count >= TARGET ? "WARN" : "FAIL";
    if (status !== "PASS") failCount++;
    const issueStr = r.issues.length ? r.issues.slice(0, 2).join("; ") : "—";
    lines.push(`| ${r.slug} | ${r.count} | ${status} | ${issueStr} |`);
  }

  lines.push("", "## Details", "");
  for (const r of results) {
    if (r.issues.length === 0) continue;
    lines.push(`### ${r.slug}`, "");
    r.issues.forEach((i) => lines.push(`- ${i}`));
    lines.push("");
  }

  const reportPath = join(REPORT_DIR, "validation-report.md");
  writeFileSync(reportPath, lines.join("\n"));
  console.log(`Report written to ${reportPath}`);
  console.log(`Certs passing target (${TARGET}+): ${results.filter((r) => r.count >= TARGET).length}/${results.length}`);

  if (failCount > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
