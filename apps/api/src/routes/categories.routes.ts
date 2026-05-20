import { Router } from "express";
import { prisma } from "@certprep/database";
import { cacheJson } from "../middleware/cache";

const router = Router();

router.get("/", cacheJson(), async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        certifications: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            provider: true,
            _count: { select: { questions: true } },
          },
        },
      },
    });
    res.json({ categories });
  } catch (e) {
    next(e);
  }
});

export default router;
