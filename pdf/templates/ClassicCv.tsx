import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { CvProfileData } from "@/lib/cv-data";

export type ClassicCvSettings = { accentColor: string };
type Props = { profile: CvProfileData; settings: ClassicCvSettings };

const styles = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 36, paddingHorizontal: 48, fontFamily: "Roboto", fontSize: 9, color: "#26312c", lineHeight: 1.4 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 18, gap: 18 },
  headerText: { flexGrow: 1, flexShrink: 1 },
  name: { fontFamily: "Lora", fontSize: 25, lineHeight: 1.15, color: "#202923" },
  title: { marginTop: 5, fontSize: 11, color: "#526057" },
  photo: { width: 76, height: 76, borderRadius: 38, objectFit: "cover" },
  contacts: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", columnGap: 10, rowGap: 3, color: "#536057", fontSize: 8 },
  section: { marginTop: 11 },
  sectionTitle: { fontFamily: "Lora", fontSize: 12, marginBottom: 6, paddingBottom: 3, borderBottomWidth: 1, textTransform: "uppercase", letterSpacing: 0.8 },
  paragraph: { color: "#39443d" },
  entry: { marginBottom: 6 },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  entryTitle: { fontFamily: "Roboto", fontWeight: 700, fontSize: 9.5, flexGrow: 1 },
  date: { fontSize: 8, color: "#66736a", textAlign: "right" },
  subline: { marginTop: 1, fontSize: 8.5, color: "#5d6a61" },
  bullet: { flexDirection: "row", marginTop: 2, paddingLeft: 8, gap: 5 },
  bulletDot: { width: 5 },
  bulletText: { flexGrow: 1, flexShrink: 1 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill: { paddingVertical: 3, paddingHorizontal: 7, backgroundColor: "#f0f3ef", borderRadius: 3, fontSize: 8 },
  skillLine: { marginBottom: 4 },
});

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function dateRange(start: string | null, end: string | null, current = false): string {
  const first = formatDate(start);
  const last = current ? "Présent" : formatDate(end);
  return [first, last].filter(Boolean).join(" – ");
}

function Section({ title, accentColor, children }: { title: string; accentColor: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={[styles.sectionTitle, { color: accentColor, borderBottomColor: accentColor }]} minPresenceAhead={80}>{title}</Text>{children}</View>;
}

function Contact({ value }: { value: string }) {
  return <Text>{value}</Text>;
}

export default function ClassicCv({ profile, settings }: Props): ReactElement<DocumentProps> {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Votre nom";
  const contacts = [profile.email, profile.phone, [profile.city, profile.country].filter(Boolean).join(", "), profile.website, profile.linkedin, profile.github].filter(Boolean);
  const experiences = profile.experiences.filter((item) => item.position || item.company || item.description || item.bullets.length);
  const education = profile.education.filter((item) => item.degree || item.institution || item.description);

  return (
    <Document title={`CV ${fullName}`} author={fullName}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.name}>{fullName}</Text>
            {profile.title ? <Text style={styles.title}>{profile.title}</Text> : null}
            {contacts.length > 0 ? <View style={styles.contacts}>{contacts.map((value) => <Contact key={value} value={value} />)}</View> : null}
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {profile.photo.startsWith("data:image/") ? <Image src={profile.photo} style={styles.photo} /> : null}
        </View>

        {profile.summary.trim() ? <Section title="Profil" accentColor={settings.accentColor}><Text style={styles.paragraph}>{profile.summary}</Text></Section> : null}

        {experiences.length ? <Section title="Expériences professionnelles" accentColor={settings.accentColor}>{experiences.map((item, index) => (
          <View key={`${item.position}-${index}`} style={styles.entry} wrap={false}>
            <View style={styles.entryHeader} minPresenceAhead={24}><Text style={styles.entryTitle}>{item.position || item.company}</Text><Text style={styles.date}>{dateRange(item.startDate, item.endDate, item.current)}</Text></View>
            <Text style={styles.subline}>{[item.company, item.city].filter(Boolean).join(" · ")}</Text>
            {item.description.trim() ? <Text>{item.description}</Text> : null}
            {item.bullets.map((bullet, bulletIndex) => bullet.trim() ? <View key={`${bulletIndex}-${bullet}`} style={styles.bullet}><Text style={styles.bulletDot}>•</Text><Text style={styles.bulletText}>{bullet}</Text></View> : null)}
          </View>
        ))}</Section> : null}

        {education.length ? <Section title="Formations" accentColor={settings.accentColor}>{education.map((item, index) => (
          <View key={`${item.degree}-${index}`} style={styles.entry} wrap={false}>
            <View style={styles.entryHeader} minPresenceAhead={24}><Text style={styles.entryTitle}>{[item.degree, item.field].filter(Boolean).join(" — ") || item.institution}</Text><Text style={styles.date}>{dateRange(item.startDate, item.endDate, item.current)}</Text></View>
            <Text style={styles.subline}>{[item.institution, item.city].filter(Boolean).join(" · ")}</Text>
            {item.description.trim() ? <Text>{item.description}</Text> : null}
          </View>
        ))}</Section> : null}

        {profile.skills.length ? <Section title="Compétences" accentColor={settings.accentColor}>{profile.skills.map((item, index) => <Text key={`${item.name}-${index}`} style={styles.skillLine}>{item.category ? `${item.category} · ` : ""}{item.name}{item.level ? ` · Niveau ${item.level}/5` : ""}</Text>)}</Section> : null}
        {profile.languages.length ? <Section title="Langues" accentColor={settings.accentColor}><View style={styles.pills} wrap={false}>{profile.languages.map((item, index) => <Text key={`${item.name}-${index}`} style={styles.pill}>{item.name}{item.level ? ` · ${item.level}` : ""}</Text>)}</View></Section> : null}
        {profile.projects.length ? <Section title="Projets" accentColor={settings.accentColor}>{profile.projects.map((item, index) => <View key={`${item.name}-${index}`} style={styles.entry} wrap={false}><Text style={styles.entryTitle}>{item.name}</Text>{item.description.trim() ? <Text>{item.description}</Text> : null}{item.url ? <Text style={styles.subline}>{item.url}</Text> : null}</View>)}</Section> : null}
        {profile.certifications.length ? <Section title="Certifications" accentColor={settings.accentColor}>{profile.certifications.map((item, index) => <View key={`${item.name}-${index}`} style={styles.entry} wrap={false}><View style={styles.entryHeader} minPresenceAhead={22}><Text style={styles.entryTitle}>{item.name}</Text><Text style={styles.date}>{formatDate(item.issueDate)}</Text></View>{item.issuer ? <Text style={styles.subline}>{item.issuer}</Text> : null}{item.credentialUrl ? <Text style={styles.subline}>{item.credentialUrl}</Text> : null}</View>)}</Section> : null}
        {profile.interests.length ? <Section title="Centres d’intérêt" accentColor={settings.accentColor}><View style={styles.pills} wrap={false}>{profile.interests.map((item, index) => <Text key={`${item}-${index}`} style={styles.pill}>{item}</Text>)}</View></Section> : null}
      </Page>
    </Document>
  );
}
