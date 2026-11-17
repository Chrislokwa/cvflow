import type {
  CertificationInput,
  EducationInput,
  ExperienceInput,
  LanguageInput,
  ProjectInput,
  SkillInput,
} from "@/lib/validations/profile-sections";

type Ordered<T> = Omit<T, "id"> & { id: string; order: number };

export type EducationListItem = Ordered<EducationInput>;
export type ExperienceListItem = Omit<ExperienceInput, "id" | "bulletsText"> & {
  id: string;
  order: number;
  bullets: string[];
};
export type SkillListItem = Ordered<SkillInput>;
export type LanguageListItem = Ordered<LanguageInput>;
export type ProjectListItem = Ordered<ProjectInput>;
export type CertificationListItem = Ordered<CertificationInput>;

export type ProfileSectionItem =
  | EducationListItem
  | ExperienceListItem
  | SkillListItem
  | LanguageListItem
  | ProjectListItem
  | CertificationListItem;
