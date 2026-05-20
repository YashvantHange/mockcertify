import { z } from "zod";

export const startExamSchema = z.object({
  certificationId: z.string().cuid(),
  mode: z.enum(["PRACTICE", "TIMED", "REVIEW"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  domainIds: z.array(z.string().cuid()).optional(),
  questionCount: z.number().int().min(5).max(100).optional(),
  /** Minutes; omit or 0 = no timer (practice). Timed mode defaults to cert duration. */
  timeLimitMinutes: z.number().int().min(0).max(240).optional(),
});

export const saveAnswerSchema = z.object({
  questionId: z.string().cuid(),
  selectedOptionId: z.string().cuid().optional().nullable(),
  flagged: z.boolean().optional(),
  timeSpentSec: z.number().int().min(0).optional(),
});

export type StartExamInput = z.infer<typeof startExamSchema>;
export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>;
