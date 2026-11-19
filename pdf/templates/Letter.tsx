import { Document, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { CoverLetterType } from "@prisma/client";
import type { ReactElement } from "react";

export type LetterPdfData = {
  title: string;
  type: CoverLetterType;
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

const accent = "#34396f";
const subjectLabels: Record<CoverLetterType, string> = {
  APPLICATION: "Candidature au poste de",
  INTERNSHIP: "Candidature à un stage de",
  UNSOLICITED: "Candidature spontanée au poste de",
  INTERNSHIP_UNSOLICITED: "Candidature spontanée à un stage de",
  FOLLOW_UP: "Relance concernant le poste de",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 62,
    paddingBottom: 62,
    paddingHorizontal: 60,
    fontFamily: "Roboto",
    fontSize: 10.5,
    lineHeight: 1.55,
    color: accent,
  },
  topDecoration: { position: "absolute", top: 0, right: 0 },
  bottomDecoration: { position: "absolute", bottom: 0, left: 0 },
  sender: { width: "58%", marginBottom: 26 },
  senderName: { marginBottom: 2, fontSize: 12, fontWeight: 700, color: accent },
  senderDetail: { fontSize: 10.5, lineHeight: 1.55, color: accent },
  recipient: { alignSelf: "flex-end", width: "55%", marginBottom: 18, textAlign: "right" },
  recipientName: { marginBottom: 3, fontSize: 11.5, fontWeight: 700, color: accent, textTransform: "uppercase" },
  date: { marginBottom: 38, textAlign: "right", color: accent },
  subject: { marginBottom: 25, fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase" },
  greeting: { marginBottom: 23 },
  paragraph: { marginBottom: 19, textAlign: "justify" },
  signature: { marginTop: 4, color: accent },
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
  const subject = letter.position
    ? `Objet : ${subjectLabels[letter.type]} ${letter.position}`
    : `Objet : ${letter.title}`;

  return <Document title={letter.title} author={signature}>
    <Page size="A4" style={styles.page} wrap>
      <Svg fixed style={styles.topDecoration} width={175} height={132} viewBox="0 0 175 132">
        <Path d="M88 0H175V64Z" fill={accent} />
        <Path d="M0 0H15L175 106V122Z" fill={accent} />
      </Svg>
      <Svg fixed style={styles.bottomDecoration} width={175} height={132} viewBox="0 0 175 132">
        <Path d="M0 68V132H87Z" fill={accent} />
        <Path d="M0 10V27L160 132H175Z" fill={accent} />
      </Svg>

      <View style={styles.sender}>
        {signature ? <Text style={styles.senderName}>{signature}</Text> : null}
        {sender.email ? <Text style={styles.senderDetail}>{sender.email}</Text> : null}
        {sender.phone ? <Text style={styles.senderDetail}>{sender.phone}</Text> : null}
        {senderLocation.map((line, index) => <Text key={`${index}-${line}`} style={styles.senderDetail}>{line}</Text>)}
      </View>

      <View style={styles.recipient} minPresenceAhead={50}>
        <Text style={styles.recipientName}>{letter.company || "Entreprise"}</Text>
        <Text>{letter.recruiterName ? `À l’attention de ${letter.recruiterName}` : "À l’attention du service recrutement"}</Text>
      </View>
      <Text style={styles.date}>{letter.city ? `${letter.city}, le ` : "Le "}{formatFrenchDate(letter.createdAt)}</Text>
      <Text style={styles.subject} minPresenceAhead={40}>{subject}</Text>
      <Text style={styles.greeting} minPresenceAhead={24}>{greeting}</Text>
      {body.map((paragraph, index) => <Text key={`${index}-${paragraph.slice(0, 16)}`} style={styles.paragraph} minPresenceAhead={28}>{paragraph}</Text>)}
      {signature ? <Text style={styles.signature}>{signature}</Text> : null}
    </Page>
  </Document>;
}
