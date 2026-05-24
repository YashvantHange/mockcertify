import { prisma, Difficulty, Prisma } from "@certprep/database";

async function queryRandomIds(
  certificationId: string,
  count: number,
  excludeIds: string[],
  filters?: { difficulty?: Difficulty; domainIds?: string[] }
): Promise<string[]> {
  const difficulty = filters?.difficulty;
  const domainIds = filters?.domainIds;
  const hasExclude = excludeIds.length > 0;

  const toIds = (rows: { id: string }[]) => rows.map((r) => r.id);

  if (difficulty && domainIds?.length) {
    if (hasExclude) {
      return toIds(await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Question"
        WHERE "certificationId" = ${certificationId}
          AND "isActive" = true
          AND difficulty = ${difficulty}::"Difficulty"
          AND "domainId" IN (${Prisma.join(domainIds)})
          AND id NOT IN (${Prisma.join(excludeIds)})
        ORDER BY RANDOM()
        LIMIT ${count}
      `);
    }
    return toIds(await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Question"
      WHERE "certificationId" = ${certificationId}
        AND "isActive" = true
        AND difficulty = ${difficulty}::"Difficulty"
        AND "domainId" IN (${Prisma.join(domainIds)})
      ORDER BY RANDOM()
      LIMIT ${count}
    `);
  }

  if (difficulty) {
    if (hasExclude) {
      return toIds(await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Question"
        WHERE "certificationId" = ${certificationId}
          AND "isActive" = true
          AND difficulty = ${difficulty}::"Difficulty"
          AND id NOT IN (${Prisma.join(excludeIds)})
        ORDER BY RANDOM()
        LIMIT ${count}
      `);
    }
    return toIds(await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Question"
      WHERE "certificationId" = ${certificationId}
        AND "isActive" = true
        AND difficulty = ${difficulty}::"Difficulty"
      ORDER BY RANDOM()
      LIMIT ${count}
    `);
  }

  if (domainIds?.length) {
    if (hasExclude) {
      return toIds(await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Question"
        WHERE "certificationId" = ${certificationId}
          AND "isActive" = true
          AND "domainId" IN (${Prisma.join(domainIds)})
          AND id NOT IN (${Prisma.join(excludeIds)})
        ORDER BY RANDOM()
        LIMIT ${count}
      `);
    }
    return toIds(await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Question"
      WHERE "certificationId" = ${certificationId}
        AND "isActive" = true
        AND "domainId" IN (${Prisma.join(domainIds)})
      ORDER BY RANDOM()
      LIMIT ${count}
    `);
  }

  if (hasExclude) {
    return toIds(await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Question"
      WHERE "certificationId" = ${certificationId}
        AND "isActive" = true
        AND id NOT IN (${Prisma.join(excludeIds)})
      ORDER BY RANDOM()
      LIMIT ${count}
    `);
  }

  return toIds(await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Question"
    WHERE "certificationId" = ${certificationId}
      AND "isActive" = true
    ORDER BY RANDOM()
    LIMIT ${count}
  `);
}

/**
 * Pick random question IDs, preferring questions the user has not seen recently.
 */
export async function pickRandomQuestionIds(
  certificationId: string,
  count: number,
  filters?: { difficulty?: Difficulty; domainIds?: string[]; excludeIds?: string[] }
): Promise<string[]> {
  const excludeIds = filters?.excludeIds ?? [];
  const picked = new Set<string>();

  if (excludeIds.length > 0) {
    const fresh = await queryRandomIds(certificationId, count, excludeIds, filters);
    for (const id of fresh) picked.add(id);
  }

  if (picked.size < count) {
    const remaining = count - picked.size;
    const fallbackExclude = [...picked, ...excludeIds];
    const more = await queryRandomIds(
      certificationId,
      remaining,
      fallbackExclude.length > 0 ? fallbackExclude : [],
      filters
    );
    for (const id of more) picked.add(id);
  }

  return [...picked];
}
