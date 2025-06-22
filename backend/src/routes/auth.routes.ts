import { Router } from "express";
import {
  signIn,
  signUp,
  signOut,
  refreshToken,
} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-out", signOut);
authRouter.post("/refresh", refreshToken);

export default authRouter;
