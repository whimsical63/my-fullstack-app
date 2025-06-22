import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT, FRONTEND_URL } from "./config/env";
import { cleanupExpiredSessions } from "./helpers/authHelpers";

import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";

const app = express();

// Allow cross-origin requests and frontend to call API
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true, // Allow credentials if needed
  })
);
app.use(express.json());
app.use(cookieParser()); // Add cookie parser middleware

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.get("/", async (req, res) => {
  res.send({
    title: "Welcome to the API",
    description: "This is the backend API for the application.",
  });
});

// Clean up expired sessions every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000); // 1 hour

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  // Initial cleanup on startup
  cleanupExpiredSessions();
});
