"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  deleteProfileItem,
  moveProfileItem,
  type ProfileActionResult,
} from "@/app/actions/profile-sections";
import type { ProfileSectionItem } from "@/lib/profile-section-types";
import type { ProfileItemKind } from "@/lib/validations/profile-sections";
import { SectionEditor } from "@/components/profile/section-editor";

const sectionNames: Record<
  ProfileItemKind,
  { singular: string; plural: string; article: string; empty: string }
> = {
  education: {
    singular: "formation",
    plural: "Formations",
    article: "une formation",
    empty: "Aucune formation ajoutée",
  },
  experience: {
    singular: "expérience",
    plural: "Expériences",
    article: "une expérience",
    empty: "Aucune expérience ajoutée",
  },
  skill: {
    singular: "compétence",
    plural: "Compétences",
    article: "une compétence",
    empty: "Aucune compétence ajoutée",
  },
  language: {
    singular: "langue",
    plural: "Langues",
    article: "une langue",
    empty: "Aucune langue ajoutée",
  },
  project: {
    singular: "projet",
    plural: "Projets",
    article: "un projet",
    empty: "Aucun projet ajouté",
  },
  certification: {
    singular: "certification",
    plural: "Certifications",
    article: "une certification",
    empty: "Aucune certification ajoutée",
  },
};

type Notification = {
  type: "success" | "error";
  message: string;
};

export function ProfileSectionList({
  kind,
  items,
}: Readonly<{ kind: ProfileItemKind; items: ProfileSectionItem[] }>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProfileSectionItem | null>(
    null,
  );
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const config = sectionNames[kind];
  const orderedItems = [...items].sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (!notification) return;
    const timeoutId = window.setTimeout(() => setNotification(null), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [notification]);

  function openNewItem() {
    setEditingItem(null);
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setIsEditorOpen(false);
    setEditingItem(null);
  }

  function onSaved() {
    closeEditor();
    setNotification({
      type: "success",
      message: inflect(kind, "enregistré"),
    });
    router.refresh();
  }

  function runAction(
    action: Promise<ProfileActionResult>,
    successMessage: string,
  ) {
    setNotification(null);
    startTransition(async () => {
      try {
        const result = await action;
        if (!result.success) {
          setNotification({ type: "error", message: result.message });
          return;
        }
        setConfirmingDelete(null);
        setNotification({ type: "success", message: successMessage });
        router.refresh();
      } catch {
        setNotification({
          type: "error",
          message: "Une erreur est survenue. Réessayez.",
        });
      }
    });
  }

  function onMove(item: ProfileSectionItem, direction: "up" | "down") {
    runAction(
      moveProfileItem({ kind, id: item.id, direction }),
      inflect(kind, "déplacé"),
    );
  }

  function onDelete(item: ProfileSectionItem) {
    runAction(
      deleteProfileItem({ kind, id: item.id }),
      inflect(kind, "supprimé"),
    );
  }

  const modalTitle = editingItem
    ? `Modifier ${config.article}`
    : `Ajouter ${config.article}`;

  return (
    <>
      {notification && (
        <div
          role={notification.type === "success" ? "status" : "alert"}
          aria-live={notification.type === "success" ? "polite" : "assertive"}
          className={`fixed top-4 right-4 z-[60] max-w-[calc(100vw-2rem)] rounded-xl border bg-white px-4 py-3 text-sm shadow-lg sm:top-8 sm:right-8 ${
            notification.type === "success"
              ? "border-[#d5e5d6] text-[#315b39]"
              : "border-[#f0d5d1] text-[#963d35]"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#303a32]">
            {config.plural}
          </h2>
          <p className="mt-1 text-sm text-[#7b837b]">
            Organisez les éléments comme vous souhaitez les voir apparaître.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewItem}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-[#285c46] px-4 text-sm font-medium text-white transition hover:bg-[#214c39] sm:self-auto"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            +
          </span>
          Ajouter {config.singular}
        </button>
      </div>

      {orderedItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#dce4da] bg-[#fafbf9] px-5 py-12 text-center">
          <div
            aria-hidden="true"
            className="mx-auto grid size-11 place-items-center rounded-full bg-[#eaf0e8] text-xl text-[#67866b]"
          >
            +
          </div>
          <p className="mt-4 text-sm font-medium text-[#4d5c4f]">
            {config.empty}
          </p>
          <p className="mt-1 text-sm text-[#858d85]">
            Ajoutez un élément pour compléter votre profil.
          </p>
        </div>
      ) : (
        <ol className="space-y-3">
          {orderedItems.map((item, index) => {
            const label = itemLabel(item);
            return (
              <li key={item.id}>
                <article className="rounded-xl border border-[#e5e9e2] bg-white p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-[#303a32]">
                        {label}
                      </h3>
                      <ItemDetails item={item} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <button
                        type="button"
                        aria-label={`Monter ${label}`}
                        disabled={index === 0 || isPending}
                        onClick={() => onMove(item, "up")}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-[#dce2da] px-3 text-sm text-[#526254] transition hover:bg-[#f3f6f2] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span aria-hidden="true">↑</span>
                        <span className="ml-1.5">Monter</span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Descendre ${label}`}
                        disabled={
                          index === orderedItems.length - 1 || isPending
                        }
                        onClick={() => onMove(item, "down")}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-[#dce2da] px-3 text-sm text-[#526254] transition hover:bg-[#f3f6f2] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span aria-hidden="true">↓</span>
                        <span className="ml-1.5">Descendre</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setIsEditorOpen(true);
                        }}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-[#dce2da] px-3 text-sm font-medium text-[#3e5543] transition hover:bg-[#f3f6f2]"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(item.id)}
                        className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-[#93483f] transition hover:bg-[#fff1ef]"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {confirmingDelete === item.id && (
                    <div className="mt-4 flex flex-col gap-3 rounded-lg bg-[#fff7f5] p-3.5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-[#82463f]">
                        Supprimer « {label} » de votre profil ?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmingDelete(null)}
                          disabled={isPending}
                          className="rounded-lg border border-[#e6d8d5] bg-white px-3 py-2 text-sm text-[#605553]"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          disabled={isPending}
                          className="rounded-lg bg-[#a7473d] px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                        >
                          {isPending
                            ? "Suppression…"
                            : "Confirmer la suppression"}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      )}

      {isEditorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#17231b]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditor();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-item-editor-title"
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-[#fdfefc] p-5 shadow-2xl sm:rounded-2xl sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium tracking-[0.14em] text-[#718572] uppercase">
                  Mon profil
                </p>
                <h2
                  id="profile-item-editor-title"
                  className="mt-2 text-xl font-semibold text-[#303a32]"
                >
                  {modalTitle}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Fermer le formulaire"
                onClick={closeEditor}
                className="grid size-9 shrink-0 place-items-center rounded-lg text-lg text-[#737b73] transition hover:bg-[#f0f3ee]"
              >
                ×
              </button>
            </div>
            <SectionEditor kind={kind} item={editingItem} onSaved={onSaved} />
          </div>
        </div>
      )}
    </>
  );
}

