import { Router } from "express";
import { getLeaderboard } from "../services/leaderboard.service";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const certificationId = (req.query.certificationId as string) || null;
    const period = (req.query.period as "WEEKLY" | "ALL_TIME") || "WEEKLY";
    const entries = await getLeaderboard(certificationId, period);
    res.json({ entries, period });
  } catch (e) {
    next(e);
  }
});

export default router;
