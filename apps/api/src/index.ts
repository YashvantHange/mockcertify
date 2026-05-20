import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import cron from "node-cron";
import passport from "passport";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { recalculateLeaderboards } from "./services/leaderboard.service";

import authRoutes from "./routes/auth.routes";
import categoriesRoutes from "./routes/categories.routes";
import certificationsRoutes from "./routes/certifications.routes";
import examsRoutes from "./routes/exams.routes";
import questionsRoutes from "./routes/questions.routes";
import bookmarksRoutes from "./routes/bookmarks.routes";
import notesRoutes from "./routes/notes.routes";
import communityRoutes from "./routes/community.routes";
import reportsRoutes from "./routes/reports.routes";
import analyticsRoutes from "./routes/analytics.routes";
import leaderboardsRoutes from "./routes/leaderboards.routes";
import notificationsRoutes from "./routes/notifications.routes";
import certificatesRoutes from "./routes/certificates.routes";
import adminRoutes from "./routes/admin.routes";
import plansRoutes from "./routes/plans.routes";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
const allowedOrigins = [
  config.clientUrl,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ...(process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) ?? []),
].filter(Boolean) as string[];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, allowedOrigins[0]);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(passport.initialize());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: config.nodeEnv === "development" ? 50 : 10,
  message: { error: "Too many auth attempts" },
});

app.use(generalLimiter);
app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

const v1 = "/api/v1";
app.use(`${v1}/auth`, authLimiter, authRoutes);
app.use(`${v1}/categories`, categoriesRoutes);
app.use(`${v1}/certifications`, certificationsRoutes);
app.use(`${v1}/exams`, examsRoutes);
app.use(`${v1}/questions`, questionsRoutes);
app.use(`${v1}/bookmarks`, bookmarksRoutes);
app.use(`${v1}/notes`, notesRoutes);
app.use(`${v1}/community`, communityRoutes);
app.use(`${v1}/reports`, reportsRoutes);
app.use(`${v1}/analytics`, analyticsRoutes);
app.use(`${v1}/leaderboards`, leaderboardsRoutes);
app.use(`${v1}/notifications`, notificationsRoutes);
app.use(`${v1}/certificates`, certificatesRoutes);
app.use(`${v1}/admin`, adminRoutes);
app.use(`${v1}/plans`, plansRoutes);

app.use(errorHandler);

cron.schedule("0 */6 * * *", () => {
  recalculateLeaderboards().catch(console.error);
});

async function maybeBootstrapProduction() {
  if (process.env.RUN_DB_IMPORT !== "true") return;
  try {
    const { execSync } = require("child_process");
    const root = process.cwd();
    console.log("RUN_DB_IMPORT: bootstrapping database...");
    execSync("node scripts/render-bootstrap.mjs", { cwd: root, stdio: "inherit" });
  } catch (e) {
    console.error("Bootstrap failed (API will still start):", e);
  }
}

app.listen(config.port, async () => {
  console.log(`MockCertify API running on port ${config.port}`);
  await maybeBootstrapProduction();
});
