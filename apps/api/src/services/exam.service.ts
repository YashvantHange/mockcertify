import { prisma, ExamMode } from "@certprep/database";
import { badRequest, notFound, forbidden } from "../utils/errors";
import { pickRandomQuestionIds } from "../utils/question-pool";
import { getRecentlyUsedQuestionIds } from "../utils/recent-questions";
import { shuffleQuestionOptions } from "../utils/shuffle";
import { recordDailyAnalytics } from "./analytics.service";
import type { StartExamInput, SaveAnswerInput } from "@certprep/shared";

const DEFAULT_QUESTION_COUNT = 20;

export async function startExam(userId: string, input: StartExamInput) {
  const cert = await prisma.certification.findUnique({
    where: { id: input.certificationId, isActive: true },
    include: { domains: true },
  });
  if (!cert) throw notFound("Certification not found");

  const poolSize = await prisma.question.count({
    where: { certificationId: cert.id, isActive: true },
  });
  const maxAllowed = Math.min(100, poolSize);
  const questionCount = Math.min(
    input.questionCount ?? Math.min(65, DEFAULT_QUESTION_COUNT),
    maxAllowed
  );

  if (questionCount < 5) throw badRequest("Not enough questions in pool");

  let timeLimitMinutes: number | null = null;
  if (input.mode === "TIMED") {
    const mins = input.timeLimitMinutes ?? cert.durationMinutes;
    timeLimitMinutes = mins > 0 ? mins : cert.durationMinutes;
  } else if (input.mode === "PRACTICE" && input.timeLimitMinutes && input.timeLimitMinutes > 0) {
    timeLimitMinutes = input.timeLimitMinutes;
  }

  let questionIds: string[] = [];

  if (input.mode === "REVIEW") {
    const missed = await prisma.attemptAnswer.findMany({
      where: {
        attempt: { userId, certificationId: cert.id },
        OR: [{ isCorrect: false }, { flagged: true }],
      },
      select: { questionId: true },
      distinct: ["questionId"],
      take: questionCount,
    });
    questionIds = missed.map((m) => m.questionId);
    if (questionIds.length === 0) {
      throw badRequest("No questions available for review. Complete a practice exam first.");
    }
  } else {
    const excludeAttempts = Math.max(3, Math.min(8, Math.ceil(questionCount / 10) + 2));
    const recentIds = await getRecentlyUsedQuestionIds(userId, cert.id, excludeAttempts);
    questionIds = await pickRandomQuestionIds(cert.id, questionCount, {
      difficulty: input.difficulty,
      domainIds: input.domainIds,
      excludeIds: recentIds,
    });
    if (questionIds.length < 5) throw badRequest("Not enough questions in pool");
  }

  const attempt = await prisma.examAttempt.create({
    data: {
      userId,
      certificationId: cert.id,
      mode: input.mode as ExamMode,
      totalCount: questionIds.length,
      timeLimitMinutes,
      answers: {
        create: questionIds.map((questionId) => ({ questionId })),
      },
    },
    include: {
      certification: { select: { name: true, slug: true, durationMinutes: true, passingScore: true } },
      answers: {
        include: {
          question: {
            select: {
              id: true,
              title: true,
              description: true,
              difficulty: true,
              domain: { select: { name: true, slug: true } },
              options: { select: { id: true, key: true, text: true } },
            },
          },
        },
      },
    },
  });

  const questions = attempt.answers.map((a) => ({
    answerId: a.id,
    questionId: a.question.id,
    title: a.question.title,
    description: a.question.description,
    difficulty: a.question.difficulty,
    domain: a.question.domain,
    options: shuffleQuestionOptions(a.question.options, attempt.id, a.question.id),
    flagged: a.flagged,
    selectedOptionId: a.selectedOptionId,
  }));

  return {
    attemptId: attempt.id as string,
    mode: attempt.mode,
    status: attempt.status,
    startedAt: attempt.startedAt,
    totalCount: attempt.totalCount,
    certification: attempt.certification,
    timeLimitMinutes,
    questions,
  };
}

