import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { logout } from "@/app/actions/auth";

export const instant = false;

const navigationItems = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/profile", label: "Profil" },
  { href: "/cvs", label: "Mes CV" },
  { href: "/letters", label: "Mes lettres" },
];

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await connection();
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userLabel = session.user.name || session.user.email || "Mon compte";

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#20241f]">
      <header className="border-b border-[#e6eae3] bg-white/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-6">
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-[#285c46] text-sm text-white">
                cv
              </span>
              <span className="text-xl">CVFlow</span>
            </Link>
            <div className="flex items-center gap-2 lg:hidden">
              <span className="max-w-32 truncate text-xs text-[#6e766e]">
                {userLabel}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg border border-[#dce2da] px-3 py-2 text-xs font-medium text-[#455449]"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
          <nav
            aria-label="Navigation principale"
            className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:mx-0 lg:pb-0"
          >
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-lg px-3 py-2 text-sm text-[#59635a] transition hover:bg-[#f1f4ef] hover:text-[#285c46]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <span className="max-w-48 truncate text-sm text-[#687168]">
              {userLabel}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-[#dce2da] px-3.5 py-2 text-sm font-medium text-[#455449] transition hover:bg-[#f6f8f5]"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}
