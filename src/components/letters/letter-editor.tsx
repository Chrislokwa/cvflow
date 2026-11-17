"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { saveLetterContent } from "@/app/actions/letters";
import type { LetterPdfData, LetterSender } from "../../../pdf/templates/Letter";
import LetterPreviewLoader from "@/components/letters/letter-preview-loader";

type LetterEditorData = LetterPdfData & { id: string };

export default function LetterEditor({ letter: initialLetter, sender }: { letter: LetterEditorData; sender: LetterSender }) {
  const [content, setContent] = useState(initialLetter.content);
  const [status, setStatus] = useState("Tous les changements sont enregistrés.");
  const [isDownloading, setIsDownloading] = useState(false);
  const latestContent = useRef(content);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const router = useRouter();

  useEffect(() => { latestContent.current = content; }, [content]);

  async function persist(value: string): Promise<boolean> {
    setStatus("Enregistrement…");
    const current = saveQueue.current.then(async () => {
      const result = await saveLetterContent(initialLetter.id, value);
      if (latestContent.current === value) setStatus(result.success ? "Tous les changements sont enregistrés." : result.message);
      return result.success;
    });
    saveQueue.current = current.then(() => undefined, () => undefined);
    return current;
  }

  useEffect(() => {
    if (content === initialLetter.content) return;
    const timeoutId = window.setTimeout(() => { void persist(content); }, 650);
    return () => window.clearTimeout(timeoutId);
  }, [content, initialLetter.content]);

  async function download() {
    setIsDownloading(true);
    const saved = await persist(latestContent.current);
    if (saved) {
      const link = document.createElement("a");
      link.href = `/api/letters/${initialLetter.id}/pdf`;
      link.download = "";
      link.click();
      router.refresh();
    }
    setIsDownloading(false);
  }

  const previewLetter = { ...initialLetter, content };
  return <section className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><Link href="/letters" className="text-sm font-medium text-[#49634e] hover:underline">← Mes lettres</Link><h1 className="mt-2 text-2xl font-semibold">{initialLetter.title}</h1><p role="status" className="mt-1 text-xs text-[#737b73]">{status}</p></div>
      <button type="button" disabled={isDownloading} onClick={() => void download()} className="inline-flex min-h-10 items-center rounded-lg bg-[#285c46] px-4 text-sm font-semibold text-white hover:bg-[#214c39] disabled:opacity-60">{isDownloading ? "Préparation…" : "Télécharger en PDF"}</button>
    </header>
    <div className="grid gap-5 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
      <label className="block text-sm font-semibold text-[#303a32]">Votre lettre<textarea value={content} onChange={(event) => { latestContent.current = event.target.value; setContent(event.target.value); }} maxLength={12000} rows={26} className="mt-2 min-h-[560px] w-full resize-y rounded-xl border border-[#dce2da] bg-white p-4 text-sm leading-7 outline-none focus:border-[#6b9272] focus:ring-3 focus:ring-[#6b9272]/15" /></label>
      <section aria-label="Aperçu PDF" className="min-w-0"><LetterPreviewLoader letter={previewLetter} sender={sender} /></section>
    </div>
  </section>;
}
