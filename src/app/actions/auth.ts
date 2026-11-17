"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { signOut } from "@/auth";

export type RegisterResult =
  | { success: true }
  | { success: false; message: string; fieldErrors?: Record<string, string> };

export async function registerAccount(
  input: RegisterInput,
): Promise<RegisterResult> {
  const parsedInput = registerSchema.safeParse(input);

  if (!parsedInput.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsedInput.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && fieldErrors[field] === undefined) {
        fieldErrors[field] = issue.message;
      }
    }

    return {
      success: false,
      message: "Vérifiez les informations saisies.",
      fieldErrors,
    };
  }

  try {
    const email = parsedInput.data.email.toLowerCase();
    const passwordHash = await hash(parsedInput.data.password, 12);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: { create: {} },
      },
      select: { id: true },
    });

    return { success: true };
  } catch {
    return {
      success: false,
      message: "Impossible de créer le compte avec ces informations.",
    };
  }
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
