import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config/env";
import { db } from "../database/db";
import { sessions } from "../database/schema";
import { lt } from "drizzle-orm";

export function generateAccessToken(userId: string) {
  return jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET!, { expiresIn: "15m" });
}

export function generateRefreshToken(userId: string, sessionId: string) {
  return jwt.sign({ id: userId, sessionId }, REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
}

export async function cleanupExpiredSessions() {
  try {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
    console.log("Cleaned up expired sessions");
  } catch (error) {
    console.error("Failed to cleanup expired sessions:", error);
  }
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET!) as { id: string };
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET!) as {
      id: string;
      sessionId: string;
    };
  } catch (error) {
    return null;
  }
}
