/**
 * Deactivates auto-generated and legacy generic-domain questions.
 * Run: node scripts/cleanup-legacy-questions.mjs
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BLUEPRINTS_DIR = join(ROOT, "packages/database/content/blueprints");

const LEGACY_DOMAIN_SLUGS = new Set([
  "core-concepts",
  "implementation",
  "operations-security",
]);

const prisma = new PrismaClient();

function getOfficialDomainSlugs(certSlug) {
  const path = join(BLUEPRINTS_DIR, `${certSlug}.json`);
  if (!existsSync(path)) return null;
  const bp = JSON.parse(readFileSync(path, "utf-8"));
  return new Set(bp.domains.map((d) => d.slug));
}

async function main() {
  const certs = await prisma.certification.findMany({ select: { id: true, slug: true } });
  let deactivated = 0;
  let deleted = 0;

  for (const cert of certs) {
    const officialSlugs = getOfficialDomainSlugs(cert.slug);

    const legacyDomains = await prisma.domain.findMany({
      where: {
        certificationId: cert.id,
        slug: officialSlugs
          ? { notIn: [...officialSlugs] }
          : { in: [...LEGACY_DOMAIN_SLUGS] },
      },
    });

    if (legacyDomains.length > 0) {
      const ids = legacyDomains.map((d) => d.id);
      const removed = await prisma.question.deleteMany({
        where: { certificationId: cert.id, domainId: { in: ids } },
      });
      await prisma.domain.deleteMany({ where: { id: { in: ids } } });
      deleted += removed.count;
      console.log(`  ${cert.slug}: removed ${removed.count} questions on legacy domains`);
    }

    const autoGen = await prisma.question.updateMany({
      where: {
        certificationId: cert.id,
        isActive: true,
        OR: [
          { tags: { has: "auto-generated" } },
          { title: { contains: "— Core Concepts (#" } },
          { title: { contains: "[Easy]" } },
          { title: { contains: "[Moderate]" } },
          { title: { contains: "[Hard]" } },
          {
            AND: [
              { objectiveId: null },
              { NOT: { tags: { hasSome: ["blueprint-seed", "curated", "reviewed"] } } },
            ],
          },
        ],
      },
      data: { isActive: false },
    });
    if (autoGen.count > 0) {
      deactivated += autoGen.count;
      console.log(`  ${cert.slug}: deactivated ${autoGen.count} legacy/auto-generated questions`);
    }
  }

  console.log(`\nDone. Deleted: ${deleted}, deactivated: ${deactivated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
