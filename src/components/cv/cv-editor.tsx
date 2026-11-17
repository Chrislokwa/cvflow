"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { saveCvSettings } from "@/app/actions/cvs";
import type { CvProfileData } from "@/lib/cv-data";
import type { CvSection, CvSettings } from "@/lib/validations/cv-settings";
import CvPreviewLoader from "./cv-preview-loader";

const sectionLabels: Record<CvSection, string> = {
  identity: "Identité",
  summary: "Profil professionnel",
  education: "Études et formations",
  experiences: "Expériences professionnelles",
  skills: "Compétences",
  languages: "Langues",
  projects: "Projets",
  certifications: "Formations complémentaires",
  interests: "Centres d’intérêt",
};

const accentPresets = ["#2869a7", "#285c46", "#714c8a", "#a34842", "#b27630", "#323b45"];

export default function CvEditor({ id, title, profile, initialSettings }: { id: string; title: string; profile: CvProfileData; initialSettings: CvSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [isDownloading, setIsDownloading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Tous les changements sont enregistrés.");
  const router = useRouter();
  const savedSettings = useRef(JSON.stringify(initialSettings));
  const queuedSettings = useRef(JSON.stringify(initialSettings));
  const latestSettings = useRef(settings);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => { latestSettings.current = settings; }, [settings]);

  const enqueueSave = useCallback((snapshot: CvSettings) => {
    const serialized = JSON.stringify(snapshot);
    queuedSettings.current = serialized;
    const task = saveQueue.current.then(async () => {
      const result = await saveCvSettings(id, snapshot);
      if (result.success) savedSettings.current = serialized;
      else if (queuedSettings.current === serialized) queuedSettings.current = savedSettings.current;
      if (JSON.stringify(latestSettings.current) === serialized) setSaveMessage(result.success ? "Tous les changements sont enregistrés." : result.message);
      return result;
    }).catch(() => {
      if (queuedSettings.current === serialized) queuedSettings.current = savedSettings.current;
      setSaveMessage("Impossible d’enregistrer les réglages.");
      return { success: false as const, message: "Impossible d’enregistrer les réglages." };
    });
    saveQueue.current = task.then(() => undefined, () => undefined);
    return task;
  }, [id]);

  useEffect(() => {
    const serialized = JSON.stringify(settings);
    if (serialized === queuedSettings.current) return;

    setSaveMessage("Enregistrement des réglages…");
    const timeoutId = window.setTimeout(() => {
      void enqueueSave(settings);
    }, 550);

    return () => window.clearTimeout(timeoutId);
  }, [enqueueSave, settings]);

  async function handleDownload() {
    setIsDownloading(true);
    setSaveMessage("Enregistrement avant le téléchargement…");
    let snapshot = latestSettings.current;
    let result = await enqueueSave(snapshot);
    while (result.success && JSON.stringify(latestSettings.current) !== JSON.stringify(snapshot)) {
      snapshot = latestSettings.current;
      result = await enqueueSave(snapshot);
    }
    if (result.success) {
      const downloadLink = document.createElement("a");
      downloadLink.href = `/api/cvs/${id}/pdf`;
      downloadLink.download = "";
      downloadLink.click();
      router.refresh();
    }
    setIsDownloading(false);
  }

  function updateSettings(update: Partial<CvSettings>) {
    setSettings((current) => ({ ...current, ...update }));
  }

  function toggleSection(section: CvSection, visible: boolean) {
    const visibleSections = visible
      ? [...settings.visibleSections, section]
      : settings.visibleSections.filter((item) => item !== section);
    updateSettings({ visibleSections });
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= settings.sectionOrder.length) return;
    const sectionOrder = [...settings.sectionOrder];
    [sectionOrder[index], sectionOrder[target]] = [sectionOrder[target], sectionOrder[index]];
    updateSettings({ sectionOrder });
  }

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><Link href="/cvs" className="text-sm font-medium text-[#49634e] hover:underline">← Mes CV</Link><h1 className="mt-2 text-2xl font-semibold">{title}</h1><p role="status" className="mt-1 text-xs text-[#737b73]">{saveMessage}</p></div>
        <button type="button" disabled={isDownloading} onClick={handleDownload} className="inline-flex min-h-10 items-center rounded-lg bg-[#285c46] px-4 text-sm font-semibold text-white hover:bg-[#214c39] disabled:opacity-60">{isDownloading ? "Préparation…" : "Télécharger en PDF"}</button>
      </header>

      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside inert={isDownloading} className={`space-y-5 rounded-2xl border border-[#e5e9e2] bg-white p-5 shadow-sm xl:max-h-[calc(100vh-220px)] xl:overflow-y-auto ${isDownloading ? "opacity-60" : ""}`}>
          <label className="block text-sm font-semibold text-[#303a32]">Modèle
            <select value={settings.template} onChange={(event) => updateSettings({ template: event.target.value as CvSettings["template"] })} className="mt-1.5 h-11 w-full rounded-lg border border-[#dce2da] bg-white px-3 font-normal">
              <option value="CLASSIC">Classique</option><option value="MODERN">Moderne</option><option value="MINIMAL">Minimal</option>
            </select>
          </label>

          <fieldset>
            <legend className="text-sm font-semibold text-[#303a32]">Couleur d’accent</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {accentPresets.map((color) => <button key={color} type="button" onClick={() => updateSettings({ accentColor: color })} aria-label={`Utiliser la couleur ${color}`} aria-pressed={settings.accentColor.toLowerCase() === color} className={`size-8 rounded-full border-2 ${settings.accentColor.toLowerCase() === color ? "border-[#20241f] ring-2 ring-[#20241f]/15" : "border-white shadow-sm"}`} style={{ backgroundColor: color }} />)}
              <label className="flex h-8 items-center gap-2 rounded-full border border-[#dce2da] px-2 text-xs text-[#58635a]">Personnalisée<input aria-label="Couleur personnalisée" type="color" value={settings.accentColor} onChange={(event) => updateSettings({ accentColor: event.target.value })} className="size-6 cursor-pointer border-0 bg-transparent p-0" /></label>
            </div>
          </fieldset>

          <label className="block text-sm font-semibold text-[#303a32]">Police
            <select value={settings.fontFamily} onChange={(event) => updateSettings({ fontFamily: event.target.value as CvSettings["fontFamily"] })} className="mt-1.5 h-11 w-full rounded-lg border border-[#dce2da] bg-white px-3 font-normal">
              <option value="roboto">Roboto</option><option value="lora">Lora</option><option value="merriweather">Merriweather</option>
            </select>
          </label>

          {settings.template === "MODERN" && <p className="text-xs text-[#737b73]">La photo de votre profil apparaît dans le modèle Moderne.</p>}

          <fieldset>
            <legend className="text-sm font-semibold text-[#303a32]">Sections visibles et ordre</legend>
            <ol className="mt-2 space-y-2">
              {settings.sectionOrder.map((section, index) => <li key={section} className="flex items-center gap-2 rounded-lg bg-[#f7f8f6] px-2 py-2">
                <input type="checkbox" checked={settings.visibleSections.includes(section)} onChange={(event) => toggleSection(section, event.target.checked)} aria-label={`Afficher ${sectionLabels[section]}`} className="size-4 shrink-0 accent-[#2869a7]" />
                <span className={`min-w-0 flex-1 text-xs ${settings.visibleSections.includes(section) ? "text-[#303a32]" : "text-[#929992]"}`}>{sectionLabels[section]}</span>
                <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} aria-label={`Monter ${sectionLabels[section]}`} className="grid size-7 shrink-0 place-items-center rounded-md border border-[#dce2da] bg-white text-sm disabled:opacity-35">↑</button>
                <button type="button" onClick={() => moveSection(index, 1)} disabled={index === settings.sectionOrder.length - 1} aria-label={`Descendre ${sectionLabels[section]}`} className="grid size-7 shrink-0 place-items-center rounded-md border border-[#dce2da] bg-white text-sm disabled:opacity-35">↓</button>
              </li>)}
            </ol>
          </fieldset>
        </aside>

        <section aria-label="Aperçu du CV" className="min-w-0"><CvPreviewLoader profile={profile} settings={settings} /></section>
      </div>
    </div>
  );
}
