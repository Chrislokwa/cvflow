"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";

export type SaveProfileResult =
  | { success: true }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<keyof ProfileInput, string>>;
    };

export async function saveProfile(
  input: ProfileInput,
): Promise<SaveProfileResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      message: "Votre session a expiré. Reconnectez-vous avant d’enregistrer.",
    };
  }

  const parsedInput = profileSchema.safeParse(input);
  if (!parsedInput.success) {
    const fieldErrors: Partial<Record<keyof ProfileInput, string>> = {};

    for (const issue of parsedInput.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && field in profileSchema.shape) {
        const key = field as keyof ProfileInput;
        fieldErrors[key] ??= issue.message;
      }
    }

    return {
      success: false,
      message: "Vérifiez les informations saisies.",
      fieldErrors,
    };
  }

  try {
    const data = parsedInput.data;
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        ...data,
        user: { connect: { id: session.user.id } },
      },
      update: data,
      select: { id: true },
    });

    return { success: true };
  } catch {
    return {
      success: false,
      message: "Impossible d’enregistrer votre profil pour le moment.",
    };
  }
}
