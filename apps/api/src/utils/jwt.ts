import jwt from "jsonwebtoken";
import { config } from "../config.js";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtAccessSecret, { expiresIn: "15m" });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtAccessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
}
