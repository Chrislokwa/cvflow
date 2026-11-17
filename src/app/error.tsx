"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-[70vh] place-items-center px-5 py-12">
    <section role="alert" className="max-w-lg rounded-2xl border border-[#ead9d6] bg-white p-8 text-center shadow-sm sm:p-10">
      <p className="text-sm font-semibold text-[#a34d43]">Une erreur est survenue</p>
      <h1 className="mt-3 text-2xl font-semibold">Impossible d’afficher cette page</h1>
      <p className="mt-3 text-sm leading-6 text-[#737b73]">Réessayez dans un instant. Vos documents enregistrés ne sont pas supprimés.</p>
      <button type="button" onClick={reset} className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#285c46] px-5 text-sm font-semibold text-white hover:bg-[#214c39]">Réessayer</button>
    </section>
  </main>;
}
