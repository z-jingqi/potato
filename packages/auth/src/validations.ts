import { z } from "zod"

/**
 * Registration schema - username and password required
 */
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Username can only contain letters and numbers"
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/,
      "Password can only contain letters, numbers, and symbols"
    ),
  email: z
    .string()
    .email("Invalid email address")
    .optional(),
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(50, "Name must be at most 50 characters")
    .optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>

/**
 * Login schema supporting both username and email
 */
export const loginSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>
