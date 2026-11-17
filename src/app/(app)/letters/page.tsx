import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LetterLibrary from "@/components/letters/letter-library";
import type { LetterLibraryItem } from "@/components/letters/letter-library";
import { prisma } from "@/lib/prisma";

export const instant = false;
export const metadata: Metadata = { title: "Mes lettres", description: "Créez et gérez vos lettres de motivation." };

export default async function LettersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const letters = await prisma.coverLetter.findMany({ where: { userId: session.user.id }, orderBy: { updatedAt: "desc" }, select: { id: true, title: true, type: true, tone: true, company: true, position: true, updatedAt: true } });
  const items: LetterLibraryItem[] = letters.map((letter) => ({ ...letter, updatedAt: letter.updatedAt.toISOString() }));
  return <LetterLibrary items={items} />;
}
