import { Router } from "express";
import { prisma } from "@certprep/database";
import { questionSearchSchema } from "@certprep/shared";
import { validate } from "../middleware/validate";
import { authenticate, AuthRequest } from "../middleware/auth";
import { notFound } from "../utils/errors";

const router = Router();

router.get("/search", authenticate, validate(questionSearchSchema, "query"), async (req: AuthRequest, res, next) => {
  try {
    const query = req.query as Record<string, string | undefined>;
    const { q, certificationId, domainId, difficulty, cursor } = query;
    const limit = Math.min(50, parseInt(query.limit ?? "20", 10));

    const questions = await prisma.question.findMany({
      where: {
        isActive: true,
        ...(certificationId && { certificationId }),
        ...(domainId && { domainId }),
        ...(difficulty && { difficulty: difficulty as "EASY" | "MEDIUM" | "HARD" }),
        ...(q && {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }),
        ...(cursor && { id: { gt: cursor } }),
      },
      take: limit,
      orderBy: { id: "asc" },
      include: {
        domain: { select: { name: true, slug: true } },
        certification: { select: { name: true, slug: true } },
      },
    });

    res.json({
      questions,
      nextCursor: questions.length === limit ? questions[questions.length - 1]?.id : null,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: String(req.params.id), isActive: true },
      include: {
        options: { select: { id: true, key: true, text: true } },
        domain: true,
        certification: { select: { name: true, slug: true } },
        explanation: true,
      },
    });
    if (!question) throw notFound();
    res.json({ question });
  } catch (e) {
    next(e);
  }
});

export default router;
