"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveProfileItem } from "@/app/actions/profile-sections";
import type { ProfileSectionItem } from "@/lib/profile-section-types";
import {
  certificationSchema,
  educationSchema,
  experienceSchema,
  languageLevels,
  languageSchema,
  projectSchema,
  skillSchema,
  type CertificationInput,
  type EducationInput,
  type ExperienceInput,
  type LanguageInput,
  type ProfileItemInput,
  type ProfileItemKind,
  type ProjectInput,
  type SkillInput,
} from "@/lib/validations/profile-sections";

const inputClassName =
  "mt-2 h-11 w-full rounded-lg border border-[#dce2da] bg-white px-3.5 text-sm text-[#20241f] outline-none transition placeholder:text-[#9aa19a] focus:border-[#6b9272] focus:ring-3 focus:ring-[#6b9272]/15 aria-invalid:border-[#bd5c51]";
const textareaClassName =
  "mt-2 w-full resize-y rounded-lg border border-[#dce2da] bg-white px-3.5 py-3 text-sm leading-6 text-[#20241f] outline-none transition placeholder:text-[#9aa19a] focus:border-[#6b9272] focus:ring-3 focus:ring-[#6b9272]/15 aria-invalid:border-[#bd5c51]";

type SectionEditorProps = {
  kind: ProfileItemKind;
  item: ProfileSectionItem | null;
  onSaved: () => void;
};

function useProfileItemSubmit(onSaved: () => void) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");

  function submit(input: ProfileItemInput) {
    setServerError("");
    startTransition(async () => {
      try {
        const result = await saveProfileItem(input);
        if (!result.success) {
          setServerError(result.message);
          return;
        }
        onSaved();
      } catch {
        setServerError("Impossible d’enregistrer cet élément pour le moment.");
      }
    });
  }

  return { isPending, serverError, submit };
}

export function SectionEditor({ kind, item, onSaved }: SectionEditorProps) {
  switch (kind) {
    case "education":
      return (
        <EducationEditor
          item={item?.kind === "education" ? item : null}
          onSaved={onSaved}
        />
      );
    case "experience":
      return (
        <ExperienceEditor
          item={item?.kind === "experience" ? item : null}
          onSaved={onSaved}
        />
      );
    case "skill":
      return (
        <SkillEditor
          item={item?.kind === "skill" ? item : null}
          onSaved={onSaved}
        />
      );
    case "language":
      return (
        <LanguageEditor
          item={item?.kind === "language" ? item : null}
          onSaved={onSaved}
        />
      );
    case "project":
      return (
        <ProjectEditor
          item={item?.kind === "project" ? item : null}
          onSaved={onSaved}
        />
      );
    case "certification":
      return (
        <CertificationEditor
          item={item?.kind === "certification" ? item : null}
          onSaved={onSaved}
        />
      );
  }
}

function EditorActions({
  isPending,
  serverError,
}: Readonly<{ isPending: boolean; serverError: string }>) {
  return (
    <>
      {serverError && (
        <p
          role="alert"
          className="rounded-lg bg-[#fff0ed] px-3.5 py-3 text-sm text-[#963d35]"
        >
          {serverError}
        </p>
      )}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#285c46] px-5 text-sm font-medium text-white transition hover:bg-[#214c39] disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </>
  );
}

function FieldError({ children }: Readonly<{ children?: React.ReactNode }>) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs text-[#a33f36]">{children}</p>;
}

