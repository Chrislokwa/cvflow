"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveProfile } from "@/app/actions/profile";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";

const maxPhotoBytes = 300 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const profileFields = [
  "firstName",
  "lastName",
  "postName",
  "title",
  "email",
  "phone",
  "address",
  "city",
  "country",
  "birthPlace",
  "birthDate",
  "maritalStatus",
  "gender",
  "nationality",
  "website",
  "linkedin",
  "otherLink",
  "summary",
  "photo",
] as const satisfies readonly (keyof ProfileInput)[];

type IdentityFormProps = {
  initialValues: ProfileInput;
};

type Notification = {
  type: "success" | "error";
  message: string;
};

const inputClassName =
  "mt-2 h-11 w-full rounded-lg border border-[#dce2da] bg-white px-3.5 text-sm text-[#20241f] outline-none transition placeholder:text-[#9aa19a] focus:border-[#6b9272] focus:ring-3 focus:ring-[#6b9272]/15 aria-invalid:border-[#bd5c51]";

function isProfileField(field: string): field is keyof ProfileInput {
  return profileFields.includes(field as keyof ProfileInput);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          "Le fichier sélectionné ne peut pas être lu comme une image.",
        ),
      );
    };
    image.src = objectUrl;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("La photo ne peut pas être préparée."));
      }
    };
    reader.onerror = () =>
      reject(new Error("La photo ne peut pas être préparée."));
    reader.readAsDataURL(blob);
  });
}

async function resizeImage(file: File): Promise<string> {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Choisissez une image au format JPEG, PNG ou WebP.");
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error(
      "Le fichier sélectionné est trop volumineux pour être traité.",
    );
  }

  const image = await loadImage(file);
  const initialScale = Math.min(
    1,
    300 / Math.max(image.naturalWidth, image.naturalHeight),
  );
  let width = Math.max(1, Math.round(image.naturalWidth * initialScale));
  let height = Math.max(1, Math.round(image.naturalHeight * initialScale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("La photo ne peut pas être préparée dans ce navigateur.");
  }

  for (let resizeAttempt = 0; resizeAttempt < 5; resizeAttempt += 1) {
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    for (const quality of [0.9, 0.8, 0.7, 0.6, 0.5, 0.4]) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality),
      );

      if (blob && blob.size <= maxPhotoBytes) {
        return blobToDataUrl(blob);
      }
    }

    width = Math.max(96, Math.floor(width * 0.8));
    height = Math.max(96, Math.floor(height * 0.8));
  }

  throw new Error(
    "La photo dépasse 300 Ko après réduction. Choisissez une autre image.",
  );
}

