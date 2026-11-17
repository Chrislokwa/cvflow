"use client";

import { PDFViewer } from "@react-pdf/renderer";
import ClassicCv from "../../../pdf/templates/ClassicCv";
import { registerPdfFonts } from "../../../pdf/fonts";
import type { CvProfileData } from "@/lib/cv-data";

registerPdfFonts({ robotoRegular: "/fonts/Roboto-Regular.woff", robotoBold: "/fonts/Roboto-Bold.woff", loraRegular: "/fonts/Lora-Regular.woff", loraBold: "/fonts/Lora-Bold.woff" });

export default function PdfPreview({ profile, accentColor }: { profile: CvProfileData; accentColor: string }) {
  return <PDFViewer showToolbar={false} className="h-[72vh] min-h-[560px] w-full rounded-xl border border-[#dfe5dc] bg-white sm:h-[78vh]"><ClassicCv profile={profile} settings={{ accentColor }} /></PDFViewer>;
}
