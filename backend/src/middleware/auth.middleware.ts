// auth.middleware.ts
import { RequestHandler } from "express";
import { verifyAccessToken } from "../helpers/authHelpers";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing authorization token" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }

  req.user = decoded;
  next();
};
