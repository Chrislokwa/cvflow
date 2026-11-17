import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

export type LetterPdfData = {
  title: string;
  company: string;
  position: string;
  recruiterName: string;
  city: string;
  createdAt: string;
  content: string;
};

export type LetterSender = {
  firstName: string;
  lastName: string;
  postName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
};

const styles = StyleSheet.create({
  page: { paddingTop: 54, paddingBottom: 58, paddingHorizontal: 62, fontFamily: "Roboto", fontSize: 10.5, lineHeight: 1.55, color: "#28322d" },
  sender: { marginBottom: 26, alignSelf: "flex-end", width: "56%", textAlign: "right" },
  senderName: { marginBottom: 3, fontSize: 12, fontWeight: 700, color: "#1f2b24" },
  muted: { color: "#68736b", fontSize: 9 },
  recipient: { alignSelf: "flex-end", width: "56%", marginBottom: 20 },
  date: { marginBottom: 22, textAlign: "right", color: "#68736b" },
  subject: { marginBottom: 20, fontSize: 11, fontWeight: 700, color: "#285c46" },
  greeting: { marginBottom: 12 },
  paragraph: { marginBottom: 11, textAlign: "justify" },
  signature: { marginTop: 7, fontWeight: 700 },
});

function fullName(sender: LetterSender): string {
  return [sender.firstName, sender.postName, sender.lastName].filter(Boolean).join(" ");
}

function formatFrenchDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

export default function Letter({ letter, sender }: { letter: LetterPdfData; sender: LetterSender }): ReactElement<DocumentProps> {
  const paragraphs = letter.content.trim().split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const greeting = paragraphs[0] ?? "Madame, Monsieur,";
  const body = paragraphs.slice(1);
  const senderLocation = [sender.address, [sender.city, sender.country].filter(Boolean).join(", ")].filter(Boolean);
  const signature = fullName(sender);

  return <Document title={letter.title} author={signature}>
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.sender}>
        {signature ? <Text style={styles.senderName}>{signature}</Text> : null}
        {senderLocation.map((line, index) => <Text key={`${index}-${line}`} style={styles.muted}>{line}</Text>)}
        {sender.email ? <Text style={styles.muted}>{sender.email}</Text> : null}
        {sender.phone ? <Text style={styles.muted}>{sender.phone}</Text> : null}
      </View>
      <View style={styles.recipient}>
        <Text style={styles.senderName}>{letter.recruiterName ? `À l’attention de ${letter.recruiterName}` : "À l’attention du service recrutement"}</Text>
        <Text>{letter.company}</Text>
      </View>
      <Text style={styles.date}>{letter.city ? `${letter.city}, le ` : "Le "}{formatFrenchDate(letter.createdAt)}</Text>
      <Text style={styles.subject}>Objet : Candidature au poste de {letter.position}</Text>
      <Text style={styles.greeting}>{greeting}</Text>
      {body.map((paragraph, index) => <Text key={`${index}-${paragraph.slice(0, 16)}`} style={styles.paragraph} minPresenceAhead={28}>{paragraph}</Text>)}
      {signature ? <Text style={styles.signature}>{signature}</Text> : null}
    </Page>
  </Document>;
}
