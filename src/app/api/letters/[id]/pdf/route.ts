import { join } from "node:path";
import { createElement } from "react";
import type { ReactElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import Letter from "../../../../../../pdf/templates/Letter";
import type { LetterPdfData, LetterSender } from "../../../../../../pdf/templates/Letter";
import { registerPdfFonts } from "../../../../../../pdf/fonts";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const letterIdSchema = z.string().trim().min(1).max(64);

function safeFilePart(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "") || "Entreprise";
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return new Response("Non autorisé", { status: 401 });
  const { id: rawId } = await params;
  const parsedId = letterIdSchema.safeParse(rawId);
  if (!parsedId.success) return new Response("Lettre introuvable", { status: 404 });
  const id = parsedId.data;
  const letter = await prisma.coverLetter.findFirst({ where: { id, userId: session.user.id } });
  if (!letter) return new Response("Lettre introuvable", { status: 404 });
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id }, select: { firstName: true, lastName: true, postName: true, email: true, phone: true, address: true, city: true, country: true } });
  if (!profile) return new Response("Profil introuvable", { status: 404 });

  registerPdfFonts({
    robotoRegular: join(process.cwd(), "public", "fonts", "Roboto-Regular.woff"),
    robotoBold: join(process.cwd(), "public", "fonts", "Roboto-Bold.woff"),
    loraRegular: join(process.cwd(), "public", "fonts", "Lora-Regular.woff"),
    loraBold: join(process.cwd(), "public", "fonts", "Lora-Bold.woff"),
    merriweatherRegular: join(process.cwd(), "public", "fonts", "Merriweather-Regular.woff"),
    merriweatherBold: join(process.cwd(), "public", "fonts", "Merriweather-Bold.woff"),
  });

  const pdfData: LetterPdfData = { title: letter.title, type: letter.type, company: letter.company, position: letter.position, recruiterName: letter.recruiterName, city: letter.city, createdAt: letter.createdAt.toISOString(), content: letter.content };
  const sender: LetterSender = profile;
  const document = createElement(Letter, { letter: pdfData, sender }) as ReactElement<DocumentProps>;
  const pdf = await renderToBuffer(document);
  const filename = `Lettre_${safeFilePart(letter.company)}.pdf`;

  return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`, "Cache-Control": "private, no-store" } });
}
