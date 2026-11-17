"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveProfileInterests } from "@/app/actions/profile-sections";
import {
  interestInputSchema,
  interestsSchema,
} from "@/lib/validations/profile-sections";
import type { z } from "zod";

const inputClassName =
  "h-11 min-w-0 flex-1 rounded-lg border border-[#dce2da] bg-white px-3.5 text-sm text-[#20241f] outline-none transition placeholder:text-[#9aa19a] focus:border-[#6b9272] focus:ring-3 focus:ring-[#6b9272]/15";

export function InterestTags({
  initialItems,
}: Readonly<{ initialItems: string[] }>) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof interestInputSchema>>({
    resolver: zodResolver(interestInputSchema),
    defaultValues: { interest: "" },
    mode: "onBlur",
  });

  function save(nextItems: string[], afterSave: () => void) {
    setServerError("");
    startTransition(async () => {
      const validated = interestsSchema.safeParse(nextItems);
      if (!validated.success) {
        setServerError(
          validated.error.issues[0]?.message ??
            "Vérifiez vos centres d’intérêt.",
        );
        return;
      }

      try {
        const result = await saveProfileInterests(validated.data);
        if (!result.success) {
          setServerError(result.message);
          return;
        }

        setItems(validated.data);
        afterSave();
        router.refresh();
      } catch {
        setServerError("Impossible d’enregistrer vos centres d’intérêt.");
      }
    });
  }

  const onAdd = handleSubmit((values) => {
    const normalized = values.interest.trim();
    if (
      items.some(
        (item) => item.toLocaleLowerCase() === normalized.toLocaleLowerCase(),
      )
    ) {
      setError("interest", { message: "Cet intérêt est déjà dans la liste." });
      return;
    }
    if (items.length >= 30) {
      setError("interest", {
        message: "Ajoutez 30 centres d’intérêt maximum.",
      });
      return;
    }

    save([...items, normalized], () => reset({ interest: "" }));
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#303a32]">
          Centres d’intérêt
        </h2>
        <p className="mt-1 text-sm text-[#7b837b]">
          Ajoutez des mots-clés qui complètent votre profil.
        </p>
      </div>

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={onAdd}
        noValidate
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="new-interest" className="sr-only">
            Ajouter un centre d’intérêt
          </label>
          <input
            {...register("interest")}
            id="new-interest"
            className={inputClassName}
            placeholder="Ex. randonnée, photographie"
            maxLength={50}
            aria-invalid={Boolean(errors.interest)}
            aria-describedby={errors.interest ? "interest-error" : undefined}
          />
          {errors.interest && (
            <p id="interest-error" className="mt-1.5 text-xs text-[#a33f36]">
              {errors.interest.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#285c46] px-5 text-sm font-medium text-white transition hover:bg-[#214c39] disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? "Enregistrement…" : "Ajouter"}
        </button>
      </form>

      {serverError && (
        <p
          role="alert"
          className="rounded-lg bg-[#fff0ed] px-3.5 py-3 text-sm text-[#963d35]"
        >
          {serverError}
        </p>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#dce4da] bg-[#fafbf9] px-5 py-12 text-center">
          <div
            aria-hidden="true"
            className="mx-auto grid size-11 place-items-center rounded-full bg-[#eaf0e8] text-xl text-[#67866b]"
          >
            #
          </div>
          <p className="mt-4 text-sm font-medium text-[#4d5c4f]">
            Aucun centre d’intérêt ajouté
          </p>
          <p className="mt-1 text-sm text-[#858d85]">
            Vos mots-clés apparaîtront ici.
          </p>
        </div>
      ) : (
        <ul
          aria-label="Centres d’intérêt enregistrés"
          className="flex flex-wrap gap-2"
        >
          {items.map((item, index) => (
            <li key={`${item.toLocaleLowerCase()}-${index}`}>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#dce7da] bg-[#f0f5ef] py-1 pr-1.5 pl-3.5 text-sm text-[#405b44]">
                {item}
                <button
                  type="button"
                  aria-label={`Supprimer ${item}`}
                  disabled={isPending}
                  onClick={() =>
                    save(
                      items.filter((_, itemIndex) => itemIndex !== index),
                      () => undefined,
                    )
                  }
                  className="grid size-7 place-items-center rounded-full text-base text-[#637b65] transition hover:bg-[#dfe9dd] disabled:opacity-50"
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
