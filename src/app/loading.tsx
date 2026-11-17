export default function Loading() {
  return <main aria-busy="true" aria-live="polite" className="mx-auto flex min-h-[50vh] w-full max-w-7xl items-center justify-center px-5 py-12 sm:px-8">
    <div className="w-full max-w-xl animate-pulse space-y-4 rounded-2xl border border-[#e5e9e2] bg-white p-6 sm:p-8">
      <div className="h-5 w-40 rounded bg-[#e9eee7]" />
      <div className="h-8 w-3/4 rounded bg-[#e9eee7]" />
      <div className="h-3 w-full rounded bg-[#f0f3ee]" />
      <div className="h-3 w-5/6 rounded bg-[#f0f3ee]" />
      <p className="pt-2 text-center text-sm text-[#737b73]">Chargement de votre espace…</p>
    </div>
  </main>;
}
