import { prisma } from "@certprep/database";

/** Question IDs from the user's last N practice/timed attempts on this cert. */
export async function getRecentlyUsedQuestionIds(
  userId: string,
  certificationId: string,
  maxAttempts = 3
): Promise<string[]> {
  const attempts = await prisma.examAttempt.findMany({
    where: {
      userId,
      certificationId,
      mode: { in: ["PRACTICE", "TIMED"] },
    },
    orderBy: { startedAt: "desc" },
    take: maxAttempts,
    select: {
      answers: { select: { questionId: true } },
    },
  });

  return [...new Set(attempts.flatMap((a) => a.answers.map((x) => x.questionId)))];
}
