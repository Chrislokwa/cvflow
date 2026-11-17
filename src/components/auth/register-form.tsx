"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerAccount } from "@/app/actions/auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

const fieldClassName =
  "mt-2 h-11 w-full rounded-lg border border-[#dce2da] bg-white px-3.5 text-sm text-[#20241f] outline-none transition placeholder:text-[#9aa19a] focus:border-[#6b9272] focus:ring-3 focus:ring-[#6b9272]/15";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = handleSubmit((values) => {
    setServerError("");
    startTransition(async () => {
      const result = await registerAccount(values);

      if (!result.success) {
        setServerError(result.message);
        for (const [field, message] of Object.entries(
          result.fieldErrors ?? {},
        )) {
          if (
            field === "email" ||
            field === "password" ||
            field === "confirmPassword"
          ) {
            setError(field, { message });
          }
        }
        return;
      }

      router.push("/login?inscription=ok");
      router.refresh();
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div>
        <label
          htmlFor="register-email"
          className="text-sm font-medium text-[#303a32]"
        >
          Adresse e-mail
        </label>
        <input
          {...register("email")}
          id="register-email"
          type="email"
          autoComplete="email"
          required
          className={fieldClassName}
          placeholder="vous@exemple.fr"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "register-email-error" : undefined}
        />
        {errors.email && (
          <p
            id="register-email-error"
            className="mt-1.5 text-xs text-[#a33f36]"
          >
            {errors.email.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="register-password"
          className="text-sm font-medium text-[#303a32]"
        >
          Mot de passe
        </label>
        <input
          {...register("password")}
          id="register-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={fieldClassName}
          placeholder="8 caractères minimum"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "register-password-error" : undefined
          }
        />
        {errors.password && (
          <p
            id="register-password-error"
            className="mt-1.5 text-xs text-[#a33f36]"
          >
            {errors.password.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="register-confirm-password"
          className="text-sm font-medium text-[#303a32]"
        >
          Confirmer le mot de passe
        </label>
        <input
          {...register("confirmPassword")}
          id="register-confirm-password"
          type="password"
          autoComplete="new-password"
          required
          className={fieldClassName}
          placeholder="Saisissez à nouveau le mot de passe"
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={
            errors.confirmPassword
              ? "register-confirm-password-error"
              : undefined
          }
        />
        {errors.confirmPassword && (
          <p
            id="register-confirm-password-error"
            className="mt-1.5 text-xs text-[#a33f36]"
          >
            {errors.confirmPassword.message}
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
        {isPending ? "Création du compte…" : "Créer mon compte"}
      </button>
      <p className="text-center text-sm text-[#737b73]">
        Déjà inscrit ?{" "}
        <Link
          href="/login"
          className="font-medium text-[#285c46] hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}
