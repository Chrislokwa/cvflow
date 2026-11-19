"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteLetter, duplicateLetter } from "@/app/actions/letters";
import Toast from "@/components/ui/toast";

export type LetterLibraryItem = {
  id: string;
  title: string;
  type: string;
  tone: string;
  company: string;
  position: string;
  updatedAt: string;
};

const typeLabels: Record<string, string> = { APPLICATION: "Emploi", INTERNSHIP: "Stage", UNSOLICITED: "Candidature spontanée", INTERNSHIP_UNSOLICITED: "Stage spontané", FOLLOW_UP: "Relance" };
const toneLabels: Record<string, string> = { FORMAL: "Formel", PROFESSIONAL: "Professionnel", FRIENDLY: "Amical", DYNAMIC: "Dynamique", ACADEMIC: "Académique" };

export default function LetterLibrary({ items }: { items: LetterLibraryItem[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState("");
  const [notification, setNotification] = useState<{ message: string; tone: "error" | "success" } | null>(null);

  async function duplicate(id: string) {
    setBusyId(id);
    const result = await duplicateLetter(id);
    setBusyId("");
    if (!result.success) {
      setNotification({ message: result.message, tone: "error" });
      return;
    }
    if (!result.id) {
      setNotification({ message: "La lettre n’a pas pu être dupliquée.", tone: "error" });
      return;
    }
    router.push(`/letters/${result.id}`);
    router.refresh();
  }

  async function remove(item: LetterLibraryItem) {
    if (!window.confirm(`Supprimer « ${item.title} » ? Cette action est définitive.`)) return;
    setBusyId(item.id);
    const result = await deleteLetter(item.id);
    setBusyId("");
    setNotification(result.success ? { message: "La lettre a été supprimée.", tone: "success" } : { message: result.message, tone: "error" });
    if (result.success) router.refresh();
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-[#6b876d]">Mes documents</p><h1 className="mt-2 text-3xl font-medium tracking-[-0.04em]">Mes lettres</h1><p className="mt-2 text-sm text-[#737b73]">Créez une lettre adaptée à chaque candidature.</p></div>
        <Link href="/letters/new" className="inline-flex min-h-11 items-center rounded-lg bg-[#285c46] px-4 text-sm font-semibold text-white transition hover:bg-[#214c39]">Créer une lettre</Link>
      </header>
      {notification ? <Toast message={notification.message} tone={notification.tone} onDismiss={() => setNotification(null)} /> : null}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#cbd5c9] bg-white px-6 py-12 text-center"><p className="font-medium">Aucune lettre pour le moment</p><p className="mt-2 text-sm text-[#737b73]">Créez votre première lettre à partir de votre profil.</p><Link href="/letters/new" className="mt-5 inline-flex min-h-10 items-center rounded-lg border border-[#285c46] px-4 text-sm font-semibold text-[#285c46]">Créer ma première lettre</Link></div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => <li key={item.id} className="flex min-h-48 flex-col rounded-2xl border border-[#e5e9e2] bg-white p-5 shadow-sm">
            <Link href={`/letters/${item.id}`} className="group"><p className="line-clamp-2 font-semibold text-[#20241f] group-hover:text-[#285c46]">{item.title}</p><p className="mt-1 text-sm text-[#737b73]">{item.position} · {item.company}</p></Link>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#59635a]"><span className="rounded-full bg-[#f1f4ef] px-2.5 py-1">{typeLabels[item.type] ?? "Lettre"}</span><span className="rounded-full bg-[#f1f4ef] px-2.5 py-1">{toneLabels[item.tone] ?? "Ton"}</span></div>
            <p className="mt-auto pt-4 text-xs text-[#828a82]">Modifiée le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(item.updatedAt))}</p>
            <div className="mt-3 flex gap-2"><button type="button" onClick={() => void duplicate(item.id)} disabled={busyId === item.id} className="min-h-9 rounded-lg border border-[#dce2da] px-3 text-xs font-medium text-[#455449] disabled:opacity-50">Dupliquer</button><button type="button" onClick={() => void remove(item)} disabled={busyId === item.id} className="min-h-9 rounded-lg border border-[#e6d2cf] px-3 text-xs font-medium text-[#a34d43] disabled:opacity-50">Supprimer</button><Link href={`/letters/${item.id}`} className="ml-auto inline-flex min-h-9 items-center rounded-lg bg-[#f1f4ef] px-3 text-xs font-semibold text-[#285c46]">Ouvrir</Link></div>
          </li>)}
        </ul>
      )}
    </section>
  );
}
