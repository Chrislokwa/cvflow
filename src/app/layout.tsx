import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CVFlow — Votre prochain chapitre", template: "%s | CVFlow" },
  description: "Créez un CV et une lettre de motivation qui vous ressemblent.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
