import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import NewLetterForm from "@/components/letters/new-letter-form";
import { prisma } from "@/lib/prisma";
import { letterTypeSchema } from "@/lib/validations/letters";

export const instant = false;
export const metadata: Metadata = { title: "Nouvelle lettre" };

export default async function NewLetterPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { type } = await searchParams;
  const parsedType = letterTypeSchema.safeParse(type);
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  const skills = profile ? await prisma.skill.findMany({ where: { profileId: profile.id }, orderBy: { order: "asc" }, select: { id: true, name: true, category: true } }) : [];
  return <section className="mx-auto max-w-3xl space-y-5"><div><Link href="/letters" className="text-sm font-medium text-[#49634e] hover:underline">← Mes lettres</Link><p className="mt-5 text-sm font-medium text-[#6b876d]">Nouvelle lettre</p><h1 className="mt-2 text-3xl font-medium tracking-[-0.04em]">Préparer une candidature</h1><p className="mt-2 text-sm text-[#737b73]">Votre formation et votre dernière expérience seront reprises depuis votre profil.</p></div><NewLetterForm skills={skills} initialType={parsedType.success ? parsedType.data : undefined} /></section>;
}
