/**
 * Import generated or hand-authored CSV question banks into PostgreSQL.
 * Run: pnpm db:import-content
 */
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const GENERATED_DIR = join(ROOT, "packages/database/content/generated");
const CUSTOM_DIR = join(ROOT, "packages/database/content/questions");

const prisma = new PrismaClient();

async function importRow(row, rowNum, stats) {
  const slug = row.certification_slug?.trim();
  const domainSlug = row.domain_slug?.trim();
  if (!slug || !domainSlug || !row.title?.trim()) {
    stats.errors.push({ file: stats.file, row: rowNum, error: "Missing required fields" });
    return;
  }

  const cert = await prisma.certification.findUnique({ where: { slug } });
  if (!cert) {
    stats.errors.push({ file: stats.file, row: rowNum, error: `Certification ${slug} not found` });
    return;
  }

  const domain = await prisma.domain.findUnique({
    where: { certificationId_slug: { certificationId: cert.id, slug: domainSlug } },
  });
  if (!domain) {
    stats.errors.push({ file: stats.file, row: rowNum, error: `Domain ${domainSlug} not found` });
    return;
  }

  const title = row.title.trim();
  const existing = await prisma.question.findFirst({
    where: { certificationId: cert.id, title },
  });
  if (existing) {
    stats.skipped++;
    return;
  }

  const tags = row.tags
    ? row.tags.split("|").map((t) => t.trim()).filter(Boolean)
    : [];
  const refs = row.reference_urls
    ? row.reference_urls.split("|").map((u) => u.trim()).filter(Boolean)
    : [];
  const objectiveId = row.objective_id?.trim() || null;
  if (objectiveId && !tags.includes(objectiveId)) tags.push(objectiveId);

  const correct = (row.correct_option ?? "A").toUpperCase();

  await prisma.question.create({
    data: {
      certificationId: cert.id,
      domainId: domain.id,
      objectiveId,
      title,
      description: row.description?.trim() ?? "",
      difficulty: row.difficulty,
      tags,
      options: {
        create: [
          { key: "A", text: row.option_a, isCorrect: correct === "A" },
          { key: "B", text: row.option_b, isCorrect: correct === "B" },
          { key: "C", text: row.option_c, isCorrect: correct === "C" },
          { key: "D", text: row.option_d, isCorrect: correct === "D" },
        ],
      },
      explanation: {
        create: { body: row.explanation, referenceLinks: refs },
      },
    },
  });
  stats.imported++;
}

async function importFile(filePath, stats) {
  stats.file = filePath;
  const content = readFileSync(filePath, "utf-8");
  const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });
  let rowNum = 2;
  for (const row of records) {
    try {
      await importRow(row, rowNum, stats);
    } catch (e) {
      stats.errors.push({ file: filePath, row: rowNum, error: e.message });
    }
    rowNum++;
  }
}

async function main() {
  const dirs = [GENERATED_DIR, CUSTOM_DIR].filter((d) => existsSync(d));
  if (dirs.length === 0) {
    console.error("No content directories found. Run: node scripts/generate-blueprint-questions.mjs");
    process.exit(1);
  }

  const stats = { imported: 0, skipped: 0, errors: [], file: "" };
  const files = [];

  for (const dir of dirs) {
    for (const f of readdirSync(dir)) {
      if (f.endsWith(".csv")) files.push(join(dir, f));
    }
  }

  files.sort();
  console.log(`Importing ${files.length} CSV file(s)...\n`);

  for (const f of files) {
    const before = stats.imported;
    await importFile(f, stats);
    console.log(`  ${f.split(/[/\\]/).pop()}: +${stats.imported - before} imported`);
  }

  console.log(`\nDone. Imported: ${stats.imported}, skipped (duplicate title): ${stats.skipped}`);
  if (stats.errors.length > 0) {
    console.log(`Errors: ${stats.errors.length}`);
    stats.errors.slice(0, 10).forEach((e) => console.log(`  ${e.file} row ${e.row}: ${e.error}`));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
