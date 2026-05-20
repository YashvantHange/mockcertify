import { prisma } from "@certprep/database";

export async function recordDailyAnalytics(
  userId: string,
  answered: number,
  correct: number,
  timeSpentSec: number
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.analyticsDaily.upsert({
    where: {
      userId_date: { userId, date: today },
    },
    update: {
      questionsAnswered: { increment: answered },
      correctCount: { increment: correct },
      timeSpentSec: { increment: timeSpentSec },
    },
    create: {
      userId,
      date: today,
      questionsAnswered: answered,
      correctCount: correct,
      timeSpentSec,
    },
  });
}

export async function getDashboardAnalytics(userId: string) {
  const [attempts, daily, weakAreasRaw, stats, user] = await Promise.all([
    prisma.examAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { endedAt: "desc" },
      take: 10,
      include: {
        certification: { select: { name: true, slug: true } },
      },
    }),
    prisma.analyticsDaily.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      take: 30,
    }),
    prisma.$queryRaw<{ name: string; count: bigint }[]>`
      SELECT d.name, COUNT(*)::bigint AS count
      FROM "AttemptAnswer" aa
      INNER JOIN "ExamAttempt" ea ON ea.id = aa."attemptId"
      INNER JOIN "Question" q ON q.id = aa."questionId"
      INNER JOIN "Domain" d ON d.id = q."domainId"
      WHERE ea."userId" = ${userId}
        AND ea.status = 'COMPLETED'
        AND aa."isCorrect" = false
      GROUP BY d.id, d.name
      ORDER BY count DESC
      LIMIT 5
    `,
    prisma.examAttempt.aggregate({
      where: { userId, status: "COMPLETED" },
      _count: true,
      _avg: { score: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { streakCount: true, name: true, email: true, avatarUrl: true },
    }),
  ]);

  const weakAreas = weakAreasRaw.map((w) => ({
    name: w.name,
    count: Number(w.count),
  }));

  return {
    user,
    recentAttempts: attempts,
    accuracySeries: daily.map((d) => ({
      date: d.date,
      accuracy: d.questionsAnswered
        ? Math.round((d.correctCount / d.questionsAnswered) * 100)
        : 0,
      questionsAnswered: d.questionsAnswered,
    })),
    weakAreas,
    totalAttempts: stats._count,
    averageScore: Math.round(stats._avg.score ?? 0),
  };
}
