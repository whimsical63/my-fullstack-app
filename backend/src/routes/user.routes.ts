import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { dashboard, getCurrentUser } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/me", authenticate, getCurrentUser);
userRouter.get("/:id", authenticate, dashboard);

export default userRouter;
