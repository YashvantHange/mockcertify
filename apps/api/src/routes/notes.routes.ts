import { Router } from "express";
import { createNoteSchema } from "@certprep/shared";
import { prisma } from "@certprep/database";
import { validate } from "../middleware/validate";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user!.id },
      include: {
        question: {
          select: { title: true, id: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ notes });
  } catch (e) {
    next(e);
  }
});

router.put("/", validate(createNoteSchema), async (req: AuthRequest, res, next) => {
  try {
    const { questionId, content } = req.body;
    const note = await prisma.note.upsert({
      where: {
        userId_questionId: { userId: req.user!.id, questionId },
      },
      update: { content },
      create: { userId: req.user!.id, questionId, content },
    });
    res.json({ note });
  } catch (e) {
    next(e);
  }
});

router.delete("/:questionId", async (req: AuthRequest, res, next) => {
  try {
    await prisma.note.deleteMany({
      where: { userId: req.user!.id, questionId: String(req.params.questionId) },
    });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
