# CVFlow

CVFlow est une application web de création de CV et de lettres de motivation. Son objectif est d’aider chaque personne à organiser son parcours, préparer des candidatures adaptées et exporter des documents professionnels.

> **État du projet :** le socle technique, la page d’accueil et le schéma de données sont en place. Les écrans de connexion, l’espace personnel, les formulaires, la génération PDF et les autres fonctionnalités décrites dans la feuille de route sont prévus, mais ne sont pas encore disponibles.

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

## Fonctionnalités prévues

La conception de CVFlow prévoit les fonctions suivantes. Elles seront implémentées progressivement :

- Création de compte et connexion par adresse e-mail et mot de passe.
- Espace personnel pour consulter et gérer ses documents.
- Profil réutilisable contenant les coordonnées, le résumé, les expériences, les formations, les compétences, les langues, les projets, les certifications et les centres d’intérêt.
- Création et modification de plusieurs CV par utilisateur.
- Choix de modèles de CV et réglages de présentation.
- Prévisualisation et export des CV en PDF.
- Création de lettres de motivation avec type de candidature, ton, entreprise, poste et destinataire.
- Prévisualisation et export des lettres de motivation en PDF.
- Validation des formulaires dans l’interface et côté serveur.
- Interface responsive, en français.

## Technologies

- **Next.js 16** avec App Router et React 19
- **TypeScript** en mode strict
- **Tailwind CSS 4**
- **PostgreSQL** (Neon en production, PostgreSQL local pour le développement)
- **Prisma 6** pour le schéma, les migrations et l’accès aux données
- **ESLint** et **Prettier**

Les choix prévus pour les prochaines étapes sont Auth.js v5 avec Credentials et sessions JWT, `bcryptjs` pour le hachage des mots de passe, Zod et React Hook Form pour la validation, et `@react-pdf/renderer` pour les PDF. Ces bibliothèques et fonctions ne sont pas encore intégrées à l’application.

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

L’application sera disponible à l’adresse [http://localhost:3000](http://localhost:3000). La route `/` affiche actuellement la page d’accueil de CVFlow. Les liens Connexion et Inscription sont des points d’entrée visuels et ne sont pas encore reliés à des formulaires.

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

> Les variables `AUTH_SECRET` et `AUTH_URL` sont préparées pour l’intégration future d’Auth.js ; l’authentification n’est pas encore configurée.

## Base de données et Prisma

Le schéma Prisma se trouve dans `prisma/schema.prisma`. Il définit actuellement :

- `User` et son profil facultatif à relation un-à-un ;
- `Profile` et les informations personnelles ;
- `Education`, `Experience`, `Skill`, `Language`, `Project` et `Certification`, liés au profil ;
- `Cv` et `CoverLetter`, liés au compte utilisateur ;
- des enums pour les modèles de CV et les types et tons de lettres.

Les relations de propriété utilisent des suppressions en cascade. Les tables qui appartiennent à un utilisateur ou un profil ont des index sur leurs clés de relation. Les règles d’accès par utilisateur devront également être appliquées dans chaque opération serveur lors de l’implémentation des fonctionnalités.

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

| Commande | Description |
| --- | --- |
| `npm run dev` | Démarre le serveur Next.js en développement. |
| `npm run build` | Produit une build de production. |
| `npm run start` | Démarre la build de production existante. |
| `npm run lint` | Vérifie le code avec ESLint. |
| `npm run db:migrate` | Crée et applique une migration Prisma de développement. |
| `npm run db:generate` | Génère le client Prisma. |

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
  lib/
    prisma.ts       Singleton Prisma
.env.example       Exemple de configuration locale
```

## Sécurité et données

Les données personnelles et les documents stockés dans CVFlow sont privés. Toute future route, action serveur ou mutation devra vérifier côté serveur que la ressource appartient à l’utilisateur authentifié ; masquer une ressource uniquement dans l’interface ne suffit pas. Les mots de passe ne seront stockés que sous forme de hachage. Les secrets et identifiants de base de données doivent rester dans `.env` ou dans le gestionnaire de secrets de l’environnement de déploiement.

Le fichier `.env` est ignoré par Git. `.env.example` ne contient que des valeurs fictives.

## Feuille de route

Les étapes prévues, dans l’ordre général, sont :

1. **Socle et base de données** — projet Next.js, design initial, schéma Prisma et migration de départ. *(Réalisé.)*
2. **Authentification** — inscription, connexion et déconnexion avec Auth.js Credentials, mots de passe hachés et sessions JWT.
3. **Profil professionnel** — formulaires validés et gestion des informations personnelles, expériences, formations et éléments complémentaires.
4. **Gestion des CV** — création, édition, suppression, choix de modèle et réglages.
5. **Génération des PDF** — prévisualisation et téléchargement des CV.
6. **Lettres de motivation** — création, édition, organisation et export PDF.
7. **Finitions** — retours d’erreur, accessibilité, responsive, contrôles de sécurité et déploiement.

Cette feuille de route décrit l’intention du produit ; le périmètre et l’ordre peuvent évoluer à mesure que les étapes sont réalisées.

## Contribuer

- L’interface, les libellés et la documentation destinée aux utilisateurs sont en français.
- Le code, les noms de variables et les commentaires sont en anglais.
- Utilisez TypeScript strict et évitez `any`.
- Validez les données à la fois côté client et côté serveur lorsque les formulaires seront ajoutés.
- Vérifiez la propriété de chaque ressource côté serveur avant de la lire ou de la modifier.
- Avant un commit, lancez `npm run lint` et `npm run build`.
