import { Router } from "express";
import multer from "multer";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

function resolveRepoRoot(): string {
  const candidates = [process.cwd(), join(__dirname, "../../../.."), join(process.cwd(), "../..")];
  for (const root of candidates) {
    if (existsSync(join(root, "packages/database/content/templates"))) return root;
  }
  return join(__dirname, "../../../..");
}

const REPO_ROOT = resolveRepoRoot();
import { prisma } from "@certprep/database";
import {
  createCertificationSchema,
  createDomainSchema,
  createQuestionSchema,
} from "@certprep/shared";
import { validate } from "../middleware/validate";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import { recalculateLeaderboards } from "../services/leaderboard.service";
import { badRequest } from "../utils/errors";
import { validateCsvContent, importCsvContent } from "../utils/csv-import";
import { listBlueprintSlugs } from "../utils/blueprint-validator";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authenticate, requireAdmin);

router.get("/stats", async (_req, res, next) => {
  try {
    const [users, questions, openReports, certifications] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.questionReport.count({ where: { status: "OPEN" } }),
      prisma.certification.count(),
    ]);
    res.json({ users, questions, openReports, certifications });
  } catch (e) {
    next(e);
  }
});

router.get("/users", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        streakCount: true,
        createdAt: true,
        subscriptions: { include: { plan: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ users });
  } catch (e) {
    next(e);
  }
});

router.patch("/users/:id/role", async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["USER", "ADMIN"].includes(role)) throw badRequest("Invalid role");
    const user = await prisma.user.update({
      where: { id: String(req.params.id) },
      data: { role },
    });
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

router.get("/reports", async (_req, res, next) => {
  try {
    const reports = await prisma.questionReport.findMany({
      include: {
        question: { select: { title: true, id: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ reports });
  } catch (e) {
    next(e);
  }
});

router.patch("/reports/:id", async (req, res, next) => {
  try {
    const report = await prisma.questionReport.update({
      where: { id: String(req.params.id) },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });
    res.json({ report });
  } catch (e) {
    next(e);
  }
});

router.get("/plans", async (_req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: "asc" } });
    res.json({ plans });
  } catch (e) {
    next(e);
  }
});

router.put("/plans/:id", async (req, res, next) => {
  try {
    const plan = await prisma.subscriptionPlan.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ plan });
  } catch (e) {
    next(e);
  }
});

router.get("/certifications", async (_req, res, next) => {
  try {
    const certifications = await prisma.certification.findMany({
      include: {
        category: { select: { name: true } },
        _count: { select: { questions: true, domains: true } },
      },
      orderBy: { name: "asc" },
    });
    res.json({ certifications });
  } catch (e) {
    next(e);
  }
});

router.get("/questions", async (req, res, next) => {
  try {
    const take = Math.min(50, parseInt(String(req.query.limit ?? "50"), 10));
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      take,
      orderBy: { updatedAt: "desc" },
      include: {
        certification: { select: { name: true, slug: true } },
        domain: { select: { name: true } },
      },
    });
    res.json({ questions });
  } catch (e) {
    next(e);
  }
});

router.post("/certifications", validate(createCertificationSchema), async (req, res, next) => {
  try {
    const cert = await prisma.certification.create({ data: req.body });
    res.status(201).json({ certification: cert });
  } catch (e) {
    next(e);
  }
});

router.put("/certifications/:id", async (req, res, next) => {
  try {
    const cert = await prisma.certification.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ certification: cert });
  } catch (e) {
    next(e);
  }
});

router.delete("/certifications/:id", async (req, res, next) => {
  try {
    await prisma.certification.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.post("/domains", validate(createDomainSchema), async (req, res, next) => {
  try {
    const domain = await prisma.domain.create({ data: req.body });
    res.status(201).json({ domain });
  } catch (e) {
    next(e);
  }
});

router.post("/questions", validate(createQuestionSchema), async (req, res, next) => {
  try {
    const { options, explanation, referenceLinks, ...data } = req.body;
    const question = await prisma.question.create({
      data: {
        ...data,
        options: { create: options },
        explanation: {
          create: { body: explanation, referenceLinks: referenceLinks ?? [] },
        },
      },
      include: { options: true, explanation: true },
    });
    res.status(201).json({ question });
  } catch (e) {
    next(e);
  }
});

router.put("/questions/:id", async (req, res, next) => {
  try {
    const { options, explanation, referenceLinks, ...data } = req.body;
    await prisma.questionOption.deleteMany({ where: { questionId: req.params.id } });
    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: {
        ...data,
        options: options ? { create: options } : undefined,
        explanation: explanation
          ? {
              upsert: {
                create: { body: explanation, referenceLinks: referenceLinks ?? [] },
                update: { body: explanation, referenceLinks: referenceLinks ?? [] },
              },
            }
          : undefined,
      },
      include: { options: true, explanation: true },
    });
    res.json({ question });
  } catch (e) {
    next(e);
  }
});

router.delete("/questions/:id", async (req, res, next) => {
  try {
    await prisma.question.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

const templatesDir = join(REPO_ROOT, "packages/database/content/templates");
const blueprintsDir = join(REPO_ROOT, "packages/database/content/blueprints");

router.get("/questions/csv-template/:certSlug", async (req, res, next) => {
  try {
    const path = join(templatesDir, `${req.params.certSlug}.csv`);
    if (!existsSync(path)) throw badRequest(`No template for ${req.params.certSlug}`);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.params.certSlug}-template.csv"`
    );
    res.send(readFileSync(path, "utf-8"));
  } catch (e) {
    next(e);
  }
});

router.get("/questions/slug-cheat-sheet", async (_req, res, next) => {
  try {
    const path = join(templatesDir, "slug-cheat-sheet.csv");
    if (!existsSync(path)) throw badRequest("Slug cheat sheet not generated");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="slug-cheat-sheet.csv"');
    res.send(readFileSync(path, "utf-8"));
  } catch (e) {
    next(e);
  }
});

router.get("/blueprints", async (_req, res, next) => {
  try {
    const slugs = listBlueprintSlugs();
    res.json({ certifications: slugs });
  } catch (e) {
    next(e);
  }
});

router.get("/blueprints/:certSlug", async (req, res, next) => {
  try {
    const path = join(blueprintsDir, `${req.params.certSlug}.json`);
    if (!existsSync(path)) throw badRequest("Blueprint not found");
    res.setHeader("Content-Type", "application/json");
    res.send(readFileSync(path, "utf-8"));
  } catch (e) {
    next(e);
  }
});

router.post("/questions/validate-csv", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw badRequest("CSV file required");
    const content = req.file.buffer.toString("utf-8");
    const summary = await validateCsvContent(content);
    res.json({
      ...summary,
      canImport: summary.validRows > 0 && summary.errors.filter((e) => !e.error?.includes("will skip")).length === 0,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/questions/bulk-csv", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw badRequest("CSV file required");
    const content = req.file.buffer.toString("utf-8");
    const results = await importCsvContent(content, { skipDuplicates: true });
    res.json(results);
  } catch (e) {
    next(e);
  }
});

router.post("/leaderboards/recalculate", async (_req, res, next) => {
  try {
    await recalculateLeaderboards();
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
