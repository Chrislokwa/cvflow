import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement, ReactNode } from "react";
import type { CvProfileData } from "@/lib/cv-data";
import type { CvSection, CvSettings } from "@/lib/validations/cv-settings";

type Props = { profile: CvProfileData; settings: CvSettings };

const styles = StyleSheet.create({
  page: { paddingVertical: 44, paddingHorizontal: 54, fontSize: 9, lineHeight: 1.48, color: "#343434" },
  title: { marginBottom: 27, textAlign: "center", fontSize: 14, fontWeight: 400, letterSpacing: 1.8 },
  section: { marginBottom: 19 },
  heading: { marginBottom: 8, fontSize: 10, fontWeight: 400, letterSpacing: 1.15, textTransform: "uppercase" },
  accent: { width: 24, height: 1, marginBottom: 7 },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 135, flexShrink: 0, color: "#727272" },
  entry: { marginBottom: 8 },
  titleText: { fontWeight: 700 },
  date: { color: "#777" },
  photo: { width: 70, height: 70, marginBottom: 10, borderRadius: 35, objectFit: "cover" },
  bullets: { flexDirection: "row", marginTop: 2, paddingLeft: 8, gap: 5 },
  bulletText: { flexGrow: 1, flexShrink: 1 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  tag: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 2, fontSize: 8 },
});

function year(value: string | null): string {
  return value ? new Intl.DateTimeFormat("fr-FR", { year: "numeric", timeZone: "UTC" }).format(new Date(value)) : "";
}

function range(start: string | null, end: string | null, current = false): string {
  return [year(start), current ? "Présent" : year(end)].filter(Boolean).join(" – ");
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.titleText}>{value}</Text></View>;
}

function Section({ title, accentColor, fontFamily, children }: { title: string; accentColor: string; fontFamily: string; children: ReactNode }) {
  return <View style={styles.section}><View style={[styles.accent, { backgroundColor: accentColor }]} /><Text style={[styles.heading, { color: accentColor, fontFamily }]}>{title}</Text>{children}</View>;
}

