import { Request, Response, NextFunction, RequestHandler } from "express";
import { db } from "../database/db";
import { users } from "../database/schema";
import { eq } from "drizzle-orm";

export const dashboard: RequestHandler = (req, res) => {
  res.send({ title: "User Profile", id: req.params.id });
};

export const getCurrentUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching current user:", error);
    next(error);
  }
};
