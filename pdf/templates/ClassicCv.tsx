import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { CvProfileData } from "@/lib/cv-data";
import type { CvSection, CvSettings } from "@/lib/validations/cv-settings";

type Props = { profile: CvProfileData; settings: CvSettings };

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 40, paddingHorizontal: 48, fontFamily: "Roboto", fontSize: 9, color: "#252525", lineHeight: 1.4 },
  documentTitle: { marginBottom: 15, textAlign: "center", fontSize: 15, fontWeight: 700, letterSpacing: 1.1 },
  identityContent: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  identityDetails: { flexGrow: 1, flexShrink: 1 },
  photo: { width: 76, height: 76, borderRadius: 3, objectFit: "cover" },
  section: { marginTop: 13 },
  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 13, paddingBottom: 4, borderBottomWidth: 1 },
  sectionNumber: { width: 27, fontSize: 10, fontWeight: 700 },
  sectionTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 0.35, textTransform: "uppercase" },
  sectionBody: { paddingTop: 7 },
  identityRow: { flexDirection: "row", marginBottom: 3 },
  identityLabel: { width: 145, flexShrink: 0, color: "#464646" },
  identityValue: { flexGrow: 1, flexShrink: 1, fontWeight: 700 },
  paragraph: { color: "#343434" },
  entry: { marginBottom: 6 },
  entryLine: { marginBottom: 2 },
  entryTitle: { fontWeight: 700, fontSize: 9.5 },
  date: { fontSize: 9, color: "#555" },
  subline: { marginTop: 1, fontSize: 8.5, color: "#555" },
  bullet: { flexDirection: "row", marginTop: 2, paddingLeft: 8, gap: 5 },
  bulletDot: { width: 5 },
  bulletText: { flexGrow: 1, flexShrink: 1 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill: { paddingVertical: 3, paddingHorizontal: 7, backgroundColor: "#f1f4f7", borderRadius: 2, fontSize: 8 },
  skillLine: { marginBottom: 4 },
});

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("fr-FR", { year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function formatBirthDate(value: string | null): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function formatBirthPlace(birthPlace: string, birthDate: string | null): string {
  const date = formatBirthDate(birthDate);
  return [birthPlace, date ? `le ${date}` : ""].filter(Boolean).join(", ");
}

function dateRange(start: string | null, end: string | null, current = false): string {
  const first = formatDate(start);
  const last = current ? "Présent" : formatDate(end);
  return [first, last].filter(Boolean).join(" – ");
}

function dateSeparator(value: string): string {
  return value ? " :\u00a0\u00a0" : "";
}

function romanNumeral(value: number): string {
  const numerals: Array<[number, string]> = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let remainder = value;
  let result = "";
  for (const [amount, numeral] of numerals) {
    while (remainder >= amount) {
      result += numeral;
      remainder -= amount;
    }
  }
  return result;
}

function Section({ title, number, accentColor, children }: { title: string; number: number; accentColor: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeading, { borderBottomColor: accentColor }]} minPresenceAhead={80}>
        <Text style={[styles.sectionNumber, { color: accentColor }]}>{romanNumeral(number)}.</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function IdentityRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return <View style={styles.identityRow} minPresenceAhead={12}><Text style={styles.identityLabel}>{label}</Text><Text style={styles.identityValue}>{value}</Text></View>;
}

export default function ClassicCv({ profile, settings }: Props): ReactElement<DocumentProps> {
  const fullName = [profile.firstName, profile.postName, profile.lastName].filter(Boolean).join(" ") || "CVFlow";
  const experiences = profile.experiences.filter((item) => item.position || item.company || item.description || item.bullets.length);
  const education = profile.education.filter((item) => item.degree || item.institution || item.description);
  const linkRows = [
    { label: "Site web ou portfolio", value: profile.website },
    { label: "Profil professionnel", value: profile.linkedin },
    { label: "Lien complémentaire", value: profile.otherLink },
  ];
  const titles: Record<CvSection, string> = {
    identity: "Identité", summary: "Profil professionnel", education: "Études et formations",
    experiences: "Expériences professionnelles", skills: "Compétences", languages: "Langues",
    projects: "Projets", certifications: "Formations complémentaires", interests: "Centres d’intérêt",
  };
  const content: Record<CvSection, React.ReactNode> = {
    identity: <View style={styles.identityContent}>
      <View style={styles.identityDetails}>
        <IdentityRow label="Nom" value={profile.lastName} />
        <IdentityRow label="Post-nom" value={profile.postName} />
        <IdentityRow label="Prénom" value={profile.firstName} />
        <IdentityRow label="Adresse" value={profile.address} />
        <IdentityRow label="Ville et pays" value={[profile.city, profile.country].filter(Boolean).join(", ")} />
        <IdentityRow label="Lieu et date de naissance" value={formatBirthPlace(profile.birthPlace, profile.birthDate)} />
        <IdentityRow label="État civil" value={profile.maritalStatus} />
        <IdentityRow label="Sexe" value={profile.gender} />
        <IdentityRow label="Nationalité" value={profile.nationality} />
        <IdentityRow label="Téléphone" value={profile.phone} />
        <IdentityRow label="E-mail" value={profile.email} />
        {linkRows.map((row) => <IdentityRow key={row.label} label={row.label} value={row.value} />)}
      </View>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {settings.showPhoto && profile.photo.startsWith("data:image/") ? <Image src={profile.photo} style={styles.photo} /> : null}
    </View>,
    summary: <Text style={styles.paragraph}>{profile.summary}</Text>,
    education: <>{education.map((item, index) => <View key={`${item.degree}-${index}`} style={styles.entry} wrap={false}>
      <Text style={styles.entryLine}><Text style={styles.date}>{dateRange(item.startDate, item.endDate, item.current)}{dateSeparator(item.startDate ?? "")}</Text><Text style={styles.entryTitle}>{[item.degree, item.field].filter(Boolean).join(" — ") || item.institution}</Text>{item.degree || item.field ? <Text>{[item.institution, item.city].filter(Boolean).length ? `, ${[item.institution, item.city].filter(Boolean).join(", ")}` : ""}</Text> : null}</Text>
      {item.description.trim() ? <Text>{item.description}</Text> : null}
    </View>)}</>,
    experiences: <>{experiences.map((item, index) => <View key={`${item.position}-${index}`} style={styles.entry} wrap={false}>
      <Text style={styles.entryLine}><Text style={styles.date}>{dateRange(item.startDate, item.endDate, item.current)}{dateSeparator(item.startDate ?? "")}</Text><Text style={styles.entryTitle}>{item.position || item.company}</Text>{item.position && item.company ? <Text>{`, ${item.company}`}</Text> : null}{item.city ? <Text>{`, ${item.city}`}</Text> : null}</Text>
      {item.description.trim() ? <Text>{item.description}</Text> : null}
      {item.bullets.map((bullet, bulletIndex) => bullet.trim() ? <View key={`${bulletIndex}-${bullet}`} style={styles.bullet}><Text style={styles.bulletDot}>•</Text><Text style={styles.bulletText}>{bullet}</Text></View> : null)}
    </View>)}</>,
    skills: <>{profile.skills.map((item, index) => <Text key={`${item.name}-${index}`} style={styles.skillLine}>{item.category ? `${item.category} · ` : ""}{item.name}{item.level ? ` · Niveau ${item.level}/5` : ""}</Text>)}</>,
    languages: <View style={styles.pills} wrap={false}>{profile.languages.map((item, index) => <Text key={`${item.name}-${index}`} style={styles.pill}>{item.name}{item.level ? ` · ${item.level}` : ""}</Text>)}</View>,
    projects: <>{profile.projects.map((item, index) => <View key={`${item.name}-${index}`} style={styles.entry} wrap={false}><Text style={styles.entryTitle}>{item.name}</Text>{item.description.trim() ? <Text>{item.description}</Text> : null}{item.url ? <Text style={styles.subline}>{item.url}</Text> : null}</View>)}</>,
    certifications: <>{profile.certifications.map((item, index) => <View key={`${item.name}-${index}`} style={styles.entry} wrap={false}><Text style={styles.entryLine}><Text style={styles.date}>{formatDate(item.issueDate)}{dateSeparator(item.issueDate ?? "")}</Text><Text style={styles.entryTitle}>{item.name}</Text>{item.issuer ? <Text>{`, ${item.issuer}`}</Text> : null}</Text>{item.credentialUrl ? <Text style={styles.subline}>{item.credentialUrl}</Text> : null}</View>)}</>,
    interests: <View style={styles.pills} wrap={false}>{profile.interests.map((item, index) => <Text key={`${item}-${index}`} style={styles.pill}>{item}</Text>)}</View>,
  };
  const hasContent: Record<CvSection, boolean> = {
    identity: Boolean(fullName || profile.email || profile.phone || profile.address || profile.birthPlace || profile.birthDate || profile.title),
    summary: Boolean(profile.summary.trim()), education: education.length > 0, experiences: experiences.length > 0,
    skills: profile.skills.length > 0, languages: profile.languages.length > 0, projects: profile.projects.length > 0,
    certifications: profile.certifications.length > 0, interests: profile.interests.length > 0,
  };
  const visibleSections = settings.sectionOrder.filter((key) => settings.visibleSections.includes(key) && hasContent[key]);
  const fontFamily = { roboto: "Roboto", lora: "Lora", merriweather: "Merriweather" }[settings.fontFamily];

  return (
    <Document title={`CV ${fullName}`} author={fullName}>
      <Page size="A4" style={[styles.page, { fontFamily }]} wrap>
        <Text style={[styles.documentTitle, { color: settings.accentColor, fontFamily }]}>CURRICULUM VITAE</Text>
        {visibleSections.map((key, index) => <Section key={key} title={titles[key]} number={index + 1} accentColor={settings.accentColor}>{content[key]}</Section>)}
      </Page>
    </Document>
  );
}
