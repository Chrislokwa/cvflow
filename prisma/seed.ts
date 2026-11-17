import { createRequire } from "node:module";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "../src/lib/prisma.ts";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env") as typeof import("@next/env");
loadEnvConfig(process.cwd());

const seedConfigSchema = z.object({
  DEMO_USER_EMAIL: z.string().trim().email().max(254),
  DEMO_USER_PASSWORD: z.string().min(8).max(72).refine((value) => new TextEncoder().encode(value).length <= 72),
});

async function seed(): Promise<void> {
  const parsedConfig = seedConfigSchema.safeParse(process.env);
  if (!parsedConfig.success) {
    throw new Error("Définissez DEMO_USER_EMAIL et DEMO_USER_PASSWORD (8 caractères minimum) dans .env avant le seed.");
  }

  const email = parsedConfig.data.DEMO_USER_EMAIL.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    console.info(`Le compte de démonstration ${email} existe déjà ; ses données ont été conservées.`);
    return;
  }

  const passwordHash = await hash(parsedConfig.data.DEMO_USER_PASSWORD, 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: {
        create: {
          firstName: "Camille",
          lastName: "Martin",
          postName: "Démo",
          title: "Chargée de projet",
          email,
          phone: "+33 6 12 34 56 78",
          address: "12 rue de la Démonstration",
          city: "Lyon",
          country: "France",
          birthPlace: "Lyon",
          birthDate: new Date("1998-04-12T00:00:00.000Z"),
          gender: "Femme",
          nationality: "Française",
          website: "https://example.com",
          linkedin: "https://www.linkedin.com/in/camille-demo",
          otherLink: "https://github.com/camille-demo",
          summary: "Chargée de projet organisée et curieuse, j’aime coordonner des équipes, structurer les priorités et transformer les idées en résultats concrets.",
          interests: ["Randonnée", "Lecture", "Photographie"],
          education: { create: [
            { degree: "Master", field: "Management de projet", institution: "Université Lumière", city: "Lyon", startDate: new Date("2021-09-01T00:00:00.000Z"), endDate: new Date("2023-06-30T00:00:00.000Z"), description: "Gestion de projet, conduite du changement et stratégie.", order: 0 },
            { degree: "Licence", field: "Administration des entreprises", institution: "Université Lumière", city: "Lyon", startDate: new Date("2018-09-01T00:00:00.000Z"), endDate: new Date("2021-06-30T00:00:00.000Z"), description: "Formation en gestion et communication.", order: 1 },
          ] },
          experiences: { create: [
            { position: "Assistante cheffe de projet", company: "Atelier des Idées", city: "Lyon", startDate: new Date("2024-01-01T00:00:00.000Z"), current: true, bullets: ["Coordination du calendrier et des parties prenantes", "Suivi des indicateurs et préparation des bilans", "Organisation d’ateliers de travail"], description: "Appui à la conduite de projets transverses.", order: 0 },
            { position: "Assistante communication", company: "Association Passerelle", city: "Villeurbanne", startDate: new Date("2022-05-01T00:00:00.000Z"), endDate: new Date("2022-10-31T00:00:00.000Z"), current: false, bullets: ["Rédaction de contenus et coordination événementielle"], description: "Stage de fin d’études.", order: 1 },
          ] },
          skills: { create: [
            { name: "Gestion de projet", level: 5, category: "Organisation", order: 0 },
            { name: "Communication écrite", level: 4, category: "Communication", order: 1 },
            { name: "Analyse de données", level: 3, category: "Outils", order: 2 },
            { name: "Coordination d’équipe", level: 4, category: "Organisation", order: 3 },
          ] },
          languages: { create: [
            { name: "Français", level: "Langue maternelle", order: 0 },
            { name: "Anglais", level: "B2", order: 1 },
          ] },
          projects: { create: [
            { name: "Semaine des initiatives locales", description: "Conception et coordination d’un événement réunissant des associations et des acteurs locaux.", url: "https://example.com/projet", startDate: new Date("2023-01-01T00:00:00.000Z"), endDate: new Date("2023-06-01T00:00:00.000Z"), order: 0 },
          ] },
          certifications: { create: [
            { name: "Fondamentaux de la gestion de projet", issuer: "OpenClassrooms", issueDate: new Date("2023-11-01T00:00:00.000Z"), credentialUrl: "https://example.com/certification", order: 0 },
          ] },
        },
      },
    },
    select: { id: true },
  });
  console.info(`Compte de démonstration créé : ${email}`);
}

seed().catch((error: unknown) => {
  console.error("Échec du seed de démonstration.", error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
