import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { IdentityForm } from "@/components/profile/identity-form";
import { prisma } from "@/lib/prisma";
import type { ProfileInput } from "@/lib/validations/profile";

export const metadata: Metadata = {
  title: "Mon profil — CVFlow",
};

export const instant = false;

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  const initialValues: ProfileInput = {
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    title: profile?.title ?? "",
    email: profile?.email || session.user.email || "",
    phone: profile?.phone ?? "",
    city: profile?.city ?? "",
    country: profile?.country ?? "",
    website: profile?.website ?? "",
    linkedin: profile?.linkedin ?? "",
    github: profile?.github ?? "",
    summary: profile?.summary ?? "",
    photo: profile?.photo ?? "",
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-[#6b876d]">Mon espace</p>
        <h1 className="mt-2 text-3xl font-medium tracking-[-0.04em]">
          Mon profil
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737b73]">
          Renseignez les informations qui serviront de base à vos CV et lettres
          de motivation.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Sections du profil"
        className="flex gap-1 overflow-x-auto rounded-xl border border-[#e5e9e2] bg-white p-1.5 shadow-sm"
      >
        <button
          id="tab-identity"
          type="button"
          role="tab"
          aria-selected="true"
          aria-controls="panel-identity"
          className="shrink-0 rounded-lg bg-[#285c46] px-4 py-2.5 text-sm font-medium text-white"
        >
          Identité
        </button>
        {[
          "Formations",
          "Expériences",
          "Compétences",
          "Langues",
          "Projets",
          "Certifications",
          "Intérêts",
        ].map((label) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected="false"
            disabled
            title="Bientôt"
            className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#899189] disabled:cursor-not-allowed"
          >
            {label}
            <span className="rounded-full bg-[#f0f2ef] px-2 py-0.5 text-[10px] font-medium text-[#747d74]">
              Bientôt
            </span>
          </button>
        ))}
      </div>

      <section
        id="panel-identity"
        role="tabpanel"
        aria-labelledby="tab-identity"
        className="rounded-2xl border border-[#e5e9e2] bg-white p-5 shadow-sm sm:p-8"
      >
        <IdentityForm initialValues={initialValues} />
      </section>
    </div>
  );
}
