"use client";

import { PDFViewer } from "@react-pdf/renderer";
import Letter from "../../../pdf/templates/Letter";
import { registerPdfFonts } from "../../../pdf/fonts";
import type { LetterPdfData, LetterSender } from "../../../pdf/templates/Letter";

registerPdfFonts({
  robotoRegular: "/fonts/Roboto-Regular.woff",
  robotoBold: "/fonts/Roboto-Bold.woff",
  loraRegular: "/fonts/Lora-Regular.woff",
  loraBold: "/fonts/Lora-Bold.woff",
  merriweatherRegular: "/fonts/Merriweather-Regular.woff",
  merriweatherBold: "/fonts/Merriweather-Bold.woff",
});

export default function LetterPreview({ letter, sender }: { letter: LetterPdfData; sender: LetterSender }) {
  return <PDFViewer showToolbar={false} className="h-[72vh] min-h-[560px] w-full rounded-xl border border-[#dfe5dc] bg-white sm:h-[78vh]"><Letter letter={letter} sender={sender} /></PDFViewer>;
}
