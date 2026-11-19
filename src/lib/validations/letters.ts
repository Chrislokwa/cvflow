import { z } from "zod";

export const letterTypeSchema = z.enum(["APPLICATION", "INTERNSHIP", "UNSOLICITED", "INTERNSHIP_UNSOLICITED"]);
export const letterToneSchema = z.enum(["FORMAL", "DYNAMIC", "ACADEMIC"]);

const optionalText = (max: number) => z.string().trim().max(max);

export const generateLetterSchema = z.object({
  type: letterTypeSchema,
  tone: letterToneSchema,
  position: z.string().trim().min(1, "Indiquez le poste visé.").max(120),
  company: z.string().trim().min(1, "Indiquez l’entreprise.").max(120),
  recruiterName: optionalText(100),
  city: optionalText(100),
  motivation: optionalText(500).refine((value) => {
    if (!value) return true;
    const sentences = value.split(/[.!?]+/).filter((sentence) => sentence.trim());
    return sentences.length >= 1 && sentences.length <= 3;
  }, "La motivation doit contenir de 1 à 3 phrases."),
  skillIds: z.array(z.string().trim().min(1)).length(3, "Choisissez exactement 3 compétences.").refine((ids) => new Set(ids).size === 3, "Choisissez trois compétences différentes."),
});

export const saveLetterContentSchema = z.string().trim().min(1, "Le contenu de la lettre ne peut pas être vide.").max(12000, "Le contenu dépasse la longueur autorisée.");

export type GenerateLetterInput = z.infer<typeof generateLetterSchema>;
export type LetterType = z.infer<typeof letterTypeSchema>;
export type LetterTone = z.infer<typeof letterToneSchema>;

export const letterTypeLabels: Record<LetterType, string> = {
  APPLICATION: "Emploi",
  INTERNSHIP: "Stage",
  UNSOLICITED: "Candidature spontanée",
  INTERNSHIP_UNSOLICITED: "Stage – candidature spontanée",
};

export const letterToneLabels: Record<LetterTone, string> = {
  FORMAL: "Formel",
  DYNAMIC: "Dynamique",
  ACADEMIC: "Académique",
};
