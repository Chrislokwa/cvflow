# CVFlow

CVFlow est une application web de création de CV et de lettres de motivation. Son objectif est d’aider chaque personne à organiser son parcours, préparer des candidatures adaptées et exporter des documents professionnels.

> **État du projet :** le socle technique, l’authentification, les sections du profil et le premier modèle de CV avec aperçu et export PDF sont disponibles. La gestion complète de plusieurs CV et les lettres restent à implémenter.

## Sommaire

- [Fonctionnalités prévues](#fonctionnalités-prévues)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation locale](#installation-locale)
- [Configuration](#configuration)
- [Base de données et Prisma](#base-de-données-et-prisma)
- [Commandes disponibles](#commandes-disponibles)
- [Structure du projet](#structure-du-projet)
- [Sécurité et données](#sécurité-et-données)
- [Feuille de route](#feuille-de-route)
- [Contribuer](#contribuer)

## Fonctionnalités disponibles et prévues

Les fonctionnalités déjà disponibles :

- Inscription, connexion et déconnexion par adresse e-mail et mot de passe.
- Sessions JWT avec Auth.js Credentials.
- Mots de passe hachés avec bcryptjs.
- Création automatique d’un profil vide lors de l’inscription.
- Protection des pages privées et redirection vers la connexion.
- Formulaire Identité avec validation, sauvegarde et préremplissage depuis la base de données.
- Réduction et stockage facultatif de la photo de profil.
- Gestion des formations, expériences, compétences, langues, projets, certifications et centres d’intérêt.
- Réorganisation des éléments du profil et confirmation avant suppression.
- Vérification côté serveur de la propriété du profil et des éléments associés.
- Aperçu A4 du modèle classique à partir du profil connecté.
- Téléchargement PDF protégé, avec les polices Roboto et Lora embarquées localement.

Les fonctionnalités prévues :

- Espace personnel pour consulter et gérer ses documents.
- Profil réutilisable contenant les coordonnées, le résumé, les expériences, les formations, les compétences, les langues, les projets, les certifications et les centres d’intérêt.
- Création et modification de plusieurs CV par utilisateur.
- Choix de modèles de CV et réglages de présentation.
- Gestion complète de plusieurs CV, modification, suppression et réglages de présentation.
- Création de lettres de motivation avec type de candidature, ton, entreprise, poste et destinataire.
- Prévisualisation et export des lettres de motivation en PDF.
- Validation Zod des formulaires d’authentification côté interface et serveur.
- Validation des autres formulaires côté interface et serveur lors de leur implémentation.
- Interface responsive, en français.

## Technologies

- **Next.js 16** avec App Router et React 19
- **TypeScript** en mode strict
- **Tailwind CSS 4**
- **PostgreSQL** (Neon en production, PostgreSQL local pour le développement)
- **Prisma 6** pour le schéma, les migrations et l’accès aux données
- **Auth.js v5** avec Credentials et sessions JWT
- **bcryptjs**, **Zod** et **React Hook Form** pour l’authentification et ses formulaires
- **ESLint** et **Prettier**
- **@react-pdf/renderer** pour l’aperçu et l’export PDF

Les polices Roboto et Lora sont fournies depuis `public/fonts` avec leurs licences SIL Open Font License. Aucune police n’est chargée depuis un service externe à l’exécution.

## Prérequis

- Node.js compatible avec Next.js 16 (Node.js 20.9 ou plus récent)
- npm
- PostgreSQL local ou une base PostgreSQL accessible, par exemple Neon
- Git

## Installation locale

Clonez le dépôt, puis installez ses dépendances :

```bash
git clone <URL_DU_DEPOT>
cd cvflow
npm install
```

Créez un fichier `.env` à la racine du dépôt, configurez les variables comme indiqué dans [Configuration](#configuration), puis préparez la base et démarrez le serveur :

```bash
npm run db:migrate
npm run dev
```

L’application sera disponible à l’adresse [http://localhost:3000](http://localhost:3000). La route `/` affiche la page d’accueil. Vous pouvez créer un compte sur `/register`, puis vous connecter sur `/login`. Les routes de l’espace connecté nécessitent une session.

## Configuration

Copiez `.env.example` vers `.env` et remplacez les valeurs d’exemple. Ne partagez pas le fichier `.env` et ne commitez jamais ses secrets.

Exemple pour PostgreSQL local :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/cvflow?schema=public"
DIRECT_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/cvflow?schema=public"
AUTH_SECRET="remplacez-par-une-longue-valeur-aleatoire"
AUTH_URL="http://localhost:3000"
```

`DATABASE_URL` est l’URL de connexion de l’application et `DIRECT_URL` est l’URL directe utilisée par Prisma pour les opérations de schéma. Pour PostgreSQL local, elles peuvent être identiques. La base `cvflow` doit exister et l’utilisateur indiqué doit avoir les droits nécessaires.

Pour générer un secret aléatoire, vous pouvez utiliser :

```bash
openssl rand -base64 32
```

Si le mot de passe PostgreSQL contient des caractères réservés aux URL, tels que `@`, `:` ou `/`, encodez-les en pourcentage dans l’URL (par exemple `@` devient `%40`).

Pour Neon, utilisez l’URL de connexion fournie par Neon. Configurez `DIRECT_URL` avec l’URL directe recommandée pour les migrations. Ne publiez aucune URL contenant un mot de passe.

`AUTH_SECRET` et `AUTH_URL` sont utilisés par Auth.js. Gardez `AUTH_SECRET` confidentiel et définissez une valeur forte différente en production.

## Base de données et Prisma

Le schéma Prisma se trouve dans `prisma/schema.prisma`. Il définit actuellement :

- `User` et son profil facultatif à relation un-à-un ;
- `Profile` et les informations personnelles ;
- `Education`, `Experience`, `Skill`, `Language`, `Project` et `Certification`, liés au profil ;
- `Cv` et `CoverLetter`, liés au compte utilisateur ;
- des enums pour les modèles de CV et les types et tons de lettres.

Les relations de propriété utilisent des suppressions en cascade. Les tables qui appartiennent à un utilisateur ou un profil ont des index sur leurs clés de relation. L’authentification est vérifiée sur les routes privées ; chaque future lecture ou mutation de document devra aussi vérifier sa propriété côté serveur.

Après avoir configuré `.env`, appliquez les migrations de développement avec :

```bash
npm run db:migrate
```

Prisma demandera un nom de migration si le schéma a changé. Pour régénérer le client Prisma sans créer de migration :

```bash
npm run db:generate
```

Les migrations versionnées se trouvent dans `prisma/migrations/`. Ne modifiez pas une migration déjà partagée ou appliquée ; créez une nouvelle migration pour les évolutions du schéma.

## Commandes disponibles

| Commande              | Description                                             |
| --------------------- | ------------------------------------------------------- |
| `npm run dev`         | Démarre le serveur Next.js en développement.            |
| `npm run build`       | Produit une build de production.                        |
| `npm run start`       | Démarre la build de production existante.               |
| `npm run lint`        | Vérifie le code avec ESLint.                            |
| `npm run db:migrate`  | Crée et applique une migration Prisma de développement. |
| `npm run db:generate` | Génère le client Prisma.                                |

## Structure du projet

```text
prisma/
  migrations/       Migrations PostgreSQL versionnées
  schema.prisma     Modèles et relations Prisma
src/
  app/
    globals.css     Styles globaux et Tailwind
    layout.tsx      Layout racine et métadonnées
    page.tsx        Page d’accueil
    (auth)/         Inscription et connexion
    (app)/          Espace connecté et pages provisoires
    actions/        Actions serveur d’authentification
    api/auth/       Gestionnaire de routes Auth.js
    api/cv-preview/ Export PDF privé du CV courant
  components/cv/    Aperçu PDF côté navigateur
  auth.ts           Configuration Auth.js et Credentials
  proxy.ts          Redirections optimistes des routes
  lib/
    prisma.ts       Singleton Prisma
    validations/    Schémas Zod
pdf/
  fonts.ts          Enregistrement des polices PDF locales
  templates/        Modèles de documents PDF
public/fonts/       Fichiers de polices et licences
.env.example       Exemple de configuration locale
```

## Sécurité et données

Les données personnelles et les documents stockés dans CVFlow sont privés. Les pages privées vérifient la session côté serveur et le proxy Next.js effectue les redirections d’accès. L’export PDF vérifie la session, puis charge le profil par l’identifiant de l’utilisateur authentifié. Toute lecture ou mutation future devra vérifier côté serveur que la ressource appartient à l’utilisateur ; masquer une ressource dans l’interface ne suffit pas. Les mots de passe sont stockés sous forme de hachage bcrypt. Les secrets et identifiants de base de données doivent rester dans `.env` ou dans le gestionnaire de secrets de l’environnement de déploiement.

Le fichier `.env` est ignoré par Git. `.env.example` ne contient que des valeurs fictives.

## Feuille de route

Les étapes prévues, dans l’ordre général, sont :

1. **Socle et base de données** — projet Next.js, design initial, schéma Prisma et migration de départ. _(Réalisé.)_
2. **Authentification** — inscription, connexion et déconnexion avec Auth.js Credentials, mots de passe hachés et sessions JWT. _(Réalisé.)_
3. **Profil professionnel** — identité, éléments de parcours et centres d’intérêt. _(Réalisé.)_
4. **Premier modèle de CV** — modèle classique, aperçu et téléchargement PDF. _(Réalisé.)_
5. **Gestion des CV** — plusieurs CV, édition, suppression, modèles supplémentaires et réglages.
6. **Lettres de motivation** — création, édition, organisation, aperçu et export PDF.
7. **Finitions** — accessibilité, responsive, contrôles de sécurité et déploiement.

Cette feuille de route décrit l’intention du produit ; le périmètre et l’ordre peuvent évoluer à mesure que les étapes sont réalisées.

## Contribuer

- L’interface, les libellés et la documentation destinée aux utilisateurs sont en français.
- Le code, les noms de variables et les commentaires sont en anglais.
- Utilisez TypeScript strict et évitez `any`.
- Validez les données à la fois côté client et côté serveur pour chaque formulaire.
- Vérifiez la propriété de chaque ressource côté serveur avant de la lire ou de la modifier.
- Avant un commit, lancez `npm run lint` et `npm run build`.
