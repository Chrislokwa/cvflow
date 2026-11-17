"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

const fieldClassName =
  "mt-2 h-11 w-full rounded-lg border border-[#dce2da] bg-white px-3.5 text-sm text-[#20241f] outline-none transition placeholder:text-[#9aa19a] focus:border-[#6b9272] focus:ring-3 focus:ring-[#6b9272]/15";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");
    setIsPending(true);

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        redirectTo: "/dashboard",
      });

      if (!result || result.error) {
        setServerError("Adresse e-mail ou mot de passe incorrect.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setServerError("Connexion impossible pour le moment. Réessayez.");
    } finally {
      setIsPending(false);
    }
  });

  const registered = searchParams.get("inscription") === "ok";

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      {registered && (
        <p className="rounded-lg bg-[#edf5ed] px-3.5 py-3 text-sm text-[#385d40]">
          Votre compte a été créé. Vous pouvez maintenant vous connecter.
        </p>
      )}
      <div>
        <label
          htmlFor="login-email"
          className="text-sm font-medium text-[#303a32]"
        >
          Adresse e-mail
        </label>
        <input
          {...register("email")}
          id="login-email"
          type="email"
          autoComplete="email"
          required
          className={fieldClassName}
          placeholder="vous@exemple.fr"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
        />
        {errors.email && (
          <p id="login-email-error" className="mt-1.5 text-xs text-[#a33f36]">
            {errors.email.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="login-password"
          className="text-sm font-medium text-[#303a32]"
        >
          Mot de passe
        </label>
        <input
          {...register("password")}
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          className={fieldClassName}
          placeholder="Votre mot de passe"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "login-password-error" : undefined
          }
        />
        {errors.password && (
          <p
            id="login-password-error"
            className="mt-1.5 text-xs text-[#a33f36]"
          >
            {errors.password.message}
          </p>
        )}
      </div>
      {serverError && (
        <p
          role="alert"
          className="rounded-lg bg-[#fff0ed] px-3.5 py-3 text-sm text-[#963d35]"
        >
          {serverError}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#285c46] px-5 text-sm font-medium text-white transition hover:bg-[#214c39] disabled:cursor-wait disabled:opacity-65"
      >
        {isPending ? "Connexion…" : "Se connecter"}
      </button>
      <p className="text-center text-sm text-[#737b73]">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="font-medium text-[#285c46] hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
