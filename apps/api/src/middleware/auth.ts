import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { unauthorized, forbidden } from "../utils/errors";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
      name: string;
    }
  }
}

export type AuthRequest = Request;

export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const token =
      req.cookies?.access_token ??
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) throw unauthorized();

    const payload = verifyAccessToken(token);
    // Trust JWT payload — avoids a DB round-trip on every authenticated request
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name ?? payload.email.split("@")[0],
    };
    next();
  } catch {
    next(unauthorized());
  }
}

export function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    next(forbidden("Admin access required"));
    return;
  }
  next();
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;
  if (!token) {
    next();
    return;
  }
  authenticate(req, _res, next).catch(() => next());
}
