import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { getDashboardAnalytics } from "../services/analytics.service";

const router = Router();
router.use(authenticate);

router.get("/dashboard", async (req: AuthRequest, res, next) => {
  try {
    const analytics = await getDashboardAnalytics(req.user!.id);
    res.json(analytics);
  } catch (e) {
    next(e);
  }
});

export default router;
