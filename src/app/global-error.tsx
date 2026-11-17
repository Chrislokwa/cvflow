"use client";

import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="fr"><body className="grid min-h-screen place-items-center bg-[#f7f7f4] px-5 text-[#20241f]">
    <main role="alert" className="max-w-lg rounded-2xl border border-[#ead9d6] bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold text-[#a34d43]">CVFlow</p><h1 className="mt-3 text-2xl font-semibold">Une erreur est survenue</h1><p className="mt-3 text-sm text-[#737b73]">Rechargez la page ou réessayez dans un instant.</p><button type="button" onClick={reset} className="mt-6 min-h-11 rounded-lg bg-[#285c46] px-5 text-sm font-semibold text-white">Réessayer</button>
    </main>
  </body></html>;
}
