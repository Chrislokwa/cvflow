import { z } from "zod";

function isValidDate(value: string): boolean {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

const dateField = z.string().refine(isValidDate, "Saisissez une date valide.");
const optionalUrl = z
  .string()
  .trim()
  .max(255, "Le lien ne peut pas dépasser 255 caractères.")
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Saisissez un lien valide avec https:// ou http://.");

const dateRangeIsValid = (startDate: string, endDate: string) =>
  !startDate || !endDate || endDate >= startDate;

export const educationSchema = z
  .object({
    kind: z.literal("education"),
    id: z.string().min(1).optional(),
    degree: z.string().trim().min(1, "Saisissez le diplôme.").max(160),
    institution: z
      .string()
      .trim()
      .min(1, "Saisissez l’établissement.")
      .max(160),
    city: z.string().trim().max(100),
    startDate: dateField,
    endDate: dateField,
    current: z.boolean(),
    description: z.string().trim().max(3000),
  })
  .refine((values) => dateRangeIsValid(values.startDate, values.endDate), {
    path: ["endDate"],
    message: "La date de fin doit être postérieure à la date de début.",
  })
  .refine((values) => !values.current || !values.endDate, {
    path: ["endDate"],
    message: "Une formation en cours ne peut pas avoir de date de fin.",
  });

export const experienceSchema = z
  .object({
    kind: z.literal("experience"),
    id: z.string().min(1).optional(),
    position: z.string().trim().min(1, "Saisissez le poste.").max(160),
    company: z.string().trim().min(1, "Saisissez l’organisation.").max(160),
    city: z.string().trim().max(100),
    startDate: dateField,
    endDate: dateField,
    current: z.boolean(),
    bulletsText: z
      .string()
      .max(8000, "La description ne peut pas dépasser 8 000 caractères.")
      .refine(
        (value) =>
          value
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean).length <= 30,
        "Saisissez 30 puces maximum.",
      )
      .refine(
        (value) =>
          value.split(/\r?\n/).every((line) => line.trim().length <= 500),
        "Chaque puce est limitée à 500 caractères.",
      ),
  })
  .refine((values) => dateRangeIsValid(values.startDate, values.endDate), {
    path: ["endDate"],
    message: "La date de fin doit être postérieure à la date de début.",
  })
  .refine((values) => !values.current || !values.endDate, {
    path: ["endDate"],
    message: "Une expérience en cours ne peut pas avoir de date de fin.",
  });

export const skillSchema = z.object({
  kind: z.literal("skill"),
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1, "Saisissez une compétence.").max(100),
  level: z.number().int().min(1).max(5),
  category: z.string().trim().max(100),
});

export const languageLevels = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "Langue maternelle",
] as const;

export const languageSchema = z.object({
  kind: z.literal("language"),
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1, "Saisissez une langue.").max(80),
  level: z.enum(languageLevels),
});

export const projectSchema = z.object({
  kind: z.literal("project"),
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1, "Saisissez le nom du projet.").max(160),
  description: z.string().trim().max(3000),
  url: optionalUrl,
});

export const certificationSchema = z.object({
  kind: z.literal("certification"),
  id: z.string().min(1).optional(),
  name: z
    .string()
    .trim()
    .min(1, "Saisissez le nom de la certification.")
    .max(160),
  issuer: z.string().trim().max(160),
  year: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^\d{4}$/.test(value),
      "Saisissez une année sur quatre chiffres.",
    )
    .refine(
      (value) => !value || (Number(value) >= 1900 && Number(value) <= 2200),
      "Saisissez une année valide.",
    ),
});

export const profileItemSchema = z.discriminatedUnion("kind", [
  educationSchema,
  experienceSchema,
  skillSchema,
  languageSchema,
  projectSchema,
  certificationSchema,
]);

export const profileItemKindSchema = z.enum([
  "education",
  "experience",
  "skill",
  "language",
  "project",
  "certification",
]);

export const interestsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Un intérêt ne peut pas être vide.")
      .max(50, "Un intérêt ne peut pas dépasser 50 caractères."),
  )
  .max(30, "Ajoutez 30 centres d’intérêt maximum.")
  .refine(
    (items) =>
      new Set(items.map((item) => item.toLocaleLowerCase())).size ===
      items.length,
    "Chaque centre d’intérêt doit être unique.",
  );

export const interestInputSchema = z.object({
  interest: z
    .string()
    .trim()
    .min(1, "Saisissez un centre d’intérêt.")
    .max(50, "Un centre d’intérêt ne peut pas dépasser 50 caractères."),
});

export type EducationInput = z.infer<typeof educationSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type LanguageInput = z.infer<typeof languageSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type ProfileItemInput = z.infer<typeof profileItemSchema>;
export type ProfileItemKind = z.infer<typeof profileItemKindSchema>;
