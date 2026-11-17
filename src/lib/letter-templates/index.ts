import type { GenerateLetterInput, LetterTone, LetterType } from "@/lib/validations/letters";

type TemplateVariables = {
  poste: string;
  entreprise: string;
  recruteur: string;
  competences: string;
  formation: string;
  experience: string;
  motivation: string;
};

type ToneTemplate = {
  openings: [string, string];
  journey: string;
  skills: string;
  company: string;
  closing: string;
};

type TemplateSet = Record<LetterType, Record<LetterTone, ToneTemplate>>;

export const letterTemplates: TemplateSet = {
  APPLICATION: {
    FORMAL: {
      openings: [
        "Je vous adresse ma candidature au poste de {{poste}} au sein de {{entreprise}}, dont les activités ont retenu mon attention.",
        "Par la présente, je souhaite vous soumettre ma candidature au poste de {{poste}} proposé par {{entreprise}}.",
      ],
      journey: "Ma formation, {{formation}}, et mon expérience de {{experience}} m’ont permis de construire un parcours cohérent avec les responsabilités de ce poste.",
      skills: "Je pourrais mettre à votre service mes compétences en {{competences}}, ainsi que ma rigueur et mon sens des responsabilités.",
      company: "Rejoindre {{entreprise}} représenterait pour moi l’occasion de contribuer à vos activités tout en poursuivant mon évolution professionnelle. {{motivation}}",
      closing: "Je me tiens à votre disposition pour un entretien et vous prie d’agréer, {{recruteur}}, l’expression de mes salutations distinguées.",
    },
    DYNAMIC: {
      openings: [
        "Motivé par les missions du poste de {{poste}}, je souhaite rejoindre {{entreprise}} et contribuer concrètement à ses projets.",
        "Je souhaite mettre mon énergie et mes acquis au service de {{entreprise}} en vous proposant ma candidature au poste de {{poste}}.",
      ],
      journey: "Mon parcours, entre {{formation}} et une première expérience comme {{experience}}, m’a appris à passer rapidement de l’apprentissage à l’action.",
      skills: "Je m’appuie notamment sur {{competences}} pour produire un travail fiable, collaborer efficacement et atteindre les objectifs confiés.",
      company: "Votre entreprise constitue un environnement stimulant dans lequel je pourrais apporter mon engagement et continuer à progresser. {{motivation}}",
      closing: "Je serais heureux d’échanger avec vous sur ma candidature et vous adresse, {{recruteur}}, mes salutations respectueuses.",
    },
    ACADEMIC: {
      openings: [
        "Dans le cadre de ma recherche d’un poste de {{poste}}, je souhaite vous présenter ma candidature auprès de {{entreprise}}.",
        "L’adéquation entre mes acquis et les missions du poste de {{poste}} m’amène à vous proposer ma candidature au sein de {{entreprise}}.",
      ],
      journey: "Mon cursus en {{formation}}, complété par mon expérience de {{experience}}, m’a apporté des connaissances et méthodes pertinentes pour cette fonction.",
      skills: "Mes compétences en {{competences}} constituent une base que je souhaite mobiliser avec méthode et discernement dans le cadre de vos activités.",
      company: "Intégrer {{entreprise}} me permettrait de mettre ces acquis en pratique et de poursuivre leur approfondissement au contact de vos équipes. {{motivation}}",
      closing: "Je reste disponible pour vous exposer plus précisément mon parcours et vous prie d’agréer, {{recruteur}}, mes salutations distinguées.",
    },
  },
  INTERNSHIP: {
    FORMAL: {
      openings: [
        "Actuellement en formation, je sollicite un stage en qualité de {{poste}} auprès de {{entreprise}} afin de compléter mon apprentissage.",
        "Je vous présente ma candidature pour le stage de {{poste}} au sein de {{entreprise}}, dans le cadre de mon parcours de formation.",
      ],
      journey: "Ma formation en {{formation}} me donne des bases que je souhaite mettre en pratique; mon expérience de {{experience}} m’a déjà familiarisé avec le monde professionnel.",
      skills: "Je souhaite mobiliser mes connaissances en {{competences}} tout en apprenant auprès de vos équipes et en respectant les méthodes de travail de votre structure.",
      company: "Ce stage chez {{entreprise}} serait une étape importante pour consolider mon projet professionnel. {{motivation}}",
      closing: "Je vous remercie de l’attention portée à ma candidature et vous prie d’agréer, {{recruteur}}, l’expression de mes salutations distinguées.",
    },
    DYNAMIC: {
      openings: [
        "Je recherche un stage de {{poste}} qui me permette d’apprendre sur le terrain et de contribuer aux projets de {{entreprise}}.",
        "Prêt à m’investir et à apprendre, je vous propose ma candidature pour le stage de {{poste}} au sein de {{entreprise}}.",
      ],
      journey: "Ma formation en {{formation}} m’apporte des bases solides, et mon expérience de {{experience}} m’a donné le goût du travail en équipe.",
      skills: "Je pourrais déjà contribuer grâce à mes compétences en {{competences}}, tout en restant curieux et disponible pour apprendre de nouvelles méthodes.",
      company: "Je serais enthousiaste à l’idée de découvrir vos activités chez {{entreprise}} et de participer pleinement aux missions confiées. {{motivation}}",
      closing: "Je serais ravi de vous rencontrer pour discuter de ce stage et vous adresse, {{recruteur}}, mes salutations respectueuses.",
    },
    ACADEMIC: {
      openings: [
        "Dans le prolongement de ma formation, je souhaite effectuer un stage de {{poste}} au sein de {{entreprise}}.",
        "Afin de confronter mes acquis théoriques à la pratique, je vous soumets ma candidature pour le stage de {{poste}}.",
      ],
      journey: "Mon cursus en {{formation}} m’a permis d’acquérir des connaissances que mon expérience de {{experience}} a commencé à mettre en perspective.",
      skills: "Les compétences que j’ai développées en {{competences}} constituent des acquis que je souhaite approfondir dans un cadre professionnel exigeant.",
      company: "Un stage chez {{entreprise}} serait l’occasion d’observer vos pratiques, de contribuer à vos missions et de consolider mon projet d’études. {{motivation}}",
      closing: "Je me tiens à votre disposition pour toute précision et vous prie d’agréer, {{recruteur}}, mes salutations distinguées.",
    },
  },
  UNSOLICITED: {
    FORMAL: {
      openings: [
        "Souhaitant rejoindre une structure telle que {{entreprise}}, je me permets de vous adresser ma candidature spontanée pour des fonctions de {{poste}}.",
        "Je vous propose ma candidature spontanée pour un poste de {{poste}} au sein de {{entreprise}}, dont le domaine d’activité correspond à mon projet.",
      ],
      journey: "Mon parcours comprend une formation en {{formation}} et une expérience de {{experience}}, qui m’ont préparé à prendre part à des missions variées.",
      skills: "Je pourrais contribuer à vos activités grâce à mes compétences en {{competences}}, que je souhaite mettre au service d’une équipe engagée.",
      company: "Je serais honoré de pouvoir apporter ma contribution à {{entreprise}} et d’échanger sur vos besoins actuels ou à venir. {{motivation}}",
      closing: "Je reste à votre disposition pour un entretien et vous prie d’agréer, {{recruteur}}, l’expression de mes salutations distinguées.",
    },
    DYNAMIC: {
      openings: [
        "Je souhaite proposer mon énergie et mes compétences à {{entreprise}} pour contribuer à vos activités dans le domaine de {{poste}}.",
        "Votre entreprise m’intéresse et j’aimerais pouvoir y apporter ma contribution; je vous adresse donc ma candidature spontanée pour {{poste}}.",
      ],
      journey: "Entre ma formation en {{formation}} et mon expérience de {{experience}}, j’ai développé une base concrète pour m’adapter à de nouveaux défis.",
      skills: "Mes compétences en {{competences}} me permettraient de prendre part à vos projets avec sérieux, initiative et esprit d’équipe.",
      company: "Je serais motivé à l’idée de rejoindre {{entreprise}} et de contribuer à vos objectifs, quels que soient les besoins de votre équipe. {{motivation}}",
      closing: "Au plaisir de pouvoir échanger avec vous, je vous adresse, {{recruteur}}, mes salutations respectueuses.",
    },
    ACADEMIC: {
      openings: [
        "L’orientation de {{entreprise}} a retenu mon intérêt et m’amène à vous proposer ma candidature spontanée pour des fonctions de {{poste}}.",
        "Dans une démarche de mise en pratique de mes acquis, je souhaite vous soumettre ma candidature spontanée auprès de {{entreprise}}.",
      ],
      journey: "Mon parcours associe une formation en {{formation}} à une expérience de {{experience}}, qui m’a permis de mieux comprendre les exigences du terrain.",
      skills: "Je souhaite mettre à profit mes connaissances en {{competences}} et continuer à les développer dans un environnement professionnel structurant.",
      company: "Une collaboration avec {{entreprise}} me permettrait de contribuer à vos activités tout en approfondissant mon expérience du secteur. {{motivation}}",
      closing: "Je serais heureux de vous présenter mon parcours plus en détail et vous prie d’agréer, {{recruteur}}, mes salutations distinguées.",
    },
  },
};

function interpolate(template: string, variables: TemplateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => variables[key as keyof TemplateVariables] ?? "");
}

export function generateLetterText(
  input: GenerateLetterInput,
  data: { skills: string[]; education: string; experience: string },
): string {
  const template = letterTemplates[input.type][input.tone];
  const variables: TemplateVariables = {
    poste: input.position,
    entreprise: input.company,
    recruteur: input.recruiterName ? `Madame/Monsieur ${input.recruiterName}` : "Madame, Monsieur",
    competences: data.skills.join(", "),
    formation: data.education || "mon parcours de formation",
    experience: data.experience || "mes premières expériences professionnelles",
    motivation: input.motivation,
  };
  const opening = template.openings[Math.floor(Math.random() * template.openings.length)] ?? template.openings[0];
  const greeting = input.recruiterName ? `Madame/Monsieur ${input.recruiterName},` : "Madame, Monsieur,";
  const body = [opening, template.journey, template.skills, template.company, template.closing]
    .map((paragraph) => interpolate(paragraph, variables).trim())
    .filter(Boolean);
  return `${greeting}\n\n${body.join("\n\n")}`;
}
