import { Router } from "express";
import { prisma } from "@certprep/database";
import { notFound } from "../utils/errors";
import { optionalAuth, AuthRequest } from "../middleware/auth";
import { cacheJson } from "../middleware/cache";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const certifications = await prisma.certification.findMany({
      where: { isActive: true },
      include: {
        category: { select: { name: true, slug: true } },
        _count: {
          select: {
            questions: { where: { isActive: true } },
            domains: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    res.json({ certifications });
  } catch (e) {
    next(e);
  }
});

router.get("/featured", cacheJson(), async (_req, res, next) => {
  try {
    const certifications = await prisma.certification.findMany({
      where: { isActive: true },
      take: 8,
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { questions: { where: { isActive: true } } } },
      },
    });
    res.json({ certifications });
  } catch (e) {
    next(e);
  }
});

router.get("/:slug", optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const cert = await prisma.certification.findUnique({
      where: { slug: String(req.params.slug), isActive: true },
      include: {
        category: true,
        domains: { orderBy: { weightPercent: "desc" } },
        _count: { select: { questions: { where: { isActive: true } } } },
      },
    });
    if (!cert) throw notFound();

    let userProgress = null;
    if (req.user) {
      const [attempts, best] = await Promise.all([
        prisma.examAttempt.findMany({
          where: { userId: req.user.id, certificationId: cert.id, status: "COMPLETED" },
          select: { score: true, mode: true, endedAt: true },
          orderBy: { endedAt: "desc" },
          take: 5,
        }),
        prisma.examAttempt.aggregate({
          where: { userId: req.user.id, certificationId: cert.id, status: "COMPLETED" },
          _max: { score: true },
          _count: true,
        }),
      ]);
      userProgress = { attempts, bestScore: best._max.score, totalAttempts: best._count };
    }

    res.json({ certification: cert, userProgress });
  } catch (e) {
    next(e);
  }
});

export default router;
