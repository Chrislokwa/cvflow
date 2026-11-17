import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Saisissez une adresse e-mail valide.")
  .max(254, "L’adresse e-mail est trop longue.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Saisissez votre mot de passe.").max(1024, "Le mot de passe est trop long."),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
      .max(1024, "Le mot de passe est trop long.")
      .refine((value) => new TextEncoder().encode(value).length <= 72, "Le mot de passe ne peut pas dépasser 72 octets."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
