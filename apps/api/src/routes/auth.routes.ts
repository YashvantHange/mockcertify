import { Router } from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "@certprep/database";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@certprep/shared";
import { validate } from "../middleware/validate";
import { authenticate, AuthRequest } from "../middleware/auth";
import { config } from "../config";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies";
import { generateToken, hashToken } from "../utils/crypto";
import { badRequest, unauthorized } from "../utils/errors";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../services/email.service";
import { updateStreak } from "../services/streak.service";

const router = Router();

if (config.googleClientId && config.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: config.googleCallbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("No email from Google"));

          let user = await prisma.user.findFirst({
            where: { OR: [{ googleId: profile.id }, { email }] },
          });

          if (!user) {
            const freePlan = await prisma.subscriptionPlan.findUnique({
              where: { slug: "free" },
            });
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName ?? email.split("@")[0],
                googleId: profile.id,
                avatarUrl: profile.photos?.[0]?.value,
                emailVerified: true,
              },
            });
            if (freePlan) {
              await prisma.userSubscription.create({
                data: { userId: user.id, planId: freePlan.id },
              });
            }
          } else if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id, avatarUrl: profile.photos?.[0]?.value ?? user.avatarUrl },
            });
          }
          done(null, user);
        } catch (e) {
          done(e as Error);
        }
      }
    )
  );
}

async function issueTokens(
  res: import("express").Response,
  user: { id: string; email: string; role: string; name: string }
) {
  const payload = { userId: user.id, email: user.email, role: user.role, name: user.name };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({
    data: { tokenHash, userId: user.id, expiresAt },
  });
  setAuthCookies(res, accessToken, refreshToken);
  await updateStreak(user.id);
}

router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw badRequest("Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);
    const freePlan = await prisma.subscriptionPlan.findUnique({ where: { slug: "free" } });

    const user = await prisma.user.create({
      data: { email, passwordHash, name, emailVerified: false },
    });

    if (freePlan) {
      await prisma.userSubscription.create({
        data: { userId: user.id, planId: freePlan.id },
      });
    }

    await issueTokens(res, user);
    await sendWelcomeEmail(email, name);
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e) {
    next(e);
  }
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) throw unauthorized("Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw unauthorized("Invalid credentials");

    await issueTokens(res, user);
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e) {
    next(e);
  }
});

router.post("/logout", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { tokenHash: hashToken(refreshToken) },
      });
    }
    clearAuthCookies(res);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw unauthorized();

    const payload = verifyRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
    });
    if (!stored || stored.expiresAt < new Date()) throw unauthorized();

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw unauthorized();

    await prisma.refreshToken.delete({ where: { id: stored.id } });
    await issueTokens(res, user);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        streakCount: true,
        locale: true,
        createdAt: true,
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true },
          take: 1,
        },
      },
    });
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

router.post("/forgot-password", validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      await prisma.passwordResetToken.create({
        data: { tokenHash: hashToken(token), userId: user.id, expiresAt },
      });
      const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
      await sendPasswordResetEmail(email, resetUrl);
    }
    res.json({ message: "If an account exists, a reset link was sent." });
  } catch (e) {
    next(e);
  }
});

router.post("/reset-password", validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const stored = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });
    if (!stored || stored.expiresAt < new Date()) throw badRequest("Invalid or expired token");

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: stored.userId },
      data: { passwordHash },
    });
    await prisma.passwordResetToken.delete({ where: { id: stored.id } });
    res.json({ message: "Password updated successfully" });
  } catch (e) {
    next(e);
  }
});

router.get("/config", (_req, res) => {
  const keysPresent = Boolean(config.googleClientId && config.googleClientSecret);
  const enabled = process.env.GOOGLE_OAUTH_ENABLED === "true";
  res.json({
    googleOAuth: keysPresent && enabled,
  });
});

router.get("/google", (req, res, next) => {
  if (process.env.GOOGLE_OAUTH_ENABLED !== "true") {
    return res.status(503).json({ error: "Google sign-in is disabled. Use email and password." });
  }
  if (!config.googleClientId) {
    return res.status(503).json({ error: "Google OAuth not configured" });
  }
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${config.clientUrl}/login?error=google` }),
  async (req, res, next) => {
    try {
      const user = req.user as { id: string; email: string; role: string; name: string };
      await issueTokens(res, user);
      res.redirect(`${config.clientUrl}/dashboard`);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
