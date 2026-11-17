import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { CvProfileData } from "@/lib/cv-data";

export type ClassicCvSettings = { accentColor: string };
type Props = { profile: CvProfileData; settings: ClassicCvSettings };

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 40, paddingHorizontal: 48, fontFamily: "Roboto", fontSize: 9, color: "#252525", lineHeight: 1.4 },
  documentTitle: { marginBottom: 15, textAlign: "center", fontFamily: "Lora", fontSize: 15, fontWeight: 700, letterSpacing: 1.1 },
  identityContent: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  identityDetails: { flexGrow: 1, flexShrink: 1 },
  photo: { width: 76, height: 76, borderRadius: 3, objectFit: "cover" },
  section: { marginTop: 13 },
  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 13, paddingBottom: 4, borderBottomWidth: 1 },
  sectionNumber: { width: 27, fontFamily: "Lora", fontSize: 10, fontWeight: 700 },
  sectionTitle: { fontFamily: "Lora", fontSize: 11, fontWeight: 700, letterSpacing: 0.35, textTransform: "uppercase" },
  sectionBody: { paddingTop: 7 },
  identityRow: { flexDirection: "row", marginBottom: 3 },
  identityLabel: { width: 122, flexShrink: 0, color: "#464646" },
  identityValue: { flexGrow: 1, flexShrink: 1, fontWeight: 700 },
  paragraph: { color: "#343434" },
  entry: { marginBottom: 6 },
  entryLine: { marginBottom: 2 },
  entryTitle: { fontFamily: "Roboto", fontWeight: 700, fontSize: 9.5 },
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
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));
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
  const sectionTitles = [
    "Identité",
    profile.summary.trim() ? "Profil professionnel" : "",
    education.length ? "Études et formations" : "",
    experiences.length ? "Expériences professionnelles" : "",
    profile.certifications.length ? "Formations complémentaires" : "",
    profile.skills.length ? "Compétences" : "",
    profile.languages.length ? "Langues" : "",
    profile.projects.length ? "Projets" : "",
    profile.interests.length ? "Centres d’intérêt" : "",
  ].filter(Boolean);
  const numberFor = (title: string) => sectionTitles.indexOf(title) + 1;
  const linkRows = [
    { label: "Site web ou portfolio", value: profile.website },
    { label: "Profil professionnel", value: profile.linkedin },
    { label: "Lien complémentaire", value: profile.otherLink },
  ];

  return (
    <Document title={`CV ${fullName}`} author={fullName}>
      <Page size="A4" style={styles.page} wrap>
        <Text style={[styles.documentTitle, { color: settings.accentColor }]}>CURRICULUM VITAE</Text>
        <Section title="Identité" number={numberFor("Identité")} accentColor={settings.accentColor}>
          <View style={styles.identityContent}>
            <View style={styles.identityDetails}>
              <IdentityRow label="Nom" value={profile.lastName} />
              <IdentityRow label="Post-nom" value={profile.postName} />
              <IdentityRow label="Prénom" value={profile.firstName} />
              <IdentityRow label="Profession" value={profile.title} />
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
            {profile.photo.startsWith("data:image/") ? <Image src={profile.photo} style={styles.photo} /> : null}
          </View>
        </Section>

        {profile.summary.trim() ? <Section title="Profil professionnel" number={numberFor("Profil professionnel")} accentColor={settings.accentColor}><Text style={styles.paragraph}>{profile.summary}</Text></Section> : null}

        {education.length ? <Section title="Études et formations" number={numberFor("Études et formations")} accentColor={settings.accentColor}>{education.map((item, index) => (
          <View key={`${item.degree}-${index}`} style={styles.entry} wrap={false}>
            <Text style={styles.entryLine}><Text style={styles.date}>{dateRange(item.startDate, item.endDate, item.current)}{item.startDate ? " : " : ""}</Text><Text style={styles.entryTitle}>{[item.degree, item.field].filter(Boolean).join(" — ") || item.institution}</Text>{item.degree || item.field ? <Text>{[item.institution, item.city].filter(Boolean).length ? `, ${[item.institution, item.city].filter(Boolean).join(", ")}` : ""}</Text> : null}</Text>
            {item.description.trim() ? <Text>{item.description}</Text> : null}
          </View>
        ))}</Section> : null}

        {experiences.length ? <Section title="Expériences professionnelles" number={numberFor("Expériences professionnelles")} accentColor={settings.accentColor}>{experiences.map((item, index) => (
          <View key={`${item.position}-${index}`} style={styles.entry} wrap={false}>
            <Text style={styles.entryLine}><Text style={styles.date}>{dateRange(item.startDate, item.endDate, item.current)}{item.startDate ? " : " : ""}</Text><Text style={styles.entryTitle}>{item.position || item.company}</Text>{item.position && item.company ? <Text>{`, ${item.company}`}</Text> : null}{item.city ? <Text>{`, ${item.city}`}</Text> : null}</Text>
            {item.description.trim() ? <Text>{item.description}</Text> : null}
            {item.bullets.map((bullet, bulletIndex) => bullet.trim() ? <View key={`${bulletIndex}-${bullet}`} style={styles.bullet}><Text style={styles.bulletDot}>•</Text><Text style={styles.bulletText}>{bullet}</Text></View> : null)}
          </View>
        ))}</Section> : null}

        {profile.certifications.length ? <Section title="Formations complémentaires" number={numberFor("Formations complémentaires")} accentColor={settings.accentColor}>{profile.certifications.map((item, index) => (
          <View key={`${item.name}-${index}`} style={styles.entry} wrap={false}>
            <Text style={styles.entryLine}><Text style={styles.date}>{formatDate(item.issueDate)}{item.issueDate ? " : " : ""}</Text><Text style={styles.entryTitle}>{item.name}</Text>{item.issuer ? <Text>{`, ${item.issuer}`}</Text> : null}</Text>
            {item.credentialUrl ? <Text style={styles.subline}>{item.credentialUrl}</Text> : null}
          </View>
        ))}</Section> : null}

        {profile.skills.length ? <Section title="Compétences" number={numberFor("Compétences")} accentColor={settings.accentColor}>{profile.skills.map((item, index) => <Text key={`${item.name}-${index}`} style={styles.skillLine}>{item.category ? `${item.category} · ` : ""}{item.name}{item.level ? ` · Niveau ${item.level}/5` : ""}</Text>)}</Section> : null}
        {profile.languages.length ? <Section title="Langues" number={numberFor("Langues")} accentColor={settings.accentColor}><View style={styles.pills} wrap={false}>{profile.languages.map((item, index) => <Text key={`${item.name}-${index}`} style={styles.pill}>{item.name}{item.level ? ` · ${item.level}` : ""}</Text>)}</View></Section> : null}
        {profile.projects.length ? <Section title="Projets" number={numberFor("Projets")} accentColor={settings.accentColor}>{profile.projects.map((item, index) => <View key={`${item.name}-${index}`} style={styles.entry} wrap={false}><Text style={styles.entryTitle}>{item.name}</Text>{item.description.trim() ? <Text>{item.description}</Text> : null}{item.url ? <Text style={styles.subline}>{item.url}</Text> : null}</View>)}</Section> : null}
        {profile.interests.length ? <Section title="Centres d’intérêt" number={numberFor("Centres d’intérêt")} accentColor={settings.accentColor}><View style={styles.pills} wrap={false}>{profile.interests.map((item, index) => <Text key={`${item}-${index}`} style={styles.pill}>{item}</Text>)}</View></Section> : null}
      </Page>
    </Document>
  );
}
