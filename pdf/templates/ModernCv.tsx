import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement, ReactNode } from "react";
import type { CvProfileData } from "@/lib/cv-data";
import type { CvSection, CvSettings } from "@/lib/validations/cv-settings";

type Props = { profile: CvProfileData; settings: CvSettings };

const styles = StyleSheet.create({
  page: { padding: 0, fontSize: 9, lineHeight: 1.42, color: "#26312c" },
  title: { paddingTop: 28, paddingBottom: 15, textAlign: "center", fontSize: 15, fontWeight: 700, letterSpacing: 1.1 },
  columns: { flexDirection: "row", flexGrow: 1, alignItems: "stretch" },
  sidebar: { width: 185, paddingHorizontal: 22, paddingTop: 22, paddingBottom: 34, color: "#fff" },
  main: { flexGrow: 1, flexShrink: 1, paddingHorizontal: 30, paddingTop: 22, paddingBottom: 36 },
  name: { fontSize: 18, fontWeight: 700, lineHeight: 1.2 },
  role: { marginTop: 5, fontSize: 10, opacity: 0.9 },
  photo: { width: 74, height: 74, marginBottom: 12, borderRadius: 37, objectFit: "cover" },
  sidebarSection: { marginTop: 20 },
  sidebarHeading: { marginBottom: 7, fontSize: 9, fontWeight: 700, letterSpacing: 0.7, textTransform: "uppercase" },
  sidebarText: { marginBottom: 4, fontSize: 8 },
  mainSection: { marginBottom: 15 },
  mainHeading: { marginBottom: 7, paddingBottom: 4, borderBottomWidth: 1, fontSize: 10, fontWeight: 700, letterSpacing: 0.55, textTransform: "uppercase" },
  item: { marginBottom: 8 },
  itemTitle: { fontSize: 9, fontWeight: 700 },
  date: { fontSize: 8, color: "#606a63" },
  subline: { marginTop: 2, fontSize: 8, color: "#606a63" },
  bullet: { flexDirection: "row", paddingLeft: 6, gap: 4, marginTop: 2 },
  bulletMark: { width: 5 },
  bulletText: { flexGrow: 1, flexShrink: 1 },
  pillList: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  pill: { paddingVertical: 3, paddingHorizontal: 6, marginBottom: 3, borderRadius: 2, fontSize: 7.5 },
});

function year(value: string | null): string {
  return value ? new Intl.DateTimeFormat("fr-FR", { year: "numeric", timeZone: "UTC" }).format(new Date(value)) : "";
}

function range(start: string | null, end: string | null, current = false): string {
  return [year(start), current ? "Présent" : year(end)].filter(Boolean).join(" – ");
}

function SidebarSection({ title, color, children }: { title: string; color: string; children: ReactNode }) {
  return <View style={styles.sidebarSection}><Text style={[styles.sidebarHeading, { color }]}>{title}</Text>{children}</View>;
}

function MainSection({ title, accent, children }: { title: string; accent: string; children: ReactNode }) {
  return <View style={styles.mainSection}><Text style={[styles.mainHeading, { color: accent, borderBottomColor: accent }]} minPresenceAhead={45}>{title}</Text>{children}</View>;
}

function Identity({ profile, settings }: { profile: CvProfileData; settings: CvSettings }) {
  const name = [profile.firstName, profile.postName, profile.lastName].filter(Boolean).join(" ");
  return <>
    {/* eslint-disable-next-line jsx-a11y/alt-text */}
    {settings.showPhoto && profile.photo.startsWith("data:image/") ? <Image src={profile.photo} style={styles.photo} /> : null}
    <Text style={styles.name}>{name || "Votre nom"}</Text>
    {profile.title ? <Text style={styles.role}>{profile.title}</Text> : null}
    {[profile.email, profile.phone, profile.address, [profile.city, profile.country].filter(Boolean).join(", "), [profile.birthPlace, profile.birthDate ? `le ${new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(profile.birthDate))}` : ""].filter(Boolean).join(", "), profile.maritalStatus, profile.gender, profile.nationality, profile.website, profile.linkedin, profile.otherLink].filter(Boolean).map((item, index) => <Text key={`${index}-${item}`} style={styles.sidebarText}>{item}</Text>)}
  </>;
}

function getTitle(section: CvSection): string {
  const titles: Record<CvSection, string> = { identity: "Identité", summary: "Profil", education: "Études et formations", experiences: "Expériences", skills: "Compétences", languages: "Langues", projects: "Projets", certifications: "Formations complémentaires", interests: "Centres d’intérêt" };
  return titles[section];
}

