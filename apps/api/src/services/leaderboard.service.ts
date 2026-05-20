import { prisma } from "@certprep/database";

export async function recalculateLeaderboards() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const attempts = await prisma.examAttempt.findMany({
    where: {
      status: "COMPLETED",
      mode: "TIMED",
      endedAt: { gte: weekAgo },
      score: { not: null },
    },
    select: {
      userId: true,
      certificationId: true,
      score: true,
    },
  });

  const weeklyScores: Record<string, { userId: string; certId: string | null; score: number }> = {};
  const allTimeScores: Record<string, { userId: string; certId: string | null; score: number }> = {};

  for (const a of attempts) {
    const weeklyKey = `${a.userId}:${a.certificationId}:WEEKLY`;
    const allKey = `${a.userId}:${a.certificationId}:ALL_TIME`;
    weeklyScores[weeklyKey] = {
      userId: a.userId,
      certId: a.certificationId,
      score: (weeklyScores[weeklyKey]?.score ?? 0) + (a.score ?? 0),
    };
    allTimeScores[allKey] = {
      userId: a.userId,
      certId: a.certificationId,
      score: Math.max(allTimeScores[allKey]?.score ?? 0, a.score ?? 0),
    };
  }

  for (const period of ["WEEKLY", "ALL_TIME"] as const) {
    const scores = period === "WEEKLY" ? weeklyScores : allTimeScores;
    const sorted = Object.values(scores).sort((a, b) => b.score - a.score);
    for (let i = 0; i < sorted.length; i++) {
      const entry = sorted[i];
      const certId = entry.certId ?? undefined;
      const existing = await prisma.leaderboardEntry.findFirst({
        where: { userId: entry.userId, certificationId: certId ?? null, period },
      });
      if (existing) {
        await prisma.leaderboardEntry.update({
          where: { id: existing.id },
          data: { score: Math.round(entry.score), rank: i + 1 },
        });
      } else {
        await prisma.leaderboardEntry.create({
          data: {
            userId: entry.userId,
            certificationId: certId,
            period,
            score: Math.round(entry.score),
            rank: i + 1,
          },
        });
      }
    }
  }
}

export async function getLeaderboard(
  certificationId: string | null,
  period: "WEEKLY" | "ALL_TIME",
  limit = 50
) {
  return prisma.leaderboardEntry.findMany({
    where: {
      certificationId: certificationId ?? null,
      period,
    },
    orderBy: { rank: "asc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      certification: { select: { name: true, slug: true } },
    },
  });
}