export async function saveAnswer(
  userId: string,
  attemptId: string,
  input: SaveAnswerInput
) {
  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, userId, status: "IN_PROGRESS" },
  });
  if (!attempt) throw notFound("Attempt not found or already submitted");

  const answer = await prisma.attemptAnswer.update({
    where: {
      attemptId_questionId: {
        attemptId,
        questionId: input.questionId,
      },
    },
    data: {
      selectedOptionId: input.selectedOptionId ?? undefined,
      flagged: input.flagged ?? undefined,
      timeSpentSec: input.timeSpentSec ?? undefined,
      answeredAt: input.selectedOptionId ? new Date() : undefined,
    },
  });
  return answer;
}

export async function submitExam(userId: string, attemptId: string) {
  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, userId, status: "IN_PROGRESS" },
    include: {
      answers: {
        include: {
          question: {
            include: {
              options: true,
              explanation: true,
              domain: true,
            },
          },
          selectedOption: true,
        },
      },
      certification: true,
    },
  });
  if (!attempt) throw notFound("Attempt not found");
  if (attempt.userId !== userId) throw forbidden();

  let correctCount = 0;
  const results = [];

  for (const answer of attempt.answers) {
    const correctOption = answer.question.options.find((o) => o.isCorrect);
    const isCorrect =
      answer.selectedOptionId != null &&
      answer.selectedOptionId === correctOption?.id;

    if (isCorrect) correctCount++;

    await prisma.attemptAnswer.update({
      where: { id: answer.id },
      data: { isCorrect },
    });

    results.push({
      questionId: answer.questionId,
      title: answer.question.title,
      difficulty: answer.question.difficulty,
      domain: answer.question.domain,
      selectedOptionId: answer.selectedOptionId,
      correctOptionId: correctOption?.id,
      isCorrect,
      flagged: answer.flagged,
      explanation: answer.question.explanation,
      options: shuffleQuestionOptions(
        answer.question.options,
        attemptId,
        answer.questionId
      ),
    });
  }

  const score = attempt.totalCount
    ? Math.round((correctCount / attempt.totalCount) * 100)
    : 0;

  const timeSpentSec = attempt.answers.reduce((s, a) => s + a.timeSpentSec, 0);

  const updated = await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      status: "COMPLETED",
      endedAt: new Date(),
      correctCount,
      score,
      timeSpentSec,
    },
  });

  await recordDailyAnalytics(
    userId,
    attempt.totalCount,
    correctCount,
    timeSpentSec
  );

  if (
    attempt.mode === "TIMED" &&
    score >= attempt.certification.passingScore
  ) {
    await prisma.certificate.upsert({
      where: {
        userId_certificationId: {
          userId,
          certificationId: attempt.certificationId,
        },
      },
      update: { score, issuedAt: new Date() },
      create: {
        userId,
        certificationId: attempt.certificationId,
        score,
      },
    });
    await prisma.notification.create({
      data: {
        userId,
        type: "CERTIFICATE",
        title: "Certificate earned!",
        body: `You passed ${attempt.certification.name} practice exam with ${score}%`,
        payload: { certificationId: attempt.certificationId, score },
      },
    });
  }

  return {
    attemptId: updated.id,
    score,
    correctCount,
    totalCount: attempt.totalCount,
    passingScore: attempt.certification.passingScore,
    passed: score >= attempt.certification.passingScore,
    results,
  };
}

export async function getAttempt(userId: string, attemptId: string) {
  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      certification: { select: { name: true, slug: true, durationMinutes: true, passingScore: true } },
      answers: {
        include: {
          question: {
            include: {
              options: { select: { id: true, key: true, text: true } },
              domain: { select: { name: true, slug: true } },
            },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });
  if (!attempt) throw notFound("Attempt not found");

  return {
    ...attempt,
    answers: attempt.answers.map((a) => ({
      ...a,
      question: {
        ...a.question,
        options: shuffleQuestionOptions(a.question.options, attempt.id, a.question.id),
      },
    })),
  };
}
