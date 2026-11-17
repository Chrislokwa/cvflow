"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  interestsSchema,
  profileItemKindSchema,
  profileItemSchema,
  type ProfileItemInput,
} from "@/lib/validations/profile-sections";
import { z } from "zod";

export type ProfileActionResult =
  { success: true } | { success: false; message: string };

type ProfileItemDirection = "up" | "down";
type OrderedItemId = { id: string; order: number };

const profileItemOperationSchema = z.object({
  kind: profileItemKindSchema,
  id: z.string().trim().min(1).max(128),
});
const moveProfileItemSchema = profileItemOperationSchema.extend({
  direction: z.enum(["up", "down"]),
});

function toNullableDate(value: string): Date | null {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

async function getOwnedProfileId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  return profile?.id ?? null;
}

async function nextOrder(
  profileId: string,
  kind: ProfileItemInput["kind"],
): Promise<number> {
  switch (kind) {
    case "education":
      return (
        ((
          await prisma.education.aggregate({
            where: { profileId },
            _max: { order: true },
          })
        )._max.order ?? -1) + 1
      );
    case "experience":
      return (
        ((
          await prisma.experience.aggregate({
            where: { profileId },
            _max: { order: true },
          })
        )._max.order ?? -1) + 1
      );
    case "skill":
      return (
        ((
          await prisma.skill.aggregate({
            where: { profileId },
            _max: { order: true },
          })
        )._max.order ?? -1) + 1
      );
    case "language":
      return (
        ((
          await prisma.language.aggregate({
            where: { profileId },
            _max: { order: true },
          })
        )._max.order ?? -1) + 1
      );
    case "project":
      return (
        ((
          await prisma.project.aggregate({
            where: { profileId },
            _max: { order: true },
          })
        )._max.order ?? -1) + 1
      );
    case "certification":
      return (
        ((
          await prisma.certification.aggregate({
            where: { profileId },
            _max: { order: true },
          })
        )._max.order ?? -1) + 1
      );
  }
}

export async function saveProfileItem(
  input: ProfileItemInput,
): Promise<ProfileActionResult> {
  const profileId = await getOwnedProfileId();
  if (!profileId) {
    return {
      success: false,
      message: "Votre session a expiré. Reconnectez-vous.",
    };
  }

  const parsed = profileItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Vérifiez les informations saisies." };
  }

  try {
    const item = parsed.data;
    const order = item.id ? undefined : await nextOrder(profileId, item.kind);

    switch (item.kind) {
      case "education": {
        const data = {
          degree: item.degree,
          institution: item.institution,
          city: item.city,
          startDate: toNullableDate(item.startDate),
          endDate: item.current ? null : toNullableDate(item.endDate),
          current: item.current,
          description: item.description,
          field: "",
        };
        if (item.id) {
          const result = await prisma.education.updateMany({
            where: { id: item.id, profileId },
            data,
          });
          if (!result.count) return notFoundResult();
        } else {
          await prisma.education.create({
            data: { ...data, order: order ?? 0, profileId },
          });
        }
        break;
      }
      case "experience": {
        const data = {
          position: item.position,
          company: item.company,
          city: item.city,
          startDate: toNullableDate(item.startDate),
          endDate: item.current ? null : toNullableDate(item.endDate),
          current: item.current,
          description: "",
          bullets: item.bulletsText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean),
        };
        if (item.id) {
          const result = await prisma.experience.updateMany({
            where: { id: item.id, profileId },
            data,
          });
          if (!result.count) return notFoundResult();
        } else {
          await prisma.experience.create({
            data: { ...data, order: order ?? 0, profileId },
          });
        }
        break;
      }
      case "skill": {
        const data = {
          name: item.name,
          level: item.level,
          category: item.category,
        };
        if (item.id) {
          const result = await prisma.skill.updateMany({
            where: { id: item.id, profileId },
            data,
          });
          if (!result.count) return notFoundResult();
        } else {
          await prisma.skill.create({
            data: { ...data, order: order ?? 0, profileId },
          });
        }
        break;
      }
      case "language": {
        const data = { name: item.name, level: item.level };
        if (item.id) {
          const result = await prisma.language.updateMany({
            where: { id: item.id, profileId },
            data,
          });
          if (!result.count) return notFoundResult();
        } else {
          await prisma.language.create({
            data: { ...data, order: order ?? 0, profileId },
          });
        }
        break;
      }
      case "project": {
        const data = {
          name: item.name,
          description: item.description,
          url: item.url,
        };
        if (item.id) {
          const result = await prisma.project.updateMany({
            where: { id: item.id, profileId },
            data,
          });
          if (!result.count) return notFoundResult();
        } else {
          await prisma.project.create({
            data: { ...data, order: order ?? 0, profileId },
          });
        }
        break;
      }
      case "certification": {
        const data = {
          name: item.name,
          issuer: item.issuer,
          issueDate: item.year
            ? new Date(`${item.year}-01-01T00:00:00.000Z`)
            : null,
          expiryDate: null,
          credentialUrl: "",
        };
        if (item.id) {
          const result = await prisma.certification.updateMany({
            where: { id: item.id, profileId },
            data,
          });
          if (!result.count) return notFoundResult();
        } else {
          await prisma.certification.create({
            data: { ...data, order: order ?? 0, profileId },
          });
        }
        break;
      }
    }

    return { success: true };
  } catch {
    return {
      success: false,
      message: "Impossible d’enregistrer cet élément pour le moment.",
    };
  }
}

