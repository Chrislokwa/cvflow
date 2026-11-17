import { join } from "node:path";
import { createElement } from "react";
import type { ReactElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { auth } from "@/auth";
import { z } from "zod";
import { loadCvProfile } from "@/lib/cv-data";
import { prisma } from "@/lib/prisma";
import { parseCvSettings } from "@/lib/validations/cv-settings";
import { cvTemplateRegistry } from "../../../../../../pdf/template-registry";
import { registerPdfFonts } from "../../../../../../pdf/fonts";

function safeFilePart(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "") || "Profil";
}

const cvIdSchema = z.string().trim().min(1).max(64);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return new Response("Non autorisé", { status: 401 });
  const { id: rawId } = await params;
  const parsedId = cvIdSchema.safeParse(rawId);
  if (!parsedId.success) return new Response("CV introuvable", { status: 404 });
  const id = parsedId.data;
  const cv = await prisma.cv.findFirst({ where: { id, userId: session.user.id } });
  if (!cv) return new Response("CV introuvable", { status: 404 });

  const profile = await loadCvProfile(session.user.id);
  if (!profile) return new Response("Profil introuvable", { status: 404 });
  const fallbackTemplate = cv.template === "CREATIVE" ? "CLASSIC" : cv.template;
  const settings = parseCvSettings(cv.settings, fallbackTemplate);
  const Template = cvTemplateRegistry[settings.template];

  registerPdfFonts({
    robotoRegular: join(process.cwd(), "public", "fonts", "Roboto-Regular.woff"),
    robotoBold: join(process.cwd(), "public", "fonts", "Roboto-Bold.woff"),
    loraRegular: join(process.cwd(), "public", "fonts", "Lora-Regular.woff"),
    loraBold: join(process.cwd(), "public", "fonts", "Lora-Bold.woff"),
    merriweatherRegular: join(process.cwd(), "public", "fonts", "Merriweather-Regular.woff"),
    merriweatherBold: join(process.cwd(), "public", "fonts", "Merriweather-Bold.woff"),
  });

  const document = createElement(Template, { profile, settings }) as ReactElement<DocumentProps>;
  const pdf = await renderToBuffer(document);
  const filename = `CV_${safeFilePart(profile.firstName)}_${safeFilePart(profile.lastName)}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