export default function ModernCv({ profile, settings }: Props): ReactElement<DocumentProps> {
  const name = [profile.firstName, profile.postName, profile.lastName].filter(Boolean).join(" ");
  const sideKeys: CvSection[] = ["identity", "skills", "languages", "interests"];
  const mainKeys: CvSection[] = ["summary", "experiences", "education", "projects", "certifications"];
  const visible = settings.sectionOrder.filter((section) => settings.visibleSections.includes(section));
  const sideSections = visible.filter((section) => sideKeys.includes(section) && (section !== "skills" || profile.skills.length > 0) && (section !== "languages" || profile.languages.length > 0) && (section !== "interests" || profile.interests.length > 0));
  const mainSections = visible.filter((section) => mainKeys.includes(section) && (section !== "summary" || Boolean(profile.summary.trim())) && (section !== "experiences" || profile.experiences.length > 0) && (section !== "education" || profile.education.length > 0) && (section !== "projects" || profile.projects.length > 0) && (section !== "certifications" || profile.certifications.length > 0));
  const fontFamily = { roboto: "Roboto", lora: "Lora", merriweather: "Merriweather" }[settings.fontFamily];
  const sidebarContent: Record<CvSection, ReactNode> = {
    identity: <Identity profile={profile} settings={settings} />,
    skills: <>{profile.skills.map((skill, index) => <Text key={`${skill.name}-${index}`} style={styles.sidebarText}>{skill.name}{skill.category ? ` · ${skill.category}` : ""}{skill.level ? ` · ${skill.level}/5` : ""}</Text>)}</>,
    languages: <>{profile.languages.map((language, index) => <Text key={`${language.name}-${index}`} style={styles.sidebarText}>{language.name}{language.level ? ` · ${language.level}` : ""}</Text>)}</>,
    interests: <>{profile.interests.map((item, index) => <Text key={`${item}-${index}`} style={styles.sidebarText}>{item}</Text>)}</>,
    summary: null, education: null, experiences: null, projects: null, certifications: null,
  };
  const mainContent: Record<CvSection, ReactNode> = {
    summary: <Text>{profile.summary}</Text>,
    experiences: <>{profile.experiences.map((item, index) => <View key={`${item.position}-${index}`} style={styles.item} wrap={false}><Text style={styles.date}>{range(item.startDate, item.endDate, item.current)}{item.startDate ? " : " : ""}<Text style={styles.itemTitle}>{item.position || item.company}</Text>{item.position && item.company ? `, ${item.company}` : ""}</Text>{item.description ? <Text>{item.description}</Text> : null}{item.bullets.map((bullet, bulletIndex) => <View key={`${bulletIndex}-${bullet}`} style={styles.bullet}><Text style={styles.bulletMark}>•</Text><Text style={styles.bulletText}>{bullet}</Text></View>)}</View>)}</>,
    education: <>{profile.education.map((item, index) => <View key={`${item.degree}-${index}`} style={styles.item} wrap={false}><Text style={styles.date}>{range(item.startDate, item.endDate, item.current)}{item.startDate ? " : " : ""}<Text style={styles.itemTitle}>{[item.degree, item.field].filter(Boolean).join(" — ") || item.institution}</Text>{item.degree && item.institution ? `, ${item.institution}` : ""}</Text>{item.description ? <Text>{item.description}</Text> : null}</View>)}</>,
    projects: <>{profile.projects.map((item, index) => <View key={`${item.name}-${index}`} style={styles.item} wrap={false}><Text style={styles.itemTitle}>{item.name}</Text>{item.description ? <Text>{item.description}</Text> : null}{item.url ? <Text style={styles.subline}>{item.url}</Text> : null}</View>)}</>,
    certifications: <>{profile.certifications.map((item, index) => <View key={`${item.name}-${index}`} style={styles.item} wrap={false}><Text style={styles.date}>{year(item.issueDate)}{item.issueDate ? " : " : ""}<Text style={styles.itemTitle}>{item.name}</Text>{item.issuer ? `, ${item.issuer}` : ""}</Text></View>)}</>,
    identity: null, skills: null, languages: null, interests: null,
  };

  return <Document title={`Curriculum Vitae ${name}`} author={name}><Page size="A4" style={[styles.page, { fontFamily }]} wrap>
    <Text style={[styles.title, { color: settings.accentColor }]}>CURRICULUM VITAE</Text>
    <View style={styles.columns}>
      <View style={[styles.sidebar, { backgroundColor: settings.accentColor }]}>{sideSections.map((section) => section === "identity" ? <View key={section}>{sidebarContent[section]}</View> : <SidebarSection key={section} title={getTitle(section)} color="#fff">{sidebarContent[section]}</SidebarSection>)}</View>
      <View style={styles.main}>{mainSections.map((section) => <MainSection key={section} title={getTitle(section)} accent={settings.accentColor}>{mainContent[section]}</MainSection>)}</View>
    </View>
  </Page></Document>;
}