export async function deleteProfileItem(
  input: unknown,
): Promise<ProfileActionResult> {
  const profileId = await getOwnedProfileId();
  if (!profileId) {
    return {
      success: false,
      message: "Votre session a expiré. Reconnectez-vous.",
    };
  }

  const parsedInput = profileItemOperationSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, message: "Impossible de supprimer cet élément." };
  }

  try {
    let deleted = 0;
    switch (parsedInput.data.kind) {
      case "education":
        deleted = (
          await prisma.education.deleteMany({
            where: { id: parsedInput.data.id, profileId },
          })
        ).count;
        break;
      case "experience":
        deleted = (
          await prisma.experience.deleteMany({
            where: { id: parsedInput.data.id, profileId },
          })
        ).count;
        break;
      case "skill":
        deleted = (
          await prisma.skill.deleteMany({
            where: { id: parsedInput.data.id, profileId },
          })
        ).count;
        break;
      case "language":
        deleted = (
          await prisma.language.deleteMany({
            where: { id: parsedInput.data.id, profileId },
          })
        ).count;
        break;
      case "project":
        deleted = (
          await prisma.project.deleteMany({
            where: { id: parsedInput.data.id, profileId },
          })
        ).count;
        break;
      case "certification":
        deleted = (
          await prisma.certification.deleteMany({
            where: { id: parsedInput.data.id, profileId },
          })
        ).count;
        break;
    }

    return deleted ? { success: true } : notFoundResult();
  } catch {
    return {
      success: false,
      message: "Impossible de supprimer cet élément pour le moment.",
    };
  }
}

function reorderItems<T extends OrderedItemId>(
  items: T[],
  id: string,
  direction: ProfileItemDirection,
): T[] | null {
  const nextItems = [...items];
  const currentIndex = nextItems.findIndex((item) => item.id === id);
  if (currentIndex < 0) return null;

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= nextItems.length) return nextItems;

  [nextItems[currentIndex], nextItems[targetIndex]] = [
    nextItems[targetIndex],
    nextItems[currentIndex],
  ];

  return nextItems.map((item, order) => ({ ...item, order }));
}