function EducationEditor({
  item,
  onSaved,
}: Readonly<{
  item: Extract<ProfileSectionItem, { kind: "education" }> | null;
  onSaved: () => void;
}>) {
  const { isPending, serverError, submit } = useProfileItemSubmit(onSaved);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<EducationInput>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      kind: "education",
      id: item?.id,
      degree: item?.degree ?? "",
      institution: item?.institution ?? "",
      city: item?.city ?? "",
      startDate: item?.startDate ?? "",
      endDate: item?.endDate ?? "",
      current: item?.current ?? false,
      description: item?.description ?? "",
    },
  });
  const current = useWatch({ control, name: "current" });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <div>
        <label
          htmlFor="education-degree"
          className="text-sm font-medium text-[#303a32]"
        >
          Diplôme
        </label>
        <input
          {...register("degree")}
          id="education-degree"
          className={inputClassName}
          autoFocus
          aria-invalid={Boolean(errors.degree)}
        />
        <FieldError>{errors.degree?.message}</FieldError>
      </div>
      <div>
        <label
          htmlFor="education-institution"
          className="text-sm font-medium text-[#303a32]"
        >
          Établissement
        </label>
        <input
          {...register("institution")}
          id="education-institution"
          className={inputClassName}
          aria-invalid={Boolean(errors.institution)}
        />
        <FieldError>{errors.institution?.message}</FieldError>
      </div>
      <div>
        <label
          htmlFor="education-city"
          className="text-sm font-medium text-[#303a32]"
        >
          Lieu
        </label>
        <input
          {...register("city")}
          id="education-city"
          className={inputClassName}
          placeholder="Ville, pays"
          aria-invalid={Boolean(errors.city)}
        />
        <FieldError>{errors.city?.message}</FieldError>
      </div>
      <DateFields
        idPrefix="education"
        registerStart={register("startDate")}
        registerEnd={register("endDate")}
        current={Boolean(current)}
        startError={errors.startDate?.message}
        endError={errors.endDate?.message}
        registerCurrent={register("current", {
          onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.checked) {
              setValue("endDate", "", { shouldValidate: true });
            }
          },
        })}
      />
      <div>
        <label
          htmlFor="education-description"
          className="text-sm font-medium text-[#303a32]"
        >
          Description
        </label>
        <textarea
          {...register("description")}
          id="education-description"
          rows={3}
          className={textareaClassName}
          aria-invalid={Boolean(errors.description)}
        />
        <FieldError>{errors.description?.message}</FieldError>
      </div>
      <EditorActions isPending={isPending} serverError={serverError} />
    </form>
  );
}

function ExperienceEditor({
  item,
  onSaved,
}: Readonly<{
  item: Extract<ProfileSectionItem, { kind: "experience" }> | null;
  onSaved: () => void;
}>) {
  const { isPending, serverError, submit } = useProfileItemSubmit(onSaved);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ExperienceInput>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      kind: "experience",
      id: item?.id,
      position: item?.position ?? "",
      company: item?.company ?? "",
      city: item?.city ?? "",
      startDate: item?.startDate ?? "",
      endDate: item?.endDate ?? "",
      current: item?.current ?? false,
      bulletsText: item?.bullets.join("\n") ?? "",
    },
  });
  const current = useWatch({ control, name: "current" });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <div>
        <label
          htmlFor="experience-position"
          className="text-sm font-medium text-[#303a32]"
        >
          Poste
        </label>
        <input
          {...register("position")}
          id="experience-position"
          className={inputClassName}
          autoFocus
          aria-invalid={Boolean(errors.position)}
        />
        <FieldError>{errors.position?.message}</FieldError>
      </div>
      <div>
        <label
          htmlFor="experience-company"
          className="text-sm font-medium text-[#303a32]"
        >
          Organisation
        </label>
        <input
          {...register("company")}
          id="experience-company"
          className={inputClassName}
          aria-invalid={Boolean(errors.company)}
        />
        <FieldError>{errors.company?.message}</FieldError>
      </div>
      <div>
        <label
          htmlFor="experience-city"
          className="text-sm font-medium text-[#303a32]"
        >
          Lieu
        </label>
        <input
          {...register("city")}
          id="experience-city"
          className={inputClassName}
          placeholder="Ville, pays"
          aria-invalid={Boolean(errors.city)}
        />
        <FieldError>{errors.city?.message}</FieldError>
      </div>
      <DateFields
        idPrefix="experience"
        registerStart={register("startDate")}
        registerEnd={register("endDate")}
        current={Boolean(current)}
        startError={errors.startDate?.message}
        endError={errors.endDate?.message}
        registerCurrent={register("current", {
          onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.checked) {
              setValue("endDate", "", { shouldValidate: true });
            }
          },
        })}
      />
      <div>
        <label
          htmlFor="experience-bullets"
          className="text-sm font-medium text-[#303a32]"
        >
          Description en puces
        </label>
        <textarea
          {...register("bulletsText")}
          id="experience-bullets"
          rows={5}
          className={textareaClassName}
          placeholder={
            "Une réalisation par ligne\nEx. Réduction du temps de traitement de 20 %"
          }
          aria-invalid={Boolean(errors.bulletsText)}
        />
        <p className="mt-1 text-xs text-[#858d85]">
          Chaque ligne sera enregistrée comme une puce.
        </p>
        <FieldError>{errors.bulletsText?.message}</FieldError>
      </div>
      <EditorActions isPending={isPending} serverError={serverError} />
    </form>
  );
}

