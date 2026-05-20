import { z } from "zod";

export const questionSearchSchema = z.object({
  q: z.string().optional(),
  certificationId: z.string().cuid().optional(),
  domainId: z.string().cuid().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const createQuestionSchema = z.object({
  certificationId: z.string().cuid(),
  domainId: z.string().cuid(),
  objectiveId: z.string().max(50).optional(),
  title: z.string().min(5).max(500),
  description: z.string().max(5000).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  tags: z.array(z.string()).default([]),
  options: z
    .array(
      z.object({
        key: z.enum(["A", "B", "C", "D"]),
        text: z.string().min(1).max(1000),
        isCorrect: z.boolean(),
      })
    )
    .length(4),
  explanation: z.string().min(10),
  referenceLinks: z.array(z.string().url()).default([]),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
