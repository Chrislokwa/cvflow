import { Font } from "@react-pdf/renderer";

export type PdfFontSources = {
  robotoRegular: string;
  robotoBold: string;
  loraRegular: string;
  loraBold: string;
  merriweatherRegular: string;
  merriweatherBold: string;
};

let registered = false;

export function registerPdfFonts(sources: PdfFontSources): void {
  if (registered) return;
  Font.register({
    family: "Roboto",
    fonts: [
      { src: sources.robotoRegular, fontWeight: 400 },
      { src: sources.robotoBold, fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Lora",
    fonts: [
      { src: sources.loraRegular, fontWeight: 400 },
      { src: sources.loraBold, fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Merriweather",
    fonts: [
      { src: sources.merriweatherRegular, fontWeight: 400 },
      { src: sources.merriweatherBold, fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