function DateFields({
  idPrefix,
  registerStart,
  registerEnd,
  registerCurrent,
  current,
  startError,
  endError,
}: Readonly<{
  idPrefix: string;
  registerStart: UseFormRegisterReturn;
  registerEnd: UseFormRegisterReturn;
  registerCurrent: UseFormRegisterReturn;
  current: boolean;
  startError?: string;
  endError?: string;
}>) {
  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${idPrefix}-start-date`}
            className="text-sm font-medium text-[#303a32]"
          >
            Date de début
          </label>
          <input
            {...registerStart}
            id={`${idPrefix}-start-date`}
            type="date"
            className={inputClassName}
            aria-invalid={Boolean(startError)}
          />
          <FieldError>{startError}</FieldError>
        </div>
        <div>
          <label
            htmlFor={`${idPrefix}-end-date`}
            className="text-sm font-medium text-[#303a32]"
          >
            Date de fin
          </label>
          <input
            {...registerEnd}
            id={`${idPrefix}-end-date`}
            type="date"
            disabled={current}
            className={`${inputClassName} disabled:bg-[#f4f6f3] disabled:text-[#8a918a]`}
            aria-invalid={Boolean(endError)}
          />
          <FieldError>{endError}</FieldError>
        </div>
      </div>
      <label className="flex w-fit items-center gap-2.5 text-sm text-[#4e5a50]">
        <input
          {...registerCurrent}
          type="checkbox"
          className="size-4 rounded border-[#bfcabf] accent-[#285c46]"
        />
        En cours
      </label>
    </div>
  );
}

function SkillEditor({
  item,
  onSaved,
}: Readonly<{
  item: Extract<ProfileSectionItem, { kind: "skill" }> | null;
  onSaved: () => void;
}>) {
  const { isPending, serverError, submit } = useProfileItemSubmit(onSaved);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SkillInput>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      kind: "skill",
      id: item?.id,
      name: item?.name ?? "",
      level: item?.level ?? 3,
      category: item?.category ?? "",
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <div>
        <label
          htmlFor="skill-name"
          className="text-sm font-medium text-[#303a32]"
        >
          Compétence
        </label>
        <input
          {...register("name")}
          id="skill-name"
          className={inputClassName}
          autoFocus
          aria-invalid={Boolean(errors.name)}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </div>
      <div>
        <label
          htmlFor="skill-level"
          className="text-sm font-medium text-[#303a32]"
        >
          Niveau (1 à 5)
        </label>
        <select
          {...register("level", { valueAsNumber: true })}
          id="skill-level"
          className={inputClassName}
          aria-invalid={Boolean(errors.level)}
        >
          {[1, 2, 3, 4, 5].map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <FieldError>{errors.level?.message}</FieldError>
      </div>
      <div>
        <label
          htmlFor="skill-category"
          className="text-sm font-medium text-[#303a32]"
        >
          Catégorie
        </label>
        <input
          {...register("category")}
          id="skill-category"
          className={inputClassName}
          placeholder="Ex. Design, technique, outils"
          aria-invalid={Boolean(errors.category)}
        />
        <FieldError>{errors.category?.message}</FieldError>
      </div>
      <EditorActions isPending={isPending} serverError={serverError} />
    </form>
  );
}

