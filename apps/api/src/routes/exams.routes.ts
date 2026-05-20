import { Router } from "express";
import { startExamSchema, saveAnswerSchema } from "@certprep/shared";
import { validate } from "../middleware/validate";
import { authenticate, AuthRequest } from "../middleware/auth";
import * as examService from "../services/exam.service";
import { prisma } from "@certprep/database";

const router = Router();
router.use(authenticate);

router.post("/start", validate(startExamSchema), async (req: AuthRequest, res, next) => {
  try {
    const result = await examService.startExam(req.user!.id, req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

router.get("/history", async (req: AuthRequest, res, next) => {
  try {
    const attempts = await prisma.examAttempt.findMany({
      where: { userId: req.user!.id },
      orderBy: { startedAt: "desc" },
      take: 20,
      include: {
        certification: { select: { name: true, slug: true } },
      },
    });
    res.json({ attempts });
  } catch (e) {
    next(e);
  }
});

router.get("/:attemptId", async (req: AuthRequest, res, next) => {
  try {
    const attempt = await examService.getAttempt(req.user!.id, String(req.params.attemptId));
    res.json({ attempt });
  } catch (e) {
    next(e);
  }
});

router.patch("/:attemptId/answer", validate(saveAnswerSchema), async (req: AuthRequest, res, next) => {
  try {
    const answer = await examService.saveAnswer(
      req.user!.id,
      String(req.params.attemptId),
      req.body
    );
    res.json({ answer });
  } catch (e) {
    next(e);
  }
});

router.post("/:attemptId/submit", async (req: AuthRequest, res, next) => {
  try {
    const result = await examService.submitExam(req.user!.id, String(req.params.attemptId));
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