export function IdentityForm({ initialValues }: IdentityFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [notification, setNotification] = useState<Notification | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  const photo = useWatch({ control, name: "photo" });
  const summary = useWatch({ control, name: "summary" }) ?? "";

  useEffect(() => {
    if (!notification) return;

    const timeoutId = window.setTimeout(() => setNotification(null), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [notification]);

  function handlePhotoSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPhotoError("");
    setNotification(null);
    setIsProcessingPhoto(true);

    void resizeImage(file)
      .then((dataUrl) => {
        setValue("photo", dataUrl, { shouldDirty: true, shouldValidate: true });
      })
      .catch((error: unknown) => {
        setPhotoError(
          error instanceof Error
            ? error.message
            : "La photo ne peut pas être préparée.",
        );
      })
      .finally(() => setIsProcessingPhoto(false));
  }

  const onSubmit = handleSubmit((values) => {
    setNotification(null);
    startTransition(async () => {
      try {
        const result = await saveProfile(values);
        if (!result.success) {
          setNotification({ type: "error", message: result.message });
          for (const [field, message] of Object.entries(
            result.fieldErrors ?? {},
          )) {
            if (message && isProfileField(field)) {
              setError(field, { message });
            }
          }
          return;
        }

        reset(values);
        setPhotoError("");
        setNotification({
          type: "success",
          message: "Votre profil a été enregistré.",
        });
        router.refresh();
      } catch {
        setNotification({
          type: "error",
          message: "Impossible d’enregistrer votre profil pour le moment.",
        });
      }
    });
  });

  return (
    <>
      {notification && (
        <div
          role={notification.type === "success" ? "status" : "alert"}
          aria-live={notification.type === "success" ? "polite" : "assertive"}
          className={`fixed top-4 right-4 z-50 max-w-[calc(100vw-2rem)] rounded-xl border px-4 py-3 text-sm shadow-lg sm:top-8 sm:right-8 ${
            notification.type === "success"
              ? "border-[#d5e5d6] bg-white text-[#315b39]"
              : "border-[#f0d5d1] bg-white text-[#963d35]"
          }`}
        >
          {notification.message}
        </div>
      )}

      <form className="space-y-8" onSubmit={onSubmit} noValidate>
        <section
          aria-labelledby="identity-details-heading"
          className="space-y-5"
        >
          <div>
            <h2
              id="identity-details-heading"
              className="text-base font-semibold text-[#303a32]"
            >
              Informations personnelles
            </h2>
            <p className="mt-1 text-sm text-[#7b837b]">
              Les informations personnelles sont facultatives. Seules celles que vous renseignez apparaîtront dans le CV.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="text-sm font-medium text-[#303a32]"
              >
                Prénom{" "}
                <span aria-hidden="true" className="text-[#a4493f]">
                  *
                </span>
              </label>
              <input
                {...register("firstName")}
                id="firstName"
                autoComplete="given-name"
                required
                className={inputClassName}
                aria-invalid={Boolean(errors.firstName)}
              />
              {errors.firstName && (
                <FieldMessage>{errors.firstName.message}</FieldMessage>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="text-sm font-medium text-[#303a32]"
              >
                Nom{" "}
                <span aria-hidden="true" className="text-[#a4493f]">
                  *
                </span>
              </label>
              <input
                {...register("lastName")}
                id="lastName"
                autoComplete="family-name"
                required
                className={inputClassName}
                aria-invalid={Boolean(errors.lastName)}
              />
              {errors.lastName && (
                <FieldMessage>{errors.lastName.message}</FieldMessage>
              )}
            </div>
            <div>
              <label htmlFor="postName" className="text-sm font-medium text-[#303a32]">Post-nom <span className="font-normal text-[#858d85]">(facultatif)</span></label>
              <input {...register("postName")} id="postName" autoComplete="additional-name" className={inputClassName} aria-invalid={Boolean(errors.postName)} />
              {errors.postName && <FieldMessage>{errors.postName.message}</FieldMessage>}
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-[#303a32]"
              >
                Titre professionnel
              </label>
              <input
                {...register("title")}
                id="title"
                autoComplete="organization-title"
                className={inputClassName}
                placeholder="Ex. Cheffe de projet numérique"
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title && (
                <FieldMessage>{errors.title.message}</FieldMessage>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#303a32]"
              >
                E-mail{" "}
                <span aria-hidden="true" className="text-[#a4493f]">
                  *
                </span>
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                required
                className={inputClassName}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && (
                <FieldMessage>{errors.email.message}</FieldMessage>
              )}
            </div>
            <div>
              <label
                htmlFor="phone"
                className="text-sm font-medium text-[#303a32]"
              >
                Téléphone
              </label>
              <input
                {...register("phone")}
                id="phone"
                type="tel"
                autoComplete="tel"
                className={inputClassName}
                placeholder="+33 6 12 34 56 78"
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && (
                <FieldMessage>{errors.phone.message}</FieldMessage>
              )}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className="text-sm font-medium text-[#303a32]">Adresse</label>
              <input {...register("address")} id="address" autoComplete="street-address" className={inputClassName} aria-invalid={Boolean(errors.address)} />
              {errors.address && <FieldMessage>{errors.address.message}</FieldMessage>}
            </div>
            <div>
              <label
                htmlFor="city"
                className="text-sm font-medium text-[#303a32]"
              >
                Ville
              </label>
              <input
                {...register("city")}
                id="city"
                autoComplete="address-level2"
                className={inputClassName}
                aria-invalid={Boolean(errors.city)}
              />
              {errors.city && (
                <FieldMessage>{errors.city.message}</FieldMessage>
              )}
            </div>
            <div>
              <label
                htmlFor="country"
                className="text-sm font-medium text-[#303a32]"
              >
                Pays
              </label>
              <input
                {...register("country")}
                id="country"
                autoComplete="country-name"
                className={inputClassName}
                aria-invalid={Boolean(errors.country)}
              />
              {errors.country && (
                <FieldMessage>{errors.country.message}</FieldMessage>
              )}
            </div>
            <div>
              <label htmlFor="birthDate" className="text-sm font-medium text-[#303a32]">Date de naissance <span className="font-normal text-[#858d85]">(facultative)</span></label>
              <input {...register("birthDate")} id="birthDate" type="date" autoComplete="bday" className={inputClassName} aria-invalid={Boolean(errors.birthDate)} />
              {errors.birthDate && <FieldMessage>{errors.birthDate.message}</FieldMessage>}
            </div>
            <div>
              <label htmlFor="birthPlace" className="text-sm font-medium text-[#303a32]">Lieu de naissance <span className="font-normal text-[#858d85]">(facultatif)</span></label>
              <input {...register("birthPlace")} id="birthPlace" autoComplete="off" className={inputClassName} placeholder="Ex. Kinshasa" aria-invalid={Boolean(errors.birthPlace)} />
              {errors.birthPlace && <FieldMessage>{errors.birthPlace.message}</FieldMessage>}
            </div>
            <div>
              <label htmlFor="nationality" className="text-sm font-medium text-[#303a32]">Nationalité <span className="font-normal text-[#858d85]">(facultative)</span></label>
              <input {...register("nationality")} id="nationality" autoComplete="nationality" className={inputClassName} aria-invalid={Boolean(errors.nationality)} />
              {errors.nationality && <FieldMessage>{errors.nationality.message}</FieldMessage>}
            </div>
            <div>
              <label htmlFor="maritalStatus" className="text-sm font-medium text-[#303a32]">État civil <span className="font-normal text-[#858d85]">(facultatif)</span></label>
              <input {...register("maritalStatus")} id="maritalStatus" className={inputClassName} placeholder="Ex. célibataire, mariée" aria-invalid={Boolean(errors.maritalStatus)} />
              {errors.maritalStatus && <FieldMessage>{errors.maritalStatus.message}</FieldMessage>}
            </div>
            <div>
              <label htmlFor="gender" className="text-sm font-medium text-[#303a32]">Sexe <span className="font-normal text-[#858d85]">(facultatif)</span></label>
              <input {...register("gender")} id="gender" className={inputClassName} aria-invalid={Boolean(errors.gender)} />
              {errors.gender && <FieldMessage>{errors.gender.message}</FieldMessage>}
            </div>
            <div>
              <label
                htmlFor="website"
                className="text-sm font-medium text-[#303a32]"
              >
                Site web ou portfolio <span className="font-normal text-[#858d85]">(facultatif)</span>
              </label>
              <input
                {...register("website")}
                id="website"
                type="url"
                autoComplete="url"
                className={inputClassName}
                placeholder="https://exemple.fr"
                aria-invalid={Boolean(errors.website)}
              />
              {errors.website && (
                <FieldMessage>{errors.website.message}</FieldMessage>
              )}
            </div>
            <div>
              <label
                htmlFor="linkedin"
                className="text-sm font-medium text-[#303a32]"
              >
                Profil professionnel (LinkedIn, etc.) <span className="font-normal text-[#858d85]">(facultatif)</span>
              </label>
              <input
                {...register("linkedin")}
                id="linkedin"
                type="url"
                className={inputClassName}
                placeholder="https://linkedin.com/in/votre-profil"
                aria-invalid={Boolean(errors.linkedin)}
              />
              {errors.linkedin && (
                <FieldMessage>{errors.linkedin.message}</FieldMessage>
              )}
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="otherLink"
                className="text-sm font-medium text-[#303a32]"
              >
                Autre lien professionnel <span className="font-normal text-[#858d85]">(facultatif)</span>
              </label>
              <input
                {...register("otherLink")}
                id="otherLink"
                type="url"
                className={inputClassName}
                placeholder="Ex. GitHub, portfolio, site de réalisations"
                aria-invalid={Boolean(errors.otherLink)}
              />
              {errors.otherLink && (
                <FieldMessage>{errors.otherLink.message}</FieldMessage>
              )}
            </div>
          </div>
        </section>

        <section aria-labelledby="summary-heading" className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <label
              id="summary-heading"
              htmlFor="summary"
              className="text-sm font-medium text-[#303a32]"
            >
              Résumé professionnel (facultatif)
            </label>
            <span
              className="shrink-0 text-xs text-[#858d85] tabular-nums"
              aria-live="polite"
            >
              {summary.length}/600
            </span>
          </div>
          <textarea
            {...register("summary")}
            id="summary"
            rows={5}
            maxLength={600}
            className="w-full resize-y rounded-lg border border-[#dce2da] bg-white px-3.5 py-3 text-sm leading-6 text-[#20241f] transition outline-none placeholder:text-[#9aa19a] focus:border-[#6b9272] focus:ring-3 focus:ring-[#6b9272]/15 aria-invalid:border-[#bd5c51]"
            placeholder="Présentez votre parcours et vos points forts en quelques phrases."
            aria-invalid={Boolean(errors.summary)}
            aria-describedby={errors.summary ? "summary-error" : undefined}
          />
          {errors.summary && (
            <FieldMessage id="summary-error">
              {errors.summary.message}
            </FieldMessage>
          )}
        </section>

        <section aria-labelledby="photo-heading" className="space-y-3">
          <div>
            <h2
              id="photo-heading"
              className="text-sm font-medium text-[#303a32]"
            >
              Photo de profil{" "}
              <span className="font-normal text-[#858d85]">(facultative)</span>
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#858d85]">
              JPEG, PNG ou WebP. L’image sera réduite à 300 × 300 pixels maximum
              et à 300 Ko.
            </p>
          </div>
          <div className="flex flex-col gap-4 rounded-xl border border-dashed border-[#d8e0d6] bg-[#fafbf9] p-4 sm:flex-row sm:items-center">
            {photo ? (
              <Image
                src={photo}
                alt="Aperçu de la photo de profil"
                width={88}
                height={88}
                unoptimized
                className="size-[88px] rounded-xl border border-[#e3e9e1] object-cover"
              />
            ) : (
              <div className="grid size-[88px] shrink-0 place-items-center rounded-xl bg-[#eaf0e8] text-2xl font-medium text-[#78917a]">
                {initialValues.firstName.slice(0, 1).toLocaleUpperCase() || "+"}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-label="Choisir une photo de profil"
                onChange={handlePhotoSelection}
              />
              <button
                type="button"
                disabled={isProcessingPhoto || isPending}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#d5ddd3] bg-white px-4 text-sm font-medium text-[#3e5543] transition hover:bg-[#f4f7f3] disabled:opacity-60"
              >
                {isProcessingPhoto
                  ? "Préparation de la photo…"
                  : "Choisir une photo"}
              </button>
              {photo && (
                <button
                  type="button"
                  disabled={isPending || isProcessingPhoto}
                  onClick={() => {
                    setValue("photo", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setPhotoError("");
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-lg px-3 text-sm font-medium text-[#8a443c] transition hover:bg-[#fff1ef] disabled:opacity-60"
                >
                  Supprimer la photo
                </button>
              )}
            </div>
          </div>
          {photoError && <FieldMessage>{photoError}</FieldMessage>}
          {errors.photo && <FieldMessage>{errors.photo.message}</FieldMessage>}
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-[#edf0eb] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#858d85]">
            Les champs marqués d’un astérisque sont obligatoires.
          </p>
          <button
            type="submit"
            disabled={isPending || isProcessingPhoto || !isDirty}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#285c46] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#214c39] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isPending ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </>
  );
}

function FieldMessage({
  children,
  id,
}: Readonly<{ children?: React.ReactNode; id?: string }>) {
  if (!children) return null;

  return (
    <p id={id} className="mt-1.5 text-xs text-[#a33f36]">
      {children}
    </p>
  );
}
