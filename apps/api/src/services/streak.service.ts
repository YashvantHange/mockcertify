import { prisma } from "@certprep/database";

export async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = user.lastActiveDate
    ? new Date(user.lastActiveDate)
  : null;
  if (lastActive) lastActive.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let streak = user.streakCount;
  if (!lastActive) {
    streak = 1;
  } else if (lastActive.getTime() === today.getTime()) {
    return streak;
  } else if (lastActive.getTime() === yesterday.getTime()) {
    streak += 1;
  } else {
    streak = 1;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { streakCount: streak, lastActiveDate: new Date() },
  });
  return streak;
}
