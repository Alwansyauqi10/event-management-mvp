import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.email("Email tidak valid"),
  password: z
    .string()
    .min(6, { error: "Passowrd must be at least 6 character" })
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, {
      message: "Must containt at least code one special character",
    }),
  phone: z.string().min(1, "Phone wajib diisi"),
});

export const loginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z
    .string()
    .min(6, { error: "Passowrd must be at least 6 character" })
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, {
      message: "Must containt at least code one special character",
    }),
});
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
});


export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
