import { z } from "zod";

const optionalHttpUrl = z
  .string()
  .trim()
  .max(255, "L’adresse est trop longue.")
  .refine((value) => {
    if (!value) return true;

    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Saisissez une adresse web valide avec https:// ou http://.");

const photoSchema = z
  .string()
  .max(410_000, "La photo dépasse la taille autorisée de 300 Ko.")
  .refine((value) => {
    if (!value) return true;

    const match =
      /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(
        value,
      );
    if (!match) return false;

    const encoded = match[1];
    const padding = encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0;
    return Math.floor((encoded.length * 3) / 4) - padding <= 300 * 1024;
  }, "La photo doit être une image valide de 300 Ko maximum.");

const optionalDate = z
  .string()
  .trim()
  .max(10, "La date saisie est invalide.")
  .refine((value) => {
    if (!value) return true;
    const timestamp = Date.parse(`${value}T00:00:00.000Z`);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
  }, "Saisissez une date valide.");

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Saisissez votre prénom.")
    .max(80, "Le prénom ne peut pas dépasser 80 caractères."),
  lastName: z
    .string()
    .trim()
    .min(1, "Saisissez votre nom.")
    .max(80, "Le nom ne peut pas dépasser 80 caractères."),
  postName: z.string().trim().max(80, "Le post-nom ne peut pas dépasser 80 caractères."),
  title: z
    .string()
    .trim()
    .max(120, "Le titre ne peut pas dépasser 120 caractères."),
  email: z
    .string()
    .trim()
    .email("Saisissez une adresse e-mail valide.")
    .max(254, "L’adresse e-mail est trop longue."),
  phone: z
    .string()
    .trim()
    .max(40, "Le numéro ne peut pas dépasser 40 caractères."),
  address: z.string().trim().max(255, "L’adresse ne peut pas dépasser 255 caractères."),
  city: z
    .string()
    .trim()
    .max(100, "La ville ne peut pas dépasser 100 caractères."),
  country: z
    .string()
    .trim()
    .max(100, "Le pays ne peut pas dépasser 100 caractères."),
  birthPlace: z.string().trim().max(150, "Le lieu de naissance ne peut pas dépasser 150 caractères."),
  birthDate: optionalDate,
  maritalStatus: z.string().trim().max(80, "La valeur est trop longue."),
  gender: z.string().trim().max(80, "La valeur est trop longue."),
  nationality: z.string().trim().max(100, "La nationalité ne peut pas dépasser 100 caractères."),
  website: optionalHttpUrl,
  linkedin: optionalHttpUrl,
  otherLink: optionalHttpUrl,
  summary: z
    .string()
    .trim()
    .max(600, "Le résumé ne peut pas dépasser 600 caractères."),
  photo: photoSchema,
});

export type ProfileInput = z.infer<typeof profileSchema>;
