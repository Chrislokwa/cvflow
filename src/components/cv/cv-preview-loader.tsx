"use client";

import dynamic from "next/dynamic";
import type { CvProfileData } from "@/lib/cv-data";
import type { CvSettings } from "@/lib/validations/cv-settings";

const PdfPreview = dynamic(() => import("./pdf-preview"), { ssr: false, loading: () => <div className="grid h-[72vh] min-h-[560px] place-items-center rounded-xl border border-[#dfe5dc] bg-white text-sm text-[#687168]">Préparation de l’aperçu PDF…</div> });

export default function CvPreviewLoader({ profile, settings }: { profile: CvProfileData; settings: CvSettings }) {
  return <PdfPreview profile={profile} settings={settings} />;
}
