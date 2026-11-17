"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { cvTemplateRegistry } from "../../../pdf/template-registry";
import { registerPdfFonts } from "../../../pdf/fonts";
import type { CvProfileData } from "@/lib/cv-data";
import type { CvSettings } from "@/lib/validations/cv-settings";

registerPdfFonts({
  robotoRegular: "/fonts/Roboto-Regular.woff",
  robotoBold: "/fonts/Roboto-Bold.woff",
  loraRegular: "/fonts/Lora-Regular.woff",
  loraBold: "/fonts/Lora-Bold.woff",
  merriweatherRegular: "/fonts/Merriweather-Regular.woff",
  merriweatherBold: "/fonts/Merriweather-Bold.woff",
});

export default function PdfPreview({ profile, settings }: { profile: CvProfileData; settings: CvSettings }) {
  const Template = cvTemplateRegistry[settings.template];
  return <PDFViewer showToolbar={false} className="h-[72vh] min-h-[560px] w-full rounded-xl border border-[#dfe5dc] bg-white sm:h-[78vh]"><Template profile={profile} settings={settings} /></PDFViewer>;
}
