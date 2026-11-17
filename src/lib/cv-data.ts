import { prisma } from "@/lib/prisma";
import sharp from "sharp";
export { defaultCvSettings } from "@/lib/validations/cv-settings";

export type CvProfileData = {
  firstName: string;
  lastName: string;
  postName: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  birthPlace: string;
  birthDate: string | null;
  maritalStatus: string;
  gender: string;
  nationality: string;
  website: string;
  linkedin: string;
  otherLink: string;
  summary: string;
  photo: string;
  interests: string[];
  experiences: Array<{
    position: string; company: string; city: string; startDate: string | null;
    endDate: string | null; current: boolean; description: string; bullets: string[];
  }>;
  education: Array<{
    degree: string; field: string; institution: string; city: string;
    startDate: string | null; endDate: string | null; current: boolean; description: string;
  }>;
  skills: Array<{ name: string; level: number; category: string }>;
  languages: Array<{ name: string; level: string }>;
  projects: Array<{ name: string; description: string; url: string }>;
  certifications: Array<{ name: string; issuer: string; issueDate: string | null; credentialUrl: string }>;
};

function dateValue(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

async function normalizePhotoForPdf(photo: string): Promise<string> {
  const webpPrefix = "data:image/webp;base64,";
  if (!photo.startsWith(webpPrefix)) return photo;

  const imageData = Buffer.from(photo.slice(webpPrefix.length), "base64");
  const jpegData = await sharp(imageData).jpeg({ quality: 88 }).toBuffer();
  return `data:image/jpeg;base64,${jpegData.toString("base64")}`;
}

export async function loadCvProfile(userId: string): Promise<CvProfileData | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      experiences: { orderBy: { order: "asc" } },
      education: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      languages: { orderBy: { order: "asc" } },
      projects: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
    },
  });

  if (!profile) return null;
  const photo = await normalizePhotoForPdf(profile.photo);

  return {
    firstName: profile.firstName, lastName: profile.lastName, postName: profile.postName, title: profile.title,
    email: profile.email, phone: profile.phone, address: profile.address, city: profile.city, country: profile.country, birthPlace: profile.birthPlace,
    birthDate: dateValue(profile.birthDate), maritalStatus: profile.maritalStatus, gender: profile.gender,
    nationality: profile.nationality, website: profile.website, linkedin: profile.linkedin, otherLink: profile.otherLink,
    summary: profile.summary, photo, interests: profile.interests,
    experiences: profile.experiences.map((item) => ({
      position: item.position, company: item.company, city: item.city,
      startDate: dateValue(item.startDate), endDate: dateValue(item.endDate), current: item.current,
      description: item.description, bullets: item.bullets,
    })),
    education: profile.education.map((item) => ({
      degree: item.degree, field: item.field, institution: item.institution, city: item.city,
      startDate: dateValue(item.startDate), endDate: dateValue(item.endDate), current: item.current,
      description: item.description,
    })),
    skills: profile.skills.map(({ name, level, category }) => ({ name, level, category })),
    languages: profile.languages.map(({ name, level }) => ({ name, level })),
    projects: profile.projects.map(({ name, description, url }) => ({ name, description, url })),
    certifications: profile.certifications.map(({ name, issuer, issueDate, credentialUrl }) => ({
      name, issuer, issueDate: dateValue(issueDate), credentialUrl,
    })),
  };
}
