import { Request, Response, NextFunction } from "express";

const store = new Map<string, { body: unknown; expiresAt: number }>();
const TTL_MS = 60_000; // 1 minute for public catalog data

export function cacheJson(ttlMs = TTL_MS) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") {
      next();
      return;
    }
    const key = req.originalUrl;
    const hit = store.get(key);
    if (hit && hit.expiresAt > Date.now()) {
      res.setHeader("X-Cache", "HIT");
      res.json(hit.body);
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      store.set(key, { body, expiresAt: Date.now() + ttlMs });
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    };
    next();
  };
}
