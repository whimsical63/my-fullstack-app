import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const { PORT, NODE_ENV, FRONTEND_URL, DATABASE_URL, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;
