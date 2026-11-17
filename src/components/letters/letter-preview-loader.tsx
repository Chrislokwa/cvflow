"use client";

import dynamic from "next/dynamic";
import type { LetterPdfData, LetterSender } from "../../../pdf/templates/Letter";

const LetterPreview = dynamic(() => import("./letter-preview"), { ssr: false, loading: () => <div className="grid h-[72vh] min-h-[560px] place-items-center rounded-xl border border-[#dfe5dc] bg-white text-sm text-[#687168]">Préparation de l’aperçu PDF…</div> });

export default function LetterPreviewLoader({ letter, sender }: { letter: LetterPdfData; sender: LetterSender }) {
  return <LetterPreview letter={letter} sender={sender} />;
}
