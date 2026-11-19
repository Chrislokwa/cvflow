import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import LetterEditor from "@/components/letters/letter-editor";
import { prisma } from "@/lib/prisma";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const session = await auth();
  if (!session?.user?.id) return { title: "Ma lettre" };
  const { id } = await params;
  const letter = await prisma.coverLetter.findFirst({ where: { id, userId: session.user.id }, select: { title: true } });
  return { title: letter?.title ?? "Ma lettre" };
}

export default async function LetterEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const letter = await prisma.coverLetter.findFirst({ where: { id, userId: session.user.id } });
  if (!letter) notFound();
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id }, select: { firstName: true, lastName: true, postName: true, email: true, phone: true, address: true, city: true, country: true } });
  if (!profile) notFound();

  return <LetterEditor letter={{ id: letter.id, type: letter.type, title: letter.title, company: letter.company, position: letter.position, recruiterName: letter.recruiterName, city: letter.city, createdAt: letter.createdAt.toISOString(), content: letter.content }} sender={profile} />;
}
