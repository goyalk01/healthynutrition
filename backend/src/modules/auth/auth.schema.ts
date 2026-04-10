import { z } from "zod";

const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z
    .string()
    .regex(
      passwordPattern,
      "Password must be at least 8 characters and include 1 uppercase letter and 1 number",
    ),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().min(1, "ID is required"),
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
