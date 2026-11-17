import { join } from "node:path";
import { createElement } from "react";
import type { ReactElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { auth } from "@/auth";
import { defaultCvSettings, loadCvProfile } from "@/lib/cv-data";
import { registerPdfFonts } from "../../../../../pdf/fonts";
import ClassicCv from "../../../../../pdf/templates/ClassicCv";

function safeFilePart(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "") || "Profil";
}

export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return new Response("Non autorisé", { status: 401 });
  const profile = await loadCvProfile(session.user.id);
  if (!profile) return new Response("Profil introuvable", { status: 404 });

  registerPdfFonts({ robotoRegular: join(process.cwd(), "public", "fonts", "Roboto-Regular.woff"), robotoBold: join(process.cwd(), "public", "fonts", "Roboto-Bold.woff"), loraRegular: join(process.cwd(), "public", "fonts", "Lora-Regular.woff"), loraBold: join(process.cwd(), "public", "fonts", "Lora-Bold.woff") });
  const document = createElement(ClassicCv, { profile, settings: defaultCvSettings }) as ReactElement<DocumentProps>;
  const pdf = await renderToBuffer(document);
  const filename = `CV_${safeFilePart(profile.firstName)}_${safeFilePart(profile.lastName)}.pdf`;
  return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`, "Cache-Control": "private, no-store" } });
}
