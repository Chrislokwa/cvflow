import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion — CVFlow",
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-7">
        <p className="mb-3 text-xs font-medium tracking-[0.16em] text-[#6b876d] uppercase">
          Content de vous revoir
        </p>
        <h1 className="text-3xl font-medium tracking-[-0.04em]">Connexion</h1>
        <p className="mt-2 text-sm leading-6 text-[#737b73]">
          Retrouvez vos CV et vos lettres de motivation.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-xl bg-[#f4f6f2]" />
        }
      >
        <LoginForm />
      </Suspense>
    </>
  );
}
