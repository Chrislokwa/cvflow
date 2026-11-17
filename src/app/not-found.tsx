import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-[70vh] place-items-center px-5 py-12">
    <section className="max-w-lg rounded-2xl border border-[#e5e9e2] bg-white p-8 text-center shadow-sm sm:p-10">
      <p className="text-sm font-semibold text-[#6b876d]">Erreur 404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Cette page est introuvable</h1>
      <p className="mt-3 text-sm leading-6 text-[#737b73]">Le lien est peut-être incorrect ou la page a été déplacée.</p>
      <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#285c46] px-5 text-sm font-semibold text-white hover:bg-[#214c39]">Retour à l’accueil</Link>
    </section>
  </main>;
}
