"use client";

import dynamic from "next/dynamic";
import type { CvProfileData } from "@/lib/cv-data";

const PdfPreview = dynamic(() => import("./pdf-preview"), { ssr: false, loading: () => <div className="grid h-[72vh] min-h-[560px] place-items-center rounded-xl border border-[#dfe5dc] bg-white text-sm text-[#687168]">Préparation de l’aperçu PDF…</div> });

export default function CvPreviewLoader({ profile }: { profile: CvProfileData }) {
  return <PdfPreview profile={profile} accentColor="#2869a7" />;
}
