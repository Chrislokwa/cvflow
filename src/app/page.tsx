import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#f7f7f4] text-[#20241f]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-48 size-[34rem] rounded-full bg-[#dce9dc] blur-3xl" />
      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight" aria-label="CVFlow, accueil">
          <span className="grid size-9 place-items-center rounded-xl bg-[#285c46] text-sm text-white">cv</span>
          <span className="text-xl">CVFlow</span>
        </Link>
        <span className="hidden text-sm text-[#6b716b] sm:block">Votre parcours, avec clarté.</span>
      </header>

      <section className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-14 px-6 py-12 sm:px-10 lg:grid-cols-[1fr_0.8fr] lg:gap-20 lg:py-20">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dce3da] bg-white/70 px-3.5 py-2 text-xs font-medium tracking-wide text-[#496b54]">
            <span className="size-1.5 rounded-full bg-[#6b9b70]" />
            DONNEZ FORME À VOTRE PROCHAIN CHAPITRE
          </p>
          <h1 className="text-5xl font-medium leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Le bon CV ouvre <span className="font-serif italic text-[#497457]">la bonne porte.</span>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-[#69716a] sm:text-lg sm:leading-8">
            Créez un CV qui vous ressemble et une lettre qui donne envie de vous rencontrer. Simplement, sereinement.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/connexion" className="inline-flex h-12 items-center justify-center rounded-lg bg-[#285c46] px-6 text-sm font-medium text-white shadow-sm transition hover:bg-[#214c39]">
              Connexion <span aria-hidden="true" className="ml-3">→</span>
            </Link>
            <Link href="/inscription" className="inline-flex h-12 items-center justify-center rounded-lg border border-[#d8ddd6] bg-white/70 px-6 text-sm font-medium text-[#303a32] transition hover:bg-white">
              Inscription
            </Link>
          </div>
          <p className="mt-7 text-xs text-[#8a918a]">Un espace clair pour raconter votre expérience.</p>
        </div>

        <div aria-hidden="true" className="relative mx-auto w-full max-w-md lg:ml-auto">
          <div className="absolute -inset-6 rounded-[2rem] bg-[#e9eee6]/70 blur-2xl" />
          <div className="relative rotate-[-2deg] rounded-2xl border border-[#e8eae5] bg-white p-5 shadow-[0_24px_80px_-28px_rgba(37,61,44,0.24)] sm:p-7">
            <div className="flex items-start justify-between border-b border-[#edf0eb] pb-5">
              <div>
                <div className="h-3 w-28 rounded-full bg-[#285c46]" />
                <div className="mt-3 h-2 w-40 rounded-full bg-[#d9ded8]" />
              </div>
              <div className="grid size-12 place-items-center rounded-full bg-[#e4ede3] text-sm font-medium text-[#497457]">AM</div>
            </div>
            <div className="grid grid-cols-[0.8fr_1.2fr] gap-5 pt-5">
              <div className="space-y-5">
                <div><div className="mb-3 h-2 w-16 rounded-full bg-[#8aaa8b]" /><div className="space-y-2"><div className="h-1.5 w-full rounded-full bg-[#e4e8e2]" /><div className="h-1.5 w-4/5 rounded-full bg-[#e4e8e2]" /><div className="h-1.5 w-3/4 rounded-full bg-[#e4e8e2]" /></div></div>
                <div><div className="mb-3 h-2 w-12 rounded-full bg-[#8aaa8b]" /><div className="space-y-2"><div className="h-1.5 w-full rounded-full bg-[#e4e8e2]" /><div className="h-1.5 w-3/4 rounded-full bg-[#e4e8e2]" /></div></div>
                <div className="flex flex-wrap gap-1.5"><span className="h-5 w-12 rounded-full bg-[#edf2ec]" /><span className="h-5 w-14 rounded-full bg-[#edf2ec]" /><span className="h-5 w-10 rounded-full bg-[#edf2ec]" /></div>
              </div>
              <div className="space-y-5 border-l border-[#edf0eb] pl-5">
                <div><div className="mb-3 h-2 w-20 rounded-full bg-[#8aaa8b]" /><div className="mb-2 h-2 w-32 rounded-full bg-[#bcc9bc]" /><div className="mb-2 h-1.5 w-24 rounded-full bg-[#e4e8e2]" /><div className="space-y-2 pt-1"><div className="h-1.5 w-full rounded-full bg-[#e4e8e2]" /><div className="h-1.5 w-11/12 rounded-full bg-[#e4e8e2]" /><div className="h-1.5 w-4/5 rounded-full bg-[#e4e8e2]" /></div></div>
                <div><div className="mb-3 h-2 w-24 rounded-full bg-[#8aaa8b]" /><div className="mb-2 h-2 w-28 rounded-full bg-[#bcc9bc]" /><div className="mb-2 h-1.5 w-20 rounded-full bg-[#e4e8e2]" /><div className="space-y-2 pt-1"><div className="h-1.5 w-full rounded-full bg-[#e4e8e2]" /><div className="h-1.5 w-3/4 rounded-full bg-[#e4e8e2]" /></div></div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-xl border border-[#e6eae3] bg-white px-4 py-3 shadow-lg sm:-left-9">
              <p className="text-[10px] font-medium uppercase tracking-widest text-[#889188]">Votre prochaine étape</p>
              <p className="mt-1 text-sm font-medium text-[#344839]">Commence ici <span className="ml-1 text-[#6e9a70]">↗</span></p>
            </div>
          </div>
        </div>
      </section>
      <footer className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 text-xs text-[#929890] sm:px-10">
        <span>© 2026 CVFlow</span><span>Une candidature à votre image.</span>
      </footer>
    </main>
  );
}
