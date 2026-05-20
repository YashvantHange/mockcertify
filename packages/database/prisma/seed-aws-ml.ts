/**
 * Seed AWS Machine Learning Specialty: official domains + curated questions only.
 * Run: pnpm db:seed:aws-ml  (requires pnpm db:seed first)
 */
import { PrismaClient } from "@prisma/client";
import { getDomainsForCert } from "./seed-data";
import { awsMlSpecialtyQuestions, awsMlReferenceLinks } from "./aws-ml-specialty-questions";

const CERT_SLUG = "aws-ml-specialty";
const prisma = new PrismaClient();

async function main() {
  const certification = await prisma.certification.findUnique({
    where: { slug: CERT_SLUG },
  });

  if (!certification) {
    console.error("Certification not found. Run: pnpm db:seed");
    process.exit(1);
  }

  console.log("Setting up AWS ML Specialty domains...");
  const blueprint = getDomainsForCert(CERT_SLUG);
  const mlsSlugs = new Set(blueprint.map((d) => d.slug));
  const domainMap: Record<string, string> = {};

  const legacyDomains = await prisma.domain.findMany({
    where: { certificationId: certification.id, slug: { notIn: [...mlsSlugs] } },
  });
  if (legacyDomains.length > 0) {
    const legacyIds = legacyDomains.map((d) => d.id);
    const removed = await prisma.question.deleteMany({
      where: { certificationId: certification.id, domainId: { in: legacyIds } },
    });
    await prisma.domain.deleteMany({ where: { id: { in: legacyIds } } });
    console.log(`  Removed ${removed.count} questions on ${legacyDomains.length} legacy domains`);
  }

  for (const d of blueprint) {
    const domain = await prisma.domain.upsert({
      where: {
        certificationId_slug: { certificationId: certification.id, slug: d.slug },
      },
      update: { name: d.name, weightPercent: d.weightPercent },
      create: { certificationId: certification.id, ...d },
    });
    domainMap[d.slug] = domain.id;
  }

  console.log(`Importing ${awsMlSpecialtyQuestions.length} curated MLS questions...`);
  let imported = 0;
  let skipped = 0;

  for (const item of awsMlSpecialtyQuestions) {
    const domainId = domainMap[item.domainSlug];
    if (!domainId) {
      console.warn(`  Unknown domain slug: ${item.domainSlug}`);
      continue;
    }

    const exists = await prisma.question.findFirst({
      where: { certificationId: certification.id, title: item.title },
    });
    if (exists) {
      skipped++;
      continue;
    }

    const objectiveTag = item.tags.find((t) => /^[A-Z]{2,3}-\d+$/.test(t));

    await prisma.question.create({
      data: {
        certificationId: certification.id,
        domainId,
        objectiveId: objectiveTag ?? null,
        title: item.title,
        description: item.description ?? "",
        difficulty: item.difficulty,
        tags: [...item.tags, "curated", "reviewed"],
        options: {
          create: item.options.map((o) => ({
            key: o.key,
            text: o.text,
            isCorrect: o.isCorrect,
          })),
        },
        explanation: {
          create: {
            body: item.explanation,
            referenceLinks: awsMlReferenceLinks,
          },
        },
      },
    });
    imported++;
  }

  const finalCount = await prisma.question.count({
    where: { certificationId: certification.id, isActive: true },
  });

  console.log(`\nAWS ML Specialty: +${imported} new, ${skipped} skipped. Total active: ${finalCount}`);
  console.log("Import remaining questions via: pnpm db:import-content");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
