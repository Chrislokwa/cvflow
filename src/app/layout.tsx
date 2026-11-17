import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CVFlow — Créateur de CV et lettres de motivation en ligne",
    template: "%s | CVFlow",
  },
  description:
    "Créez, personnalisez et téléchargez gratuitement vos CV et lettres de motivation en PDF avec CVFlow.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
