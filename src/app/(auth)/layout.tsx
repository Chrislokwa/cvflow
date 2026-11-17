import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7f4] px-5 py-12 text-[#20241f]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 -right-40 size-[34rem] rounded-full bg-[#dce9dc] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -left-48 size-[32rem] rounded-full bg-[#ebe8dc] blur-3xl"
      />
      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mx-auto mb-8 flex w-fit items-center gap-2.5 font-semibold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-[#285c46] text-sm text-white">
            cv
          </span>
          <span className="text-xl">CVFlow</span>
        </Link>
        <div className="rounded-2xl border border-[#e5e9e2] bg-white/90 p-6 shadow-[0_24px_80px_-36px_rgba(37,61,44,0.25)] sm:p-9">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-[#929890]">
          Votre parcours, avec clarté.
        </p>
      </div>
    </main>
  );
}
