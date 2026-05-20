import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  categories,
  certifications,
  getDomainsForCert,
} from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!@#";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@certprep.local" },
    update: {},
    create: {
      email: "admin@certprep.local",
      passwordHash: adminHash,
      name: "Platform Admin",
      role: "ADMIN",
      emailVerified: true,
    },
  });

  const plans = [
    {
      name: "Free",
      slug: "free",
      priceDisplay: "$0",
      features: ["10 questions/day", "Practice mode", "Basic analytics"],
      sortOrder: 0,
    },
    {
      name: "Pro",
      slug: "pro",
      priceDisplay: "$19/mo",
      features: ["Unlimited practice", "Timed exams", "Full analytics", "Weak area analysis"],
      sortOrder: 1,
    },
    {
      name: "Team",
      slug: "team",
      priceDisplay: "$49/mo",
      features: ["Everything in Pro", "Team leaderboard", "Admin reports", "Priority support"],
      sortOrder: 2,
    },
  ];

  const planRecords: Record<string, string> = {};
  for (const plan of plans) {
    const p = await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: { ...plan, features: plan.features },
    });
    planRecords[plan.slug] = p.id;
  }

  const existingSub = await prisma.userSubscription.findFirst({ where: { userId: admin.id } });
  if (!existingSub) {
    await prisma.userSubscription.create({
      data: { userId: admin.id, planId: planRecords.free, status: "ACTIVE" },
    });
  }

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = c.id;
  }

  for (const cert of certifications) {
    const certification = await prisma.certification.upsert({
      where: { slug: cert.slug },
      update: {
        name: cert.name,
        provider: cert.provider,
        durationMinutes: cert.durationMinutes,
        passingScore: cert.passingScore,
        description: `Comprehensive practice tests for ${cert.name}. Master exam domains with timed and practice modes.`,
      },
      create: {
        categoryId: categoryMap[cert.categorySlug],
        name: cert.name,
        slug: cert.slug,
        provider: cert.provider,
        description: `Comprehensive practice tests for ${cert.name}. Master exam domains with timed and practice modes.`,
        durationMinutes: cert.durationMinutes,
        passingScore: cert.passingScore,
      },
    });

    const domains = getDomainsForCert(cert.slug);
    const domainIds: Record<string, string> = {};

    for (const d of domains) {
      const domain = await prisma.domain.upsert({
        where: {
          certificationId_slug: { certificationId: certification.id, slug: d.slug },
        },
        update: d,
        create: { certificationId: certification.id, ...d },
      });
      domainIds[d.slug] = domain.id;
    }

    const existingExam = await prisma.exam.findFirst({
      where: { certificationId: certification.id, mode: "PRACTICE" },
    });
    if (!existingExam) {
      await prisma.exam.create({
        data: {
          certificationId: certification.id,
          name: `${cert.name} Practice`,
          mode: "PRACTICE",
          questionCount: 65,
        },
      });
    }

  }

  console.log(
    `Seeded admin, ${categories.length} categories, ${certifications.length} certifications with official blueprint domains.`
  );
  console.log(
    `Import 500 syllabus-aligned questions per cert: node scripts/generate-blueprint-questions.mjs && pnpm db:import-content`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
