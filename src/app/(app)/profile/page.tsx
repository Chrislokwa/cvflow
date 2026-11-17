import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { IdentityForm } from "@/components/profile/identity-form";
import { InterestTags } from "@/components/profile/interest-tags";
import { ProfileSectionList } from "@/components/profile/profile-section-list";
import type { ProfileSectionItem } from "@/lib/profile-section-types";
import { prisma } from "@/lib/prisma";
import type { ProfileInput } from "@/lib/validations/profile";
import type { ProfileItemKind } from "@/lib/validations/profile-sections";
import { languageLevels } from "@/lib/validations/profile-sections";

export const metadata: Metadata = {
  title: "Mon profil — CVFlow",
};

export const instant = false;

const profileSections = [
  { id: "identity", label: "Identité" },
  { id: "education", label: "Formations" },
  { id: "experience", label: "Expériences" },
  { id: "skill", label: "Compétences" },
  { id: "language", label: "Langues" },
  { id: "project", label: "Projets" },
  { id: "certification", label: "Certifications" },
  { id: "interests", label: "Intérêts" },
] as const;

type ProfileSectionId = (typeof profileSections)[number]["id"];
type ProfilePageProps = {
  searchParams: Promise<{ section?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  await connection();
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const selectedSection = getSectionId(params.section);
  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: { user: { connect: { id: session.user.id } } },
    update: {},
    select: { id: true },
  });

  const profileDetails =
    selectedSection === "identity"
      ? await prisma.profile.findUnique({ where: { id: profile.id } })
      : null;
  const initialValues: ProfileInput = {
    firstName: profileDetails?.firstName ?? "",
    lastName: profileDetails?.lastName ?? "",
    postName: profileDetails?.postName ?? "",
    title: profileDetails?.title ?? "",
    email: profileDetails?.email || session.user.email || "",
    phone: profileDetails?.phone ?? "",
    address: profileDetails?.address ?? "",
    city: profileDetails?.city ?? "",
    country: profileDetails?.country ?? "",
    birthPlace: profileDetails?.birthPlace ?? "",
    birthDate: profileDetails?.birthDate?.toISOString().slice(0, 10) ?? "",
    maritalStatus: profileDetails?.maritalStatus ?? "",
    gender: profileDetails?.gender ?? "",
    nationality: profileDetails?.nationality ?? "",
    website: profileDetails?.website ?? "",
    linkedin: profileDetails?.linkedin ?? "",
    otherLink: profileDetails?.otherLink ?? "",
    summary: profileDetails?.summary ?? "",
    photo: profileDetails?.photo ?? "",
  };
  const interests =
    selectedSection === "interests"
      ? ((
          await prisma.profile.findUnique({
            where: { id: profile.id },
            select: { interests: true },
          })
        )?.interests ?? [])
      : [];

  const items = isListSection(selectedSection)
    ? await getProfileItems(profile.id, selectedSection)
    : [];

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

      <nav
        role="tablist"
        aria-label="Sections du profil"
        className="flex gap-1 overflow-x-auto rounded-xl border border-[#e5e9e2] bg-white p-1.5 shadow-sm"
      >
        {profileSections.map((section) => {
          const selected = section.id === selectedSection;
          const href =
            section.id === "identity"
              ? "/profile"
              : `/profile?section=${section.id}`;

          return (
            <Link
              key={section.id}
              id={`tab-${section.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${section.id}`}
              href={href}
              className={`shrink-0 rounded-lg px-3.5 py-2.5 text-sm font-medium transition sm:px-4 ${
                selected
                  ? "bg-[#285c46] text-white"
                  : "text-[#667066] hover:bg-[#f1f4ef] hover:text-[#285c46]"
              }`}
            >
              {section.label}
            </Link>
          );
        })}
      </nav>

      <section
        id={`panel-${selectedSection}`}
        role="tabpanel"
        aria-labelledby={`tab-${selectedSection}`}
        className="rounded-2xl border border-[#e5e9e2] bg-white p-5 shadow-sm sm:p-8"
      >
        {selectedSection === "identity" && (
          <IdentityForm initialValues={initialValues} />
        )}
        {isListSection(selectedSection) && (
          <ProfileSectionList kind={selectedSection} items={items} />
        )}
        {selectedSection === "interests" && (
          <InterestTags initialItems={interests} />
        )}
      </section>
    </div>
  );
}

function getSectionId(value?: string): ProfileSectionId {
  const section = profileSections.find((candidate) => candidate.id === value);
  return section?.id ?? "identity";
}

function isListSection(section: ProfileSectionId): section is ProfileItemKind {
  return section !== "identity" && section !== "interests";
}

function toDateInput(date: Date | null): string {
  return date?.toISOString().slice(0, 10) ?? "";
}

function toLanguageLevel(value: string): (typeof languageLevels)[number] {
  return languageLevels.find((level) => level === value) ?? "A1";
}

async function getProfileItems(
  profileId: string,
  kind: ProfileItemKind,
): Promise<ProfileSectionItem[]> {
  switch (kind) {
    case "education": {
      const items = await prisma.education.findMany({
        where: { profileId },
        orderBy: [{ order: "asc" }, { id: "asc" }],
      });
      return items.map((item) => ({
        kind,
        id: item.id,
        order: item.order,
        degree: item.degree,
        institution: item.institution,
        city: item.city,
        startDate: toDateInput(item.startDate),
        endDate: toDateInput(item.endDate),
        current: item.current,
        description: item.description,
      }));
    }
    case "experience": {
      const items = await prisma.experience.findMany({
        where: { profileId },
        orderBy: [{ order: "asc" }, { id: "asc" }],
      });
      return items.map((item) => ({
        kind,
        id: item.id,
        order: item.order,
        position: item.position,
        company: item.company,
        city: item.city,
        startDate: toDateInput(item.startDate),
        endDate: toDateInput(item.endDate),
        current: item.current,
        bullets: item.bullets,
      }));
    }
    case "skill": {
      const items = await prisma.skill.findMany({
        where: { profileId },
        orderBy: [{ order: "asc" }, { id: "asc" }],
      });
      return items.map((item) => ({
        kind,
        id: item.id,
        order: item.order,
        name: item.name,
        level: item.level,
        category: item.category,
      }));
    }
    case "language": {
      const items = await prisma.language.findMany({
        where: { profileId },
        orderBy: [{ order: "asc" }, { id: "asc" }],
      });
      return items.map((item) => ({
        kind,
        id: item.id,
        order: item.order,
        name: item.name,
        level: toLanguageLevel(item.level),
      }));
    }
    case "project": {
      const items = await prisma.project.findMany({
        where: { profileId },
        orderBy: [{ order: "asc" }, { id: "asc" }],
      });
      return items.map((item) => ({
        kind,
        id: item.id,
        order: item.order,
        name: item.name,
        description: item.description,
        url: item.url,
      }));
    }
    case "certification": {
      const items = await prisma.certification.findMany({
        where: { profileId },
        orderBy: [{ order: "asc" }, { id: "asc" }],
      });
      return items.map((item) => ({
        kind,
        id: item.id,
        order: item.order,
        name: item.name,
        issuer: item.issuer,
        year: item.issueDate?.getUTCFullYear().toString() ?? "",
      }));
    }
  }
}