export default function MinimalCv({ profile, settings }: Props): ReactElement<DocumentProps> {
  const name = [profile.firstName, profile.postName, profile.lastName].filter(Boolean).join(" ");
  const fontFamily = { roboto: "Roboto", lora: "Lora", merriweather: "Merriweather" }[settings.fontFamily];
  const titles: Record<CvSection, string> = { identity: "Identité", summary: "Profil professionnel", education: "Études et formations", experiences: "Expériences professionnelles", skills: "Compétences", languages: "Langues", projects: "Projets", certifications: "Formations complémentaires", interests: "Centres d’intérêt" };
  const content: Record<CvSection, ReactNode> = {
    identity: <View style={{ flexDirection: "row", gap: 15 }}>
      <View style={{ flexGrow: 1 }}>
        <Row label="Nom" value={profile.lastName} /><Row label="Post-nom" value={profile.postName} /><Row label="Prénom" value={profile.firstName} />
        <Row label="Adresse" value={profile.address} /><Row label="Lieu et date de naissance" value={[profile.birthPlace, profile.birthDate ? `le ${new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(profile.birthDate))}` : ""].filter(Boolean).join(", ")} />
        <Row label="Ville et pays" value={[profile.city, profile.country].filter(Boolean).join(", ")} /><Row label="Sexe" value={profile.gender} /><Row label="État civil" value={profile.maritalStatus} /><Row label="Nationalité" value={profile.nationality} />
        <Row label="Téléphone" value={profile.phone} /><Row label="E-mail" value={profile.email} /><Row label="Site web ou portfolio" value={profile.website} /><Row label="Profil professionnel" value={profile.linkedin} /><Row label="Lien complémentaire" value={profile.otherLink} />
      </View>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {settings.showPhoto && profile.photo.startsWith("data:image/") ? <Image src={profile.photo} style={styles.photo} /> : null}
    </View>,
    summary: <Text>{profile.summary}</Text>,
    education: <>{profile.education.map((item, index) => <View key={`${item.degree}-${index}`} style={styles.entry} wrap={false}><Text><Text style={styles.date}>{range(item.startDate, item.endDate, item.current)}{item.startDate ? " : " : ""}</Text><Text style={styles.titleText}>{[item.degree, item.field].filter(Boolean).join(" — ") || item.institution}</Text>{item.degree && item.institution ? `, ${item.institution}` : ""}</Text>{item.description ? <Text>{item.description}</Text> : null}</View>)}</>,
    experiences: <>{profile.experiences.map((item, index) => <View key={`${item.position}-${index}`} style={styles.entry} wrap={false}><Text><Text style={styles.date}>{range(item.startDate, item.endDate, item.current)}{item.startDate ? " : " : ""}</Text><Text style={styles.titleText}>{item.position || item.company}</Text>{item.position && item.company ? `, ${item.company}` : ""}</Text>{item.description ? <Text>{item.description}</Text> : null}{item.bullets.map((bullet, bulletIndex) => <View key={`${bulletIndex}-${bullet}`} style={styles.bullets}><Text>•</Text><Text style={styles.bulletText}>{bullet}</Text></View>)}</View>)}</>,
    skills: <>{profile.skills.map((item, index) => <Text key={`${item.name}-${index}`} style={styles.entry}>{item.category ? `${item.category} · ` : ""}{item.name}{item.level ? ` · Niveau ${item.level}/5` : ""}</Text>)}</>,
    languages: <View style={styles.tags}>{profile.languages.map((item, index) => <Text key={`${item.name}-${index}`} style={[styles.tag, { color: settings.accentColor, backgroundColor: "#f3f5f7" }]}>{item.name}{item.level ? ` · ${item.level}` : ""}</Text>)}</View>,
    projects: <>{profile.projects.map((item, index) => <View key={`${item.name}-${index}`} style={styles.entry} wrap={false}><Text style={styles.titleText}>{item.name}</Text>{item.description ? <Text>{item.description}</Text> : null}{item.url ? <Text>{item.url}</Text> : null}</View>)}</>,
    certifications: <>{profile.certifications.map((item, index) => <View key={`${item.name}-${index}`} style={styles.entry} wrap={false}><Text><Text style={styles.date}>{year(item.issueDate)}{item.issueDate ? " : " : ""}</Text><Text style={styles.titleText}>{item.name}</Text>{item.issuer ? `, ${item.issuer}` : ""}</Text></View>)}</>,
    interests: <View style={styles.tags}>{profile.interests.map((item, index) => <Text key={`${item}-${index}`} style={[styles.tag, { color: settings.accentColor, backgroundColor: "#f3f5f7" }]}>{item}</Text>)}</View>,
  };
  const hasContent: Record<CvSection, boolean> = { identity: Boolean(name || profile.email || profile.phone || profile.address || profile.birthPlace || profile.birthDate || profile.nationality || profile.website || profile.linkedin || profile.otherLink), summary: Boolean(profile.summary.trim()), education: profile.education.length > 0, experiences: profile.experiences.length > 0, skills: profile.skills.length > 0, languages: profile.languages.length > 0, projects: profile.projects.length > 0, certifications: profile.certifications.length > 0, interests: profile.interests.length > 0 };
  const sections = settings.sectionOrder.filter((key) => settings.visibleSections.includes(key) && hasContent[key]);

  return <Document title={`Curriculum Vitae ${name}`} author={name}><Page size="A4" style={[styles.page, { fontFamily }]} wrap>
    <Text style={[styles.title, { color: settings.accentColor, fontFamily }]}>CURRICULUM VITAE</Text>
    {sections.map((key) => <Section key={key} title={titles[key]} accentColor={settings.accentColor} fontFamily={fontFamily}>{content[key]}</Section>)}
  </Page></Document>;
}
