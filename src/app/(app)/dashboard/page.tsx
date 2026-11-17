import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Tableau de bord", description: "Retrouvez la progression de votre profil, vos CV et vos lettres récentes." };
export const instant = false;

const profileSections = [
  { id: "identity", label: "Identité", href: "/profile?section=identity" },
  { id: "education", label: "Formations", href: "/profile?section=education" },
  { id: "experience", label: "Expériences", href: "/profile?section=experience" },
  { id: "skill", label: "Compétences", href: "/profile?section=skill" },
  { id: "language", label: "Langues", href: "/profile?section=language" },
  { id: "project", label: "Projets", href: "/profile?section=project" },
  { id: "certification", label: "Certifications", href: "/profile?section=certification" },
  { id: "interests", label: "Intérêts", href: "/profile?section=interests" },
] as const;

function dateLabel(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [profile, cvs, letters] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id }, select: {
      firstName: true, lastName: true, title: true, email: true,
      education: { select: { id: true }, take: 1 }, experiences: { select: { id: true }, take: 1 },
      skills: { select: { id: true }, take: 1 }, languages: { select: { id: true }, take: 1 },
      projects: { select: { id: true }, take: 1 }, certifications: { select: { id: true }, take: 1 }, interests: true,
    } }),
    prisma.cv.findMany({ where: { userId: session.user.id }, orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, template: true, updatedAt: true } }),
    prisma.coverLetter.findMany({ where: { userId: session.user.id }, orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, company: true, position: true, updatedAt: true } }),
  ]);

  const sectionState = {
    identity: Boolean(profile?.firstName.trim() && profile.lastName.trim() && profile.email.trim() && profile.title.trim()),
    education: Boolean(profile?.education.length), experience: Boolean(profile?.experiences.length), skill: Boolean(profile?.skills.length),
    language: Boolean(profile?.languages.length), project: Boolean(profile?.projects.length), certification: Boolean(profile?.certifications.length), interests: Boolean(profile?.interests.length),
  };
  const completedCount = Object.values(sectionState).filter(Boolean).length;
  const percentage = Math.round((completedCount / profileSections.length) * 100);
  const missingSections = profileSections.filter((section) => !sectionState[section.id]);
  const firstName = profile?.firstName.trim();
  const greetingName = firstName || session.user.email || "";

  return <div className="space-y-8">
    <header><p className="text-sm font-medium text-[#6b876d]">Votre espace CVFlow</p><h1 className="mt-2 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Bienvenue{greetingName ? <>, <span className="break-all">{greetingName}</span></> : ""}.</h1><p className="mt-2 text-sm text-[#737b73]">Préparez et retrouvez vos documents de candidature au même endroit.</p></header>

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
      <section aria-labelledby="completion-heading" className="rounded-2xl border border-[#e5e9e2] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="completion-heading" className="text-lg font-semibold">Complétude du profil</h2><p className="mt-1 text-sm text-[#737b73]">Remplissez ces rubriques pour enrichir vos documents.</p></div><p className="text-2xl font-semibold text-[#285c46]">{percentage}<span className="text-base">%</span></p></div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e9eee7]" role="progressbar" aria-label="Complétude du profil" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}><div className="h-full rounded-full bg-[#285c46] transition-all" style={{ width: `${percentage}%` }} /></div>
        {missingSections.length ? <div className="mt-5"><p className="text-sm font-medium">Rubriques à compléter</p><ul className="mt-2 flex flex-wrap gap-2">{missingSections.map((section) => <li key={section.id}><Link href={section.href} className="inline-flex min-h-9 items-center rounded-full border border-[#dce2da] px-3 text-sm text-[#465149] transition hover:border-[#285c46] hover:text-[#285c46]">{section.label}<span aria-hidden="true" className="ml-1.5">→</span></Link></li>)}</ul></div> : <p className="mt-4 text-sm font-medium text-[#285c46]">Votre profil est complet.</p>}
      </section>

      <section className="rounded-2xl border border-[#e5e9e2] bg-white p-5 shadow-sm sm:p-7"><h2 className="text-lg font-semibold">Créer un document</h2><p className="mt-1 text-sm text-[#737b73]">Commencez une nouvelle candidature.</p><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><Link href="/cvs" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#285c46] px-4 text-sm font-semibold text-white transition hover:bg-[#214c39]">Nouveau CV</Link><Link href="/letters/new" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#285c46] px-4 text-sm font-semibold text-[#285c46] transition hover:bg-[#f2f6f1]">Nouvelle lettre</Link></div></section>
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-2xl border border-[#e5e9e2] bg-white p-5 shadow-sm sm:p-7"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">CV récents</h2><Link href="/cvs" className="text-sm font-medium text-[#285c46] hover:underline">Tous mes CV</Link></div>{cvs.length ? <ul className="mt-4 divide-y divide-[#edf0eb]">{cvs.map((cv) => <li key={cv.id}><Link href={`/cvs/${cv.id}`} className="flex min-h-16 items-center justify-between gap-4 py-3"><span className="min-w-0"><span className="block truncate text-sm font-medium">{cv.title}</span><span className="mt-1 block text-xs text-[#7a837a]">Modifié le {dateLabel(cv.updatedAt)}</span></span><span className="shrink-0 text-sm text-[#285c46]">Ouvrir →</span></Link></li>)}</ul> : <div className="mt-4 rounded-xl border border-dashed border-[#d6dfd5] px-4 py-8 text-center"><p className="text-sm font-medium">Aucun CV pour le moment</p><Link href="/cvs" className="mt-2 inline-block text-sm text-[#285c46] hover:underline">Créer mon premier CV</Link></div>}</section>
      <section className="rounded-2xl border border-[#e5e9e2] bg-white p-5 shadow-sm sm:p-7"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Lettres récentes</h2><Link href="/letters" className="text-sm font-medium text-[#285c46] hover:underline">Toutes mes lettres</Link></div>{letters.length ? <ul className="mt-4 divide-y divide-[#edf0eb]">{letters.map((letter) => <li key={letter.id}><Link href={`/letters/${letter.id}`} className="flex min-h-16 items-center justify-between gap-4 py-3"><span className="min-w-0"><span className="block truncate text-sm font-medium">{letter.title}</span><span className="mt-1 block truncate text-xs text-[#7a837a]">{letter.position} · {letter.company} · {dateLabel(letter.updatedAt)}</span></span><span className="shrink-0 text-sm text-[#285c46]">Ouvrir →</span></Link></li>)}</ul> : <div className="mt-4 rounded-xl border border-dashed border-[#d6dfd5] px-4 py-8 text-center"><p className="text-sm font-medium">Aucune lettre pour le moment</p><Link href="/letters/new" className="mt-2 inline-block text-sm text-[#285c46] hover:underline">Créer ma première lettre</Link></div>}</section>
    </div>
  </div>;
}