function LanguageEditor({
  item,
  onSaved,
}: Readonly<{
  item: Extract<ProfileSectionItem, { kind: "language" }> | null;
  onSaved: () => void;
}>) {
  const { isPending, serverError, submit } = useProfileItemSubmit(onSaved);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LanguageInput>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      kind: "language",
      id: item?.id,
      name: item?.name ?? "",
      level: item?.level ?? "B2",
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <div>
        <label
          htmlFor="language-name"
          className="text-sm font-medium text-[#303a32]"
        >
          Langue
        </label>
        <input
          {...register("name")}
          id="language-name"
          className={inputClassName}
          autoFocus
          aria-invalid={Boolean(errors.name)}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </div>
      <div>
        <label
          htmlFor="language-level"
          className="text-sm font-medium text-[#303a32]"
        >
          Niveau
        </label>
        <select
          {...register("level")}
          id="language-level"
          className={inputClassName}
          aria-invalid={Boolean(errors.level)}
        >
          {languageLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <FieldError>{errors.level?.message}</FieldError>
      </div>
      <EditorActions isPending={isPending} serverError={serverError} />
    </form>
  );
}

function ProjectEditor({
  item,
  onSaved,
}: Readonly<{
  item: Extract<ProfileSectionItem, { kind: "project" }> | null;
  onSaved: () => void;
}>) {
  const { isPending, serverError, submit } = useProfileItemSubmit(onSaved);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      kind: "project",
      id: item?.id,
      name: item?.name ?? "",
      description: item?.description ?? "",
      url: item?.url ?? "",
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <div>
        <label
          htmlFor="project-name"
          className="text-sm font-medium text-[#303a32]"
        >
          Nom du projet
        </label>
        <input
          {...register("name")}
          id="project-name"
          className={inputClassName}
          autoFocus
          aria-invalid={Boolean(errors.name)}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </div>
      <div>
        <label
          htmlFor="project-description"
          className="text-sm font-medium text-[#303a32]"
        >
          Description
        </label>
        <textarea
          {...register("description")}
          id="project-description"
          rows={4}
          className={textareaClassName}
          aria-invalid={Boolean(errors.description)}
        />
        <FieldError>{errors.description?.message}</FieldError>
      </div>
      <div>
        <label
          htmlFor="project-url"
          className="text-sm font-medium text-[#303a32]"
        >
          Lien
        </label>
        <input
          {...register("url")}
          id="project-url"
          type="url"
          className={inputClassName}
          placeholder="https://exemple.fr"
          aria-invalid={Boolean(errors.url)}
        />
        <FieldError>{errors.url?.message}</FieldError>
      </div>
      <EditorActions isPending={isPending} serverError={serverError} />
    </form>
  );
}

function CertificationEditor({
  item,
  onSaved,
}: Readonly<{
  item: Extract<ProfileSectionItem, { kind: "certification" }> | null;
  onSaved: () => void;
}>) {
  const { isPending, serverError, submit } = useProfileItemSubmit(onSaved);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CertificationInput>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      kind: "certification",
      id: item?.id,
      name: item?.name ?? "",
      issuer: item?.issuer ?? "",
      year: item?.year ?? "",
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <div>
        <label
          htmlFor="certification-name"
          className="text-sm font-medium text-[#303a32]"
        >
          Nom de la certification
        </label>
        <input
          {...register("name")}
          id="certification-name"
          className={inputClassName}
          autoFocus
          aria-invalid={Boolean(errors.name)}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </div>
      <div>
        <label
          htmlFor="certification-issuer"
          className="text-sm font-medium text-[#303a32]"
        >
          Organisme
        </label>
        <input
          {...register("issuer")}
          id="certification-issuer"
          className={inputClassName}
          aria-invalid={Boolean(errors.issuer)}
        />
        <FieldError>{errors.issuer?.message}</FieldError>
      </div>
      <div>
        <label
          htmlFor="certification-year"
          className="text-sm font-medium text-[#303a32]"
        >
          Année
        </label>
        <input
          {...register("year")}
          id="certification-year"
          type="number"
          inputMode="numeric"
          min="1900"
          max="2200"
          className={inputClassName}
          aria-invalid={Boolean(errors.year)}
        />
        <FieldError>{errors.year?.message}</FieldError>
      </div>
      <EditorActions isPending={isPending} serverError={serverError} />
    </form>
  );
}
