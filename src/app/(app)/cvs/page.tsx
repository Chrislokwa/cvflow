import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CvLibrary from "@/components/cv/cv-library";
import { prisma } from "@/lib/prisma";
import type { CvLibraryItem } from "@/components/cv/cv-library";

export const instant = false;
export const metadata: Metadata = { title: "Mes CV", description: "Créez et gérez vos CV." };

export default async function CvsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const cvs = await prisma.cv.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, template: true, updatedAt: true },
  });
  const items: CvLibraryItem[] = cvs.map((cv) => ({
    id: cv.id,
    title: cv.title,
    template: cv.template === "MODERN" || cv.template === "MINIMAL" ? cv.template : "CLASSIC",
    updatedAt: cv.updatedAt.toISOString(),
  }));

  return (
    <section className="space-y-6">
      <header><p className="text-sm font-medium text-[#6b876d]">Mes documents</p><h1 className="mt-2 text-3xl font-medium tracking-[-0.04em]">Mes CV</h1><p className="mt-2 text-sm text-[#737b73]">Créez plusieurs versions et adaptez leur présentation à chaque candidature.</p></header>
      <CvLibrary items={items} />
    </section>
  );
}
