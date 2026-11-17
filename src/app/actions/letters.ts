"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { generateLetterText } from "@/lib/letter-templates";
import { prisma } from "@/lib/prisma";
import { generateLetterSchema, saveLetterContentSchema } from "@/lib/validations/letters";
import { z } from "zod";

const letterIdSchema = z.string().trim().min(1).max(64);

export type LetterActionResult = { success: true; id?: string } | { success: false; message: string };

async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

function safeTitle(value: string): string { return value.slice(0, 150); }

export async function generateAndCreateLetter(input: unknown): Promise<LetterActionResult> {
  const userId = await currentUserId();
  if (!userId) return { success: false, message: "Votre session a expiré. Reconnectez-vous." };

  const parsed = generateLetterSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Vérifiez les informations de la lettre." };

  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      education: { orderBy: { order: "asc" } },
      experiences: { orderBy: { order: "asc" } },
    },
  });
  if (!profile) return { success: false, message: "Complétez votre profil avant de générer une lettre." };

  const skills = await prisma.skill.findMany({
    where: { id: { in: parsed.data.skillIds }, profile: { userId } },
    select: { id: true, name: true },
  });
  if (skills.length !== 3) return { success: false, message: "Certaines compétences sélectionnées ne sont plus disponibles." };

  const education = [...profile.education].sort((a, b) => (b.startDate?.getTime() ?? 0) - (a.startDate?.getTime() ?? 0))[0];
  const experience = [...profile.experiences].sort((a, b) => (b.startDate?.getTime() ?? 0) - (a.startDate?.getTime() ?? 0))[0];
  const text = generateLetterText(parsed.data, {
    skills: parsed.data.skillIds.map((id) => skills.find((skill) => skill.id === id)?.name ?? ""),
    education: education ? [education.degree, education.field, education.institution].filter(Boolean).join(" en ") : "",
    experience: experience ? [experience.position, experience.company].filter(Boolean).join(" chez ") : "",
  });
  const title = safeTitle(`Lettre – ${parsed.data.position} – ${parsed.data.company}`);

  const letter = await prisma.coverLetter.create({
    data: {
      userId,
      title,
      type: parsed.data.type,
      tone: parsed.data.tone,
      company: parsed.data.company,
      position: parsed.data.position,
      recruiterName: parsed.data.recruiterName,
      city: parsed.data.city,
      content: text,
    },
    select: { id: true },
  });
  revalidatePath("/letters");
  return { success: true, id: letter.id };
}

export async function duplicateLetter(id: string): Promise<LetterActionResult> {
  const userId = await currentUserId();
  if (!userId) return { success: false, message: "Votre session a expiré. Reconnectez-vous." };
  const parsedId = letterIdSchema.safeParse(id);
  if (!parsedId.success) return { success: false, message: "Cette lettre est introuvable." };

  const source = await prisma.coverLetter.findFirst({ where: { id: parsedId.data, userId } });
  if (!source) return { success: false, message: "Cette lettre est introuvable." };
  const copy = await prisma.coverLetter.create({
    data: { userId, title: safeTitle(`${source.title} (copie)`), type: source.type, tone: source.tone, company: source.company, position: source.position, recruiterName: source.recruiterName, city: source.city, content: source.content },
    select: { id: true },
  });
  revalidatePath("/letters");
  return { success: true, id: copy.id };
}

export async function deleteLetter(id: string): Promise<LetterActionResult> {
  const userId = await currentUserId();
  if (!userId) return { success: false, message: "Votre session a expiré. Reconnectez-vous." };
  const parsedId = letterIdSchema.safeParse(id);
  if (!parsedId.success) return { success: false, message: "Cette lettre est introuvable." };
  const result = await prisma.coverLetter.deleteMany({ where: { id: parsedId.data, userId } });
  if (result.count === 0) return { success: false, message: "Cette lettre est introuvable." };
  revalidatePath("/letters");
  return { success: true };
}

export async function saveLetterContent(id: string, content: unknown): Promise<LetterActionResult> {
  const userId = await currentUserId();
  if (!userId) return { success: false, message: "Votre session a expiré. Reconnectez-vous." };
  const parsedId = letterIdSchema.safeParse(id);
  const parsedContent = saveLetterContentSchema.safeParse(content);
  if (!parsedId.success) return { success: false, message: "Cette lettre est introuvable." };
  if (!parsedContent.success) return { success: false, message: parsedContent.error.issues[0]?.message ?? "Le contenu de la lettre est invalide." };

  const result = await prisma.coverLetter.updateMany({ where: { id: parsedId.data, userId }, data: { content: parsedContent.data } });
  if (result.count === 0) return { success: false, message: "Cette lettre est introuvable." };
  revalidatePath(`/letters/${parsedId.data}`);
  revalidatePath("/letters");
  return { success: true };
}