export async function moveProfileItem(
  input: unknown,
): Promise<ProfileActionResult> {
  const profileId = await getOwnedProfileId();
  if (!profileId) {
    return {
      success: false,
      message: "Votre session a expiré. Reconnectez-vous.",
    };
  }

  const parsedInput = moveProfileItemSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, message: "Impossible de réordonner cet élément." };
  }

  try {
    switch (parsedInput.data.kind) {
      case "education": {
        const items = await prisma.education.findMany({
          where: { profileId },
          select: { id: true, order: true },
          orderBy: [{ order: "asc" }, { id: "asc" }],
        });
        const reordered = reorderItems(
          items,
          parsedInput.data.id,
          parsedInput.data.direction,
        );
        if (!reordered) return notFoundResult();
        await prisma.$transaction(
          reordered.map((item) =>
            prisma.education.updateMany({
              where: { id: item.id, profileId },
              data: { order: item.order },
            }),
          ),
        );
        break;
      }
      case "experience": {
        const items = await prisma.experience.findMany({
          where: { profileId },
          select: { id: true, order: true },
          orderBy: [{ order: "asc" }, { id: "asc" }],
        });
        const reordered = reorderItems(
          items,
          parsedInput.data.id,
          parsedInput.data.direction,
        );
        if (!reordered) return notFoundResult();
        await prisma.$transaction(
          reordered.map((item) =>
            prisma.experience.updateMany({
              where: { id: item.id, profileId },
              data: { order: item.order },
            }),
          ),
        );
        break;
      }
      case "skill": {
        const items = await prisma.skill.findMany({
          where: { profileId },
          select: { id: true, order: true },
          orderBy: [{ order: "asc" }, { id: "asc" }],
        });
        const reordered = reorderItems(
          items,
          parsedInput.data.id,
          parsedInput.data.direction,
        );
        if (!reordered) return notFoundResult();
        await prisma.$transaction(
          reordered.map((item) =>
            prisma.skill.updateMany({
              where: { id: item.id, profileId },
              data: { order: item.order },
            }),
          ),
        );
        break;
      }
      case "language": {
        const items = await prisma.language.findMany({
          where: { profileId },
          select: { id: true, order: true },
          orderBy: [{ order: "asc" }, { id: "asc" }],
        });
        const reordered = reorderItems(
          items,
          parsedInput.data.id,
          parsedInput.data.direction,
        );
        if (!reordered) return notFoundResult();
        await prisma.$transaction(
          reordered.map((item) =>
            prisma.language.updateMany({
              where: { id: item.id, profileId },
              data: { order: item.order },
            }),
          ),
        );
        break;
      }
      case "project": {
        const items = await prisma.project.findMany({
          where: { profileId },
          select: { id: true, order: true },
          orderBy: [{ order: "asc" }, { id: "asc" }],
        });
        const reordered = reorderItems(
          items,
          parsedInput.data.id,
          parsedInput.data.direction,
        );
        if (!reordered) return notFoundResult();
        await prisma.$transaction(
          reordered.map((item) =>
            prisma.project.updateMany({
              where: { id: item.id, profileId },
              data: { order: item.order },
            }),
          ),
        );
        break;
      }
      case "certification": {
        const items = await prisma.certification.findMany({
          where: { profileId },
          select: { id: true, order: true },
          orderBy: [{ order: "asc" }, { id: "asc" }],
        });
        const reordered = reorderItems(
          items,
          parsedInput.data.id,
          parsedInput.data.direction,
        );
        if (!reordered) return notFoundResult();
        await prisma.$transaction(
          reordered.map((item) =>
            prisma.certification.updateMany({
              where: { id: item.id, profileId },
              data: { order: item.order },
            }),
          ),
        );
        break;
      }
    }

    return { success: true };
  } catch {
    return {
      success: false,
      message: "Impossible de réordonner cet élément pour le moment.",
    };
  }
}

export async function saveProfileInterests(
  input: unknown,
): Promise<ProfileActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      message: "Votre session a expiré. Reconnectez-vous.",
    };
  }

  const parsed = interestsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Vérifiez vos centres d’intérêt." };
  }

  try {
    const result = await prisma.profile.updateMany({
      where: { userId: session.user.id },
      data: { interests: parsed.data },
    });
    return result.count ? { success: true } : notFoundResult();
  } catch {
    return {
      success: false,
      message: "Impossible d’enregistrer vos centres d’intérêt pour le moment.",
    };
  }
}

function notFoundResult(): ProfileActionResult {
  return {
    success: false,
    message: "Cet élément est introuvable dans votre profil.",
  };
}
