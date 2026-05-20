/**
 * Upserts official blueprint domains for all certifications.
 * Run: pnpm --filter @certprep/database sync-domains
 */
import { PrismaClient } from "@prisma/client";
import { certifications, getDomainsForCert } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  for (const cert of certifications) {
    const certification = await prisma.certification.findUnique({
      where: { slug: cert.slug },
    });
    if (!certification) {
      console.warn(`Skip ${cert.slug}: not found`);
      continue;
    }

    const domains = getDomainsForCert(cert.slug);
    for (const d of domains) {
      await prisma.domain.upsert({
        where: {
          certificationId_slug: { certificationId: certification.id, slug: d.slug },
        },
        update: { name: d.name, weightPercent: d.weightPercent },
        create: { certificationId: certification.id, ...d },
      });
    }
    console.log(`  ${cert.slug}: ${domains.length} domains synced`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
