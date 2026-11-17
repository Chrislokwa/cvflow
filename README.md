# CVFlow

CVFlow est une application web en français pour préparer un profil professionnel, créer plusieurs CV et rédiger des lettres de motivation. Les documents se prévisualisent au format A4 et peuvent être téléchargés en PDF.

## Fonctionnalités

- Inscription, connexion et déconnexion par e-mail et mot de passe, avec Auth.js Credentials, sessions JWT et mots de passe hachés par bcryptjs.
- Données de chaque compte isolées et vérifiées côté serveur avant toute lecture ou modification d’un document.
- Profil réutilisable : identité et coordonnées, photo, résumé, formations, expériences, compétences, langues, projets, certifications et intérêts.
- Tableau de bord avec progression du profil, rubriques manquantes et documents récemment modifiés.
- Plusieurs CV par utilisateur, avec création, renommage, duplication, suppression et réglages sauvegardés automatiquement.
- Trois modèles de CV : Classique, Moderne et Minimal. L’aperçu PDF suit les réglages de modèle, couleurs, police et sections; les polices sont servies localement.
- Lettres de motivation générées depuis la formation, l’expérience et trois compétences choisies : emploi, stage ou candidature spontanée; tons formel, dynamique ou académique; deux accroches possibles par combinaison.
- Texte des lettres modifiable, aperçu PDF en direct, duplication et suppression.
- Validation Zod côté interface et côté serveur, formulaires React Hook Form, stockage PostgreSQL avec Prisma.

## Technologies

- Next.js 16, App Router, React 19 et TypeScript strict
- Tailwind CSS 4
- PostgreSQL (local ou Neon) et Prisma 6
- Auth.js v5, Credentials, sessions JWT et bcryptjs
- Zod et React Hook Form
- `@react-pdf/renderer` pour l’aperçu et les PDF
- Roboto, Lora et Merriweather embarquées depuis `public/fonts`
- ESLint et Prettier

## Prérequis

- Node.js 22.6 ou plus récent (le seed TypeScript utilise la prise en charge des types intégrée à Node)
- npm
- PostgreSQL local ou une base PostgreSQL accessible
- Git

## Installation locale

À partir de la racine du dépôt :

```bash
npm install
```

Copiez `.env.example` vers `.env` :

```bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Renseignez vos connexions PostgreSQL et Auth.js dans `.env` comme décrit dans [Variables d’environnement](#variables-denvironnement). La base `cvflow` doit déjà exister. Appliquez les migrations puis démarrez le serveur :

```bash
npm run db:migrate
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000), puis inscrivez-vous sur `/register`. Vous pouvez aussi créer le compte de démonstration décrit dans [Seed de démonstration](#seed-de-démonstration).

Pour lancer la version compilée :

```bash
npm run build
npm run start
```

## Variables d’environnement

`.env.example` contient uniquement des exemples sans identifiants réels. Les valeurs doivent rester privées dans `.env` ou dans les réglages de l’hébergeur. **Ne préfixez aucune de ces variables avec `NEXT_PUBLIC_`** : elles sont utilisées uniquement côté serveur.

| Variable | Utilisation |
| --- | --- |
| `DATABASE_URL` | Connexion PostgreSQL de l’application. Sur Neon, utilisez de préférence l’URL avec pooler. |
| `DIRECT_URL` | Connexion PostgreSQL directe utilisée par Prisma pour les migrations. Sur Neon, utilisez l’URL sans pooler. |
| `AUTH_SECRET` | Secret aléatoire utilisé par Auth.js pour signer et chiffrer les sessions. |
| `AUTH_URL` | URL de l’application, par exemple `http://localhost:3000` en local. |

Exemple PostgreSQL local :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/cvflow?schema=public"
DIRECT_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/cvflow?schema=public"
AUTH_SECRET="remplacez-par-une-valeur-aleatoire-longue"
AUTH_URL="http://localhost:3000"
```

Pour générer un secret local :

```bash
openssl rand -base64 32
```

Les deux URLs PostgreSQL peuvent être identiques avec une base locale. Si le mot de passe contient `@`, `:` ou `/`, encodez ce caractère dans l’URL (`@` devient `%40`). Ajoutez `?sslmode=require` aux connexions Neon si l’URL fournie ne contient pas déjà un paramètre SSL.

## Base de données et Prisma

Le schéma est défini dans `prisma/schema.prisma`; les migrations versionnées sont dans `prisma/migrations/`.

```bash
# Développement : applique les migrations et signale les changements de schéma
npm run db:migrate

# Régénérer le client après une modification du schéma
npm run db:generate

# Production ou déploiement : appliquer les migrations existantes sans en créer
npx prisma migrate deploy
```

Pour une évolution de schéma, modifiez `prisma/schema.prisma`, puis exécutez `npm run db:migrate` et donnez un nom à la migration. N’éditez pas une migration déjà appliquée sur un environnement partagé : créez-en une nouvelle.

## Seed de démonstration

Le seed ajoute un compte fictif avec une identité et toutes les sections du profil renseignées : études, expériences, compétences (au moins trois), langues, projet, certification et intérêts. Il ne remplace pas un compte existant. Il ne crée aucun CV ni lettre afin que vous puissiez les générer vous-même.

Avant de l’exécuter, ajoutez à votre `.env` des identifiants de démonstration locaux (mot de passe d’au moins 8 caractères) :

```env
DEMO_USER_EMAIL="demo@cvflow.local"
DEMO_USER_PASSWORD="choisissez-un-mot-de-passe-local"
```

Puis lancez :

```bash
npm run db:seed
```

Connectez-vous avec l’adresse et le mot de passe choisis. **Utilisez le seed uniquement sur une base de développement** et ne partagez pas ses identifiants. Si le compte existe déjà, le seed conserve ses données et son mot de passe.

## Déploiement sur Vercel avec Neon

1. Créez une base Neon et reliez le dépôt Git à Vercel.
2. Dans Vercel, configurez `DATABASE_URL` avec la chaîne Neon avec pooler et `DIRECT_URL` avec la chaîne directe sans pooler.
3. Ajoutez `AUTH_SECRET` avec une valeur générée aléatoirement et `AUTH_URL` avec l’URL HTTPS de production, par exemple `https://cvflow.example.com`.
4. Définissez les quatre variables pour les environnements Vercel nécessaires (Production, et éventuellement Preview/Development). **Ne les nommez jamais `NEXT_PUBLIC_DATABASE_URL`, `NEXT_PUBLIC_DIRECT_URL`, `NEXT_PUBLIC_AUTH_SECRET` ou `NEXT_PUBLIC_AUTH_URL`.**
5. Appliquez les migrations sur la base de production avant d’utiliser l’application :

   ```bash
   npx prisma migrate deploy
   ```

   Vous pouvez exécuter cette commande depuis un environnement local configuré avec les URLs Neon de production, ou l’ajouter à une étape de déploiement dédiée. Pour la commande de build Vercel, utilisez `npx prisma migrate deploy && npm run build` si les variables de la base sont disponibles au build.

6. Déployez l’application. Créez un compte utilisateur depuis `/register`; n’exécutez pas le seed de démonstration sur une base publique.

La variable `AUTH_URL` doit correspondre au domaine déployé et utiliser HTTPS. Après toute modification des variables Vercel, relancez un déploiement.

## Parcours de vérification manuelle

1. Créez un compte sur `/register`, déconnectez-vous puis reconnectez-vous.
2. Ouvrez `/profile` et remplissez l’identité et les rubriques de parcours.
3. Dans **Mes CV**, créez un CV avec chacun des modèles, modifiez ses réglages, puis vérifiez l’aperçu et le téléchargement PDF.
4. Dans **Mes lettres**, créez une lettre avec trois compétences, modifiez le texte, vérifiez l’aperçu puis téléchargez le PDF.
5. Ouvrez le tableau de bord sur ordinateur et sur téléphone : vérifiez le pourcentage du profil, les liens vers les rubriques manquantes et les listes de documents récents.

À chaque changement de données, l’application vérifie la session côté serveur. Un CV, une lettre ou un élément du profil est recherché ou modifié avec la clé du propriétaire connecté. Les entrées de formulaires sont validées côté client et côté serveur avec Zod; les champs texte et les fichiers ont des limites de taille.

## Commandes

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement Next.js. |
| `npm run build` | Build de production. |
| `npm run start` | Démarre la build compilée. |
| `npm run lint` | Vérifie le code avec ESLint. |
| `npm run db:migrate` | Applique les migrations en développement. |
| `npm run db:generate` | Génère le client Prisma. |
| `npm run db:seed` | Crée le compte de démonstration défini dans `.env`. |

Avant un commit, lancez `npm run lint` et `npm run build`.

## Structure du projet

```text
prisma/
  migrations/              Migrations PostgreSQL
  schema.prisma            Modèles et relations Prisma
  seed.ts                  Profil fictif de démonstration
src/
  app/
    (auth)/                Inscription et connexion
    (app)/                 Tableau de bord, profil, CV et lettres
    actions/               Server Actions avec session et validation
    api/cvs/[id]/pdf/      Export PDF du CV
    api/letters/[id]/pdf/  Export PDF de la lettre
    error.tsx              Erreur française récupérable
    not-found.tsx          Page 404 française
  components/
    auth/                  Formulaires d’accès
    cv/                    Gestion et aperçu des CV
    letters/               Création, édition et aperçu des lettres
    profile/               Formulaires du profil
    ui/                    Éléments d’interface partagés
  lib/
    letter-templates/      Gabarits des 9 combinaisons de lettres
    validations/           Schémas Zod côté interface et serveur
    cv-data.ts             Chargement du profil pour les CV
    prisma.ts              Singleton Prisma
  proxy.ts                 Redirections rapides des routes protégées
pdf/
  fonts.ts                 Enregistrement des polices PDF locales
  templates/               Modèles PDF des CV et lettres
public/fonts/               Polices et licences
.env.example               Noms et formats des variables
```

## Ajouter un modèle de CV

1. Ajoutez un identifiant au `enum CvTemplate` dans `prisma/schema.prisma`, créez une migration avec `npm run db:migrate`, puis régénérez Prisma si nécessaire.
2. Ajoutez le même identifiant à `cvTemplateSchema` et son libellé à `cvTemplateNames` dans `src/lib/validations/cv-settings.ts`.
3. Créez le gabarit dans `pdf/templates/` en recevant `{ profile, settings }`. Respectez les sections visibles, leur ordre, la couleur et la police; omettez les sections sans contenu.
4. Enregistrez le nouveau composant dans `pdf/template-registry.ts`.
5. Ajoutez le choix au formulaire de création et au sélecteur du composant `src/components/cv/cv-editor.tsx`.
6. Vérifiez le modèle dans l’aperçu A4 et dans le PDF téléchargé; faites aussi un essai avec plusieurs pages et avec les sections masquées.

## Erreurs et accessibilité

Les états de chargement, listes vides, notifications d’action, erreurs récupérables et page introuvable sont en français. Les pages connectées fonctionnent sur petits écrans; l’aperçu PDF reste défilable dans sa zone. Les polices et photos intégrées aux PDF sont traitées localement.

## Confidentialité

Les secrets restent dans `.env` ou les variables privées de Vercel; `.env*` est ignoré par Git, à l’exception de `.env.example`. Les données personnelles et documents restent en base PostgreSQL et ne sont pas stockés dans `localStorage`. Les mots de passe sont hachés avec bcryptjs. Les modèles et exports PDF vérifient l’utilisateur connecté et ne sont pas mis en cache publiquement.
