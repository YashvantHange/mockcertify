import { Router } from "express";
import { createDiscussionSchema, createReplySchema } from "@certprep/shared";
import { prisma } from "@certprep/database";
import { validate } from "../middleware/validate";
import { authenticate, AuthRequest } from "../middleware/auth";
import { notFound } from "../utils/errors";

const router = Router();

router.get("/discussions", async (req, res, next) => {
  try {
    const { certificationId, questionId } = req.query;
    const discussions = await prisma.discussion.findMany({
      where: {
        ...(certificationId && { certificationId: certificationId as string }),
        ...(questionId && { questionId: questionId as string }),
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { replies: true } },
        certification: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ discussions });
  } catch (e) {
    next(e);
  }
});

router.get("/discussions/:id", async (req, res, next) => {
  try {
    const discussion = await prisma.discussion.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        certification: { select: { name: true, slug: true } },
        replies: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!discussion) throw notFound();
    res.json({ discussion });
  } catch (e) {
    next(e);
  }
});

router.post("/discussions", authenticate, validate(createDiscussionSchema), async (req: AuthRequest, res, next) => {
  try {
    const discussion = await prisma.discussion.create({
      data: { ...req.body, userId: req.user!.id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    res.status(201).json({ discussion });
  } catch (e) {
    next(e);
  }
});

router.post("/discussions/:id/replies", authenticate, validate(createReplySchema), async (req: AuthRequest, res, next) => {
  try {
    const reply = await prisma.discussionReply.create({
      data: {
        discussionId: String(req.params.id),
        userId: req.user!.id,
        body: req.body.body,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
    res.status(201).json({ reply });
  } catch (e) {
    next(e);
  }
});

export default router;
