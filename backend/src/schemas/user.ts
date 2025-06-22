import { z } from "zod/v4";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email().min(5, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const signInSchema = z.object({
  email: z.email().min(5, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type SignInSchema = z.infer<typeof signInSchema>;
