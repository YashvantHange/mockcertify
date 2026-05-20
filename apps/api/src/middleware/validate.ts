import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validate(schema: ZodSchema, source: "body" | "query" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(source === "body" ? req.body : req.query);
    if (!result.success) {
      next(result.error);
      return;
    }
    if (source === "body") req.body = result.data;
    else Object.assign(req.query, result.data);
    next();
  };
}
