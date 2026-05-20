import { Router } from "express";
import { prisma } from "@certprep/database";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ notifications });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/read", async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { id: String(req.params.id), userId: req.user!.id },
      data: { readAt: new Date() },
    });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