function capitalize(value: string): string {
  return value.slice(0, 1).toLocaleUpperCase("fr-FR") + value.slice(1);
}

function inflect(kind: ProfileItemKind, verb: string): string {
  const feminine = kind !== "project";
  return `${capitalize(sectionNames[kind].singular)} ${verb}${feminine ? "e" : ""}.`;
}

function itemLabel(item: ProfileSectionItem): string {
  switch (item.kind) {
    case "education":
      return item.degree;
    case "experience":
      return item.position;
    case "skill":
    case "language":
    case "project":
    case "certification":
      return item.name;
  }
}

function ItemDetails({ item }: Readonly<{ item: ProfileSectionItem }>) {
  switch (item.kind) {
    case "education":
      return (
        <div className="mt-1 space-y-1 text-sm text-[#727a72]">
          <p>
            {item.institution}
            {item.city ? ` · ${item.city}` : ""}
          </p>
          <p>{formatPeriod(item.startDate, item.endDate, item.current)}</p>
          {item.description && (
            <p className="pt-1 whitespace-pre-wrap text-[#59635a]">
              {item.description}
            </p>
          )}
        </div>
      );
    case "experience":
      return (
        <div className="mt-1 space-y-1 text-sm text-[#727a72]">
          <p>
            {item.company}
            {item.city ? ` · ${item.city}` : ""}
          </p>
          <p>{formatPeriod(item.startDate, item.endDate, item.current)}</p>
          {item.bullets.length > 0 && (
            <ul className="list-disc space-y-1 pt-1 pl-5 text-[#59635a]">
              {item.bullets.slice(0, 3).map((bullet, index) => (
                <li key={`${item.id}-bullet-${index}`}>{bullet}</li>
              ))}
              {item.bullets.length > 3 && (
                <li className="list-none text-xs text-[#858d85]">
                  + {item.bullets.length - 3} autres puces
                </li>
              )}
            </ul>
          )}
        </div>
      );
    case "skill":
      return (
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#727a72]">
          {item.category && (
            <span className="rounded-full bg-[#f0f3ee] px-2.5 py-1 text-xs">
              {item.category}
            </span>
          )}
          <span
            aria-label={`Niveau ${item.level} sur 5`}
            className="flex gap-1"
          >
            {[1, 2, 3, 4, 5].map((level) => (
              <span
                key={level}
                className={`size-2 rounded-full ${level <= item.level ? "bg-[#6f9873]" : "bg-[#dce3da]"}`}
              />
            ))}
          </span>
          <span className="text-xs">{item.level}/5</span>
        </div>
      );
    case "language":
      return <p className="mt-1 text-sm text-[#727a72]">{item.level}</p>;
    case "project":
      return (
        <div className="mt-1 space-y-1 text-sm text-[#727a72]">
          {item.description && (
            <p className="whitespace-pre-wrap text-[#59635a]">
              {item.description}
            </p>
          )}
          {item.url && (
            <Link
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-[#386947] underline decoration-[#b7cbb8] underline-offset-2"
            >
              Ouvrir le lien
            </Link>
          )}
        </div>
      );
    case "certification":
      return (
        <p className="mt-1 text-sm text-[#727a72]">
          {[item.issuer, item.year].filter(Boolean).join(" · ")}
        </p>
      );
  }
}

function formatPeriod(
  startDate: string,
  endDate: string,
  current: boolean,
): string {
  const start = formatMonth(startDate);
  const end = current ? "En cours" : formatMonth(endDate);
  if (start && end) return `${start} – ${end}`;
  return start || end || "Période non renseignée";
}

function formatMonth(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
