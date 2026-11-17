import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Tableau de bord — CVFlow",
};

export const instant = false;

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { firstName: true },
  });
  const firstName = profile?.firstName.trim();
  const greetingName = firstName || session.user.email || "";

  return (
    <section className="rounded-2xl border border-[#e5e9e2] bg-white p-6 shadow-sm sm:p-10">
      <p className="text-sm font-medium text-[#6b876d]">Votre espace CVFlow</p>
      <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
        Bienvenue{greetingName ? `, ${greetingName}` : ""}.
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#737b73] sm:text-base">
        Votre espace est prêt. Vous pourrez bientôt y organiser votre profil,
        vos CV et vos lettres de motivation.
      </p>
    </section>
  );
}
