import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const [categories, questions] = await Promise.all([
  prisma.category.count(),
  prisma.question.count({ where: { isActive: true } }),
]);
console.log(JSON.stringify({ categories, questions }));
await prisma.$disconnect();
