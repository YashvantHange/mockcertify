import { Router } from "express";
import { prisma } from "@certprep/database";
import { cacheJson } from "../middleware/cache";

const router = Router();

router.get("/", cacheJson(), async (_req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ plans });
  } catch (e) {
    next(e);
  }
});

export default router;
