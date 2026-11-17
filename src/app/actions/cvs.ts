"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cvSettingsSchema, cvTemplateSchema, defaultCvSettings, parseCvSettings } from "@/lib/validations/cv-settings";
import type { CvSettings } from "@/lib/validations/cv-settings";
import { z } from "zod";

const cvIdSchema = z.string().trim().min(1).max(64);
const titleSchema = z.string().trim().min(1, "Saisissez un titre.").max(80, "Le titre ne peut pas dépasser 80 caractères.");
const createSchema = z.object({ title: titleSchema, template: cvTemplateSchema });

type ActionResult = { success: true; id?: string } | { success: false; message: string };

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

function jsonSettings(settings: CvSettings): Prisma.InputJsonObject {
  return {
    ...settings,
    visibleSections: [...settings.visibleSections],
    sectionOrder: [...settings.sectionOrder],
  };
}

export async function createCv(input: { title: string; template: string }): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, message: "Votre session a expiré. Reconnectez-vous." };
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Vérifiez le titre du CV." };

  const settings = { ...defaultCvSettings, template: parsed.data.template };
  const cv = await prisma.cv.create({ data: { userId, title: parsed.data.title, template: parsed.data.template, settings: jsonSettings(settings) }, select: { id: true } });
  revalidatePath("/cvs");
  return { success: true, id: cv.id };
}

export async function renameCv(id: string, title: string): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, message: "Votre session a expiré. Reconnectez-vous." };
  const parsedId = cvIdSchema.safeParse(id);
  const parsedTitle = titleSchema.safeParse(title);
  if (!parsedId.success) return { success: false, message: "Ce CV est introuvable." };
  if (!parsedTitle.success) return { success: false, message: parsedTitle.error.issues[0]?.message ?? "Vérifiez le titre." };

  const result = await prisma.cv.updateMany({ where: { id: parsedId.data, userId }, data: { title: parsedTitle.data } });
  if (result.count === 0) return { success: false, message: "Ce CV est introuvable." };
  revalidatePath("/cvs");
  revalidatePath(`/cvs/${parsedId.data}`);
  return { success: true };
}

export async function duplicateCv(id: string): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, message: "Votre session a expiré. Reconnectez-vous." };
  const parsedId = cvIdSchema.safeParse(id);
  if (!parsedId.success) return { success: false, message: "Ce CV est introuvable." };
  const source = await prisma.cv.findFirst({ where: { id: parsedId.data, userId } });
  if (!source) return { success: false, message: "Ce CV est introuvable." };

  const settings = parseCvSettings(source.settings, source.template === "CREATIVE" ? "CLASSIC" : source.template);
  const copy = await prisma.cv.create({ data: { userId, title: titleSchema.parse(`${source.title} (copie)`.slice(0, 80)), template: source.template === "CREATIVE" ? "CLASSIC" : source.template, settings: jsonSettings(settings) }, select: { id: true } });
  revalidatePath("/cvs");
  return { success: true, id: copy.id };
}

export async function deleteCv(id: string): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, message: "Votre session a expiré. Reconnectez-vous." };
  const parsedId = cvIdSchema.safeParse(id);
  if (!parsedId.success) return { success: false, message: "Ce CV est introuvable." };
  const result = await prisma.cv.deleteMany({ where: { id: parsedId.data, userId } });
  if (result.count === 0) return { success: false, message: "Ce CV est introuvable." };
  revalidatePath("/cvs");
  return { success: true };
}

export async function saveCvSettings(id: string, input: unknown): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, message: "Votre session a expiré. Reconnectez-vous." };
  const parsedId = cvIdSchema.safeParse(id);
  const parsedSettings = cvSettingsSchema.safeParse(input);
  if (!parsedId.success || !parsedSettings.success) return { success: false, message: "Les réglages ne sont pas valides." };

  const result = await prisma.cv.updateMany({
    where: { id: parsedId.data, userId },
    data: { template: parsedSettings.data.template, settings: jsonSettings(parsedSettings.data) },
  });
  if (result.count === 0) return { success: false, message: "Ce CV est introuvable." };
  revalidatePath("/cvs");
  return { success: true };
}
