import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Inscription",
};

export default function RegisterPage() {
  return (
    <>
      <div className="mb-7">
        <p className="mb-3 text-xs font-medium tracking-[0.16em] text-[#6b876d] uppercase">
          Bienvenue chez vous
        </p>
        <h1 className="text-3xl font-medium tracking-[-0.04em]">
          Créer un compte
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#737b73]">
          Un espace pour préparer vos prochaines candidatures.
        </p>
      </div>
      <RegisterForm />
    </>
  );
}
