import { z } from "zod";

export const createCertificationSchema = z.object({
  categoryId: z.string().cuid(),
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  provider: z.string().min(1).max(100),
  description: z.string().max(5000),
  durationMinutes: z.number().int().min(10).max(600),
  passingScore: z.number().int().min(50).max(100).default(72),
  badgePublicId: z.string().optional(),
});

export const createDomainSchema = z.object({
  certificationId: z.string().cuid(),
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  weightPercent: z.number().int().min(1).max(100),
});

export const csvRowSchema = z.object({
  certification_slug: z.string(),
  domain_slug: z.string(),
  objective_id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  option_a: z.string(),
  option_b: z.string(),
  option_c: z.string(),
  option_d: z.string(),
  correct_option: z.enum(["A", "B", "C", "D"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  tags: z.string().optional(),
  explanation: z.string(),
  reference_urls: z.string().optional(),
});
