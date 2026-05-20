import { z } from "zod";

export const createDiscussionSchema = z.object({
  title: z.string().min(5).max(200),
  body: z.string().min(10).max(10000),
  certificationId: z.string().cuid().optional(),
  questionId: z.string().cuid().optional(),
});

export const createReplySchema = z.object({
  body: z.string().min(1).max(5000),
});

export const createNoteSchema = z.object({
  questionId: z.string().cuid(),
  content: z.string().min(1).max(5000),
});

export const reportQuestionSchema = z.object({
  questionId: z.string().cuid(),
  reason: z.string().min(10).max(1000),
});
