import { z } from "zod";

export const cvTemplateSchema = z.enum(["CLASSIC", "MODERN", "MINIMAL"]);
export const cvSectionSchema = z.enum([
  "identity",
  "summary",
  "education",
  "experiences",
  "skills",
  "languages",
  "projects",
  "certifications",
  "interests",
]);
export const cvFontSchema = z.enum(["roboto", "lora", "merriweather"]);

export const cvSettingsSchema = z
  .object({
    template: cvTemplateSchema,
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choisissez une couleur valide."),
    fontFamily: cvFontSchema,
    visibleSections: z.array(cvSectionSchema).max(9),
    sectionOrder: z.array(cvSectionSchema).length(9),
    showPhoto: z.boolean(),
  })
  .superRefine((settings, context) => {
    if (new Set(settings.visibleSections).size !== settings.visibleSections.length) {
      context.addIssue({ code: "custom", path: ["visibleSections"], message: "Les sections visibles contiennent un doublon." });
    }
    if (new Set(settings.sectionOrder).size !== settings.sectionOrder.length) {
      context.addIssue({ code: "custom", path: ["sectionOrder"], message: "L’ordre des sections contient un doublon." });
    }
  });

export const cvSectionKeys = cvSectionSchema.options;
export type CvSettings = z.infer<typeof cvSettingsSchema>;
export type CvSection = z.infer<typeof cvSectionSchema>;
export type CvTemplateKey = z.infer<typeof cvTemplateSchema>;

export const cvTemplateNames: Record<CvTemplateKey, string> = {
  CLASSIC: "Classique",
  MODERN: "Moderne",
  MINIMAL: "Minimal",
};

export const defaultCvSettings: CvSettings = {
  template: "CLASSIC",
  accentColor: "#2869a7",
  fontFamily: "roboto",
  visibleSections: [...cvSectionKeys],
  sectionOrder: [...cvSectionKeys],
  showPhoto: true,
};

export function parseCvSettings(value: unknown, fallbackTemplate: CvSettings["template"] = "CLASSIC"): CvSettings {
  const record = typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const merged = { ...defaultCvSettings, ...record, template: fallbackTemplate };
  const parsed = cvSettingsSchema.safeParse(merged);
  return parsed.success ? parsed.data : { ...defaultCvSettings, template: fallbackTemplate };
}
