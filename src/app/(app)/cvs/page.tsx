import Link from "next/link";

export default function CvsPage() {
  return (
    <section className="rounded-2xl border border-[#e5e9e2] bg-white p-6 shadow-sm sm:p-10">
      <p className="text-sm font-medium text-[#6b876d]">Mes documents</p>
      <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em]">Mes CV</h1>
      <p className="mt-4 text-sm leading-7 text-[#737b73] sm:text-base">
        Prévisualisez votre CV classique et téléchargez-le au format PDF.
      </p>
      <Link href="/cvs/new" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#285c46] px-5 text-sm font-semibold text-white transition hover:bg-[#214c3a]">
        Créer un CV
      </Link>
    </section>
  );
}
