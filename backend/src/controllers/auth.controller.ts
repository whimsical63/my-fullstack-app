import { uuidv4, z } from "zod/v4";
import { createUserSchema, signInSchema } from "../schemas/user";
import { db } from "../database/db";
import { users, sessions } from "../database/schema";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config/env";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../helpers/authHelpers";

export const signUp: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the request body against the createUserSchema
    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
      const flattened = z.flattenError(result.error);

      res.status(400).json({
        errors: flattened.fieldErrors,
        message: "Validation failed",
      });
      return;
    }

    // Check if the user already exists by email
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, result.data.email))
      .limit(1);

    if (existingUser) {
      res.status(409).json({
        errors: {
          email: ["Email is already taken"],
        },
        message: "User already exists",
      });
      return;
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(result.data.password, 10);

    // Insert the new user into the database
    const [user] = await db
      .insert(users)
      .values({ ...result.data, password: hashedPassword })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });
    res.status(201).json({ user });
  } catch (error) {
    console.error("Error occurred during sign-up:", error);
    next(error);
  }
};

export const signIn: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Validate the request body against the signInSchema
    const result = signInSchema.safeParse(req.body);
    if (!result.success) {
      const flattened = z.flattenError(result.error);

      res.status(400).json({
        errors: flattened.fieldErrors,
        message: "Validation failed",
      });
      return;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      res.status(401).json({
        errors: { email: ["Invalid email or password"] },
        message: "Invalid email or password",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        errors: { password: ["Invalid email or password"] },
        message: "Invalid email or password",
      });
      return;
    }

    const accessToken = generateAccessToken(user.id);

    const sessionId = crypto.randomUUID(); // Generate a unique session ID

    const refreshToken = generateRefreshToken(user.id, sessionId);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      refreshToken,
      expiresAt,
    });

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        accessToken,
      });
  } catch (error) {
    console.error("Sign-in error:", error);
    next(error);
  }
};

export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(401).json({ message: "Refresh token missing" });
      return;
    }

    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET!) as {
      id: string;
      sessionId: string;
    };

    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, decoded.sessionId))
      .limit(1);

    if (
      !session ||
      session.refreshToken !== token ||
      session.revoked ||
      session.expiresAt < new Date()
    ) {
      // Clean up expired/revoked sessions
      if (session) {
        await db.delete(sessions).where(eq(sessions.id, decoded.sessionId));
      }
      res.status(403).json({ message: "Invalid or expired session" });
      return;
    }

    // Delete old session
    await db.delete(sessions).where(eq(sessions.id, decoded.sessionId));

    // Create new session + tokens
    const newSessionId = crypto.randomUUID();
    const newRefreshToken = generateRefreshToken(decoded.id, newSessionId);

    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({
      id: newSessionId,
      userId: decoded.id,
      refreshToken: newRefreshToken,
      expiresAt: newExpiresAt,
    });

    const newAccessToken = generateAccessToken(decoded.id);

    res
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const signOut: RequestHandler = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET!) as {
        sessionId: string;
      };
      // Mark session as revoked instead of deleting immediately
      await db
        .update(sessions)
        .set({ revoked: true })
        .where(eq(sessions.id, decoded.sessionId));
    } catch (err) {
      console.error("Logout failed to verify token:", err);
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
};
