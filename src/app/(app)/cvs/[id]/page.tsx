import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import CvEditor from "@/components/cv/cv-editor";
import { loadCvProfile } from "@/lib/cv-data";
import { prisma } from "@/lib/prisma";
import { parseCvSettings } from "@/lib/validations/cv-settings";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const session = await auth();
  if (!session?.user?.id) return { title: "Mon CV" };
  const { id } = await params;
  const cv = await prisma.cv.findFirst({ where: { id, userId: session.user.id }, select: { title: true } });
  return { title: cv?.title ?? "Mon CV" };
}

export default async function CvEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const cv = await prisma.cv.findFirst({ where: { id, userId: session.user.id } });
  if (!cv) notFound();

  const profile = await loadCvProfile(session.user.id);
  if (!profile) notFound();
  const template = cv.template === "CREATIVE" ? "CLASSIC" : cv.template;
  const settings = parseCvSettings(cv.settings, template);

  return <CvEditor id={cv.id} title={cv.title} profile={profile} initialSettings={settings} />;
}
