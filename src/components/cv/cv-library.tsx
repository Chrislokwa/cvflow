"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCv, deleteCv, duplicateCv, renameCv } from "@/app/actions/cvs";
import { cvTemplateNames } from "@/lib/validations/cv-settings";
import type { CvTemplateKey } from "@/lib/validations/cv-settings";
import Toast from "@/components/ui/toast";

export type CvLibraryItem = { id: string; title: string; template: CvTemplateKey; updatedAt: string };

const templates: CvTemplateKey[] = ["CLASSIC", "MODERN", "MINIMAL"];

export default function CvLibrary({ items }: { items: CvLibraryItem[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState<CvTemplateKey>("CLASSIC");
  const [notification, setNotification] = useState<{ message: string; tone: "error" | "success" } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      const result = await createCv({ title, template });
      if (!result.success || !result.id) {
        setNotification({ message: result.success ? "Impossible d’ouvrir ce CV." : result.message, tone: "error" });
        return;
      }
      router.push(`/cvs/${result.id}`);
    });
  }

  function handleRename(item: CvLibraryItem) {
    const nextTitle = window.prompt("Nouveau titre du CV", item.title);
    if (!nextTitle || nextTitle.trim() === item.title) return;
    startTransition(async () => {
      const result = await renameCv(item.id, nextTitle);
      setNotification(result.success ? { message: "Le titre a été modifié.", tone: "success" } : { message: result.message, tone: "error" });
      if (result.success) router.refresh();
    });
  }

  function handleDuplicate(item: CvLibraryItem) {
    startTransition(async () => {
      const result = await duplicateCv(item.id);
      if (!result.success || !result.id) {
        setNotification({ message: result.success ? "Impossible de dupliquer ce CV." : result.message, tone: "error" });
        return;
      }
      router.push(`/cvs/${result.id}`);
    });
  }

  function handleDelete(item: CvLibraryItem) {
    if (!window.confirm(`Supprimer « ${item.title} » ? Cette action est définitive.`)) return;
    startTransition(async () => {
      const result = await deleteCv(item.id);
      setNotification(result.success ? { message: "Le CV a été supprimé.", tone: "success" } : { message: result.message, tone: "error" });
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {notification ? <Toast message={notification.message} tone={notification.tone} onDismiss={() => setNotification(null)} /> : null}
      <section className="rounded-2xl border border-[#e5e9e2] bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-semibold">Créer un CV</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_200px_auto]">
          <label className="text-sm font-medium text-[#39443d]">Titre
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} placeholder="Ex. Candidature assistante" className="mt-1.5 h-11 w-full rounded-lg border border-[#dce2da] px-3 text-sm outline-none focus:border-[#2869a7]" />
          </label>
          <label className="text-sm font-medium text-[#39443d]">Modèle
            <select value={template} onChange={(event) => setTemplate(event.target.value as CvTemplateKey)} className="mt-1.5 h-11 w-full rounded-lg border border-[#dce2da] bg-white px-3 text-sm">
              {templates.map((item) => <option value={item} key={item}>{cvTemplateNames[item]}</option>)}
            </select>
          </label>
          <button type="button" disabled={pending || !title.trim()} onClick={handleCreate} className="mt-auto h-11 rounded-lg bg-[#285c46] px-5 text-sm font-semibold text-white hover:bg-[#214c39] disabled:opacity-50">{pending ? "Création…" : "Créer"}</button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => <article key={item.id} className="rounded-2xl border border-[#e5e9e2] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0"><h2 className="truncate text-lg font-semibold">{item.title}</h2><p className="mt-1 text-sm text-[#707970]">Modèle {cvTemplateNames[item.template]}</p><p className="mt-1 text-xs text-[#858d85]">Modifié le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(item.updatedAt))}</p></div>
            <Link href={`/cvs/${item.id}`} aria-label={`Modifier ${item.title}`} className="shrink-0 rounded-lg bg-[#edf3f8] px-3 py-2 text-sm font-medium text-[#315d86] hover:bg-[#e1ebf4]">Ouvrir</Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-[#edf0eb] pt-4">
            <button type="button" disabled={pending} onClick={() => handleRename(item)} className="rounded-lg border border-[#dce2da] px-3 py-2 text-xs font-medium text-[#465149] disabled:opacity-50">Renommer</button>
            <button type="button" disabled={pending} onClick={() => handleDuplicate(item)} className="rounded-lg border border-[#dce2da] px-3 py-2 text-xs font-medium text-[#465149] disabled:opacity-50">Dupliquer</button>
            <button type="button" disabled={pending} onClick={() => handleDelete(item)} className="rounded-lg px-3 py-2 text-xs font-medium text-[#9a463e] hover:bg-[#fff1ef] disabled:opacity-50">Supprimer</button>
          </div>
        </article>)}
      </div>
      {items.length === 0 ? <div className="rounded-2xl border border-dashed border-[#d6dfd5] bg-white p-8 text-center"><p className="font-medium">Aucun CV pour le moment</p><p className="mt-1 text-sm text-[#737b73]">Créez votre premier CV à partir de votre profil.</p></div> : null}
    </div>
  );
}
