import { Router } from "express";
import { prisma } from "@certprep/database";
import { authenticate, AuthRequest } from "../middleware/auth";
import { badRequest } from "../utils/errors";

const router = Router();
router.use(authenticate);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user!.id },
      include: {
        question: {
          include: {
            certification: { select: { name: true, slug: true } },
            domain: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ bookmarks });
  } catch (e) {
    next(e);
  }
});

router.post("/:questionId", async (req: AuthRequest, res, next) => {
  try {
    const questionId = String(req.params.questionId);
    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_questionId: {
          userId: req.user!.id,
          questionId,
        },
      },
      update: {},
      create: {
        userId: req.user!.id,
        questionId,
      },
    });
    res.status(201).json({ bookmark });
  } catch (e) {
    next(e);
  }
});

router.delete("/:questionId", async (req: AuthRequest, res, next) => {
  try {
    await prisma.bookmark.deleteMany({
      where: {
        userId: req.user!.id,
        questionId: String(req.params.questionId),
      },
    });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
