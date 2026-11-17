import type { ComponentType } from "react";
import type { CvProfileData } from "@/lib/cv-data";
import type { CvSettings } from "@/lib/validations/cv-settings";
import ClassicCv from "./templates/ClassicCv";
import MinimalCv from "./templates/MinimalCv";
import ModernCv from "./templates/ModernCv";

export type CvTemplateProps = { profile: CvProfileData; settings: CvSettings };
export type CvTemplateKey = CvSettings["template"];

export const cvTemplateRegistry: Record<CvTemplateKey, ComponentType<CvTemplateProps>> = {
  CLASSIC: ClassicCv,
  MODERN: ModernCv,
  MINIMAL: MinimalCv,
};

