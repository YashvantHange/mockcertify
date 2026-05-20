/**
 * Validates question bank counts per certification (no auto-generation).
 * Run: pnpm db:seed:questions
 *
 * To import syllabus-aligned questions:
 *   node scripts/generate-blueprint-questions.mjs
 *   pnpm db:import-content
 */
import { PrismaClient } from "@prisma/client";
import { certifications, QUESTIONS_PER_CERTIFICATION } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log(
    `Question bank validation (target: ${QUESTIONS_PER_CERTIFICATION} per cert)\n`
  );
  console.log(
    "Auto-generation is disabled. Import reviewed questions via CSV or pnpm db:import-content.\n"
  );

  let belowTarget = 0;

  for (const cert of certifications) {
    const certification = await prisma.certification.findUnique({
      where: { slug: cert.slug },
    });

    if (!certification) {
      console.warn(`  Skip ${cert.slug}: certification not found (run pnpm db:seed first)`);
      continue;
    }

    const active = await prisma.question.count({
      where: { certificationId: certification.id, isActive: true },
    });

    const withObjective = await prisma.question.count({
      where: {
        certificationId: certification.id,
        isActive: true,
        objectiveId: { not: null },
      },
    });

    const status = active >= QUESTIONS_PER_CERTIFICATION ? "OK" : "BELOW TARGET";
    if (active < QUESTIONS_PER_CERTIFICATION) belowTarget++;

    console.log(
      `  ${cert.slug}: ${active} active (${withObjective} with objective_id) — ${status}`
    );
  }

  const totalInDb = await prisma.question.count({ where: { isActive: true } });
  console.log(`\nTotal active questions: ${totalInDb}`);

  if (belowTarget > 0) {
    console.log(
      `\n${belowTarget} certification(s) below ${QUESTIONS_PER_CERTIFICATION}. Run:\n` +
        `  node scripts/generate-blueprint-questions.mjs\n` +
        `  pnpm db:import-content`
    );
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
