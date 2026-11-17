import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CvPreviewLoader from "@/components/cv/cv-preview-loader";
import { loadCvProfile } from "@/lib/cv-data";

export default async function NewCvPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const profile = await loadCvProfile(session.user.id);
  if (!profile) return <section className="rounded-2xl border border-[#e5e9e2] bg-white p-6 sm:p-10"><h1 className="text-2xl font-medium">Votre profil est introuvable</h1><Link className="mt-4 inline-block text-sm font-medium text-[#285c46] underline" href="/profile">Compléter mon profil</Link></section>;

  return <section><div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-[#6b876d]">Mon CV</p><h1 className="mt-2 text-3xl font-medium tracking-[-0.04em]">Aperçu classique</h1><p className="mt-2 text-sm text-[#737b73]">Le document reprend les informations enregistrées dans votre profil.</p></div><a href="/api/cv-preview/download" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#285c46] px-5 text-sm font-semibold text-white transition hover:bg-[#214c3a]">Télécharger en PDF</a></div><CvPreviewLoader profile={profile} /></section>;
}
