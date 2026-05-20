import { Router } from "express";
import { reportQuestionSchema } from "@certprep/shared";
import { prisma } from "@certprep/database";
import { validate } from "../middleware/validate";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.post("/", validate(reportQuestionSchema), async (req: AuthRequest, res, next) => {
  try {
    const report = await prisma.questionReport.create({
      data: { ...req.body, userId: req.user!.id },
    });
    res.status(201).json({ report });
  } catch (e) {
    next(e);
  }
});

export default router;
