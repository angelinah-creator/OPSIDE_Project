# OPSIDE - Documentation Technique Complete

## Table des matieres

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture generale](#2-architecture-generale)
3. [Prerequis et installation](#3-prerequis-et-installation)
4. [Backend (NestJS)](#4-backend-nestjs)
   - [Structure des dossiers](#41-structure-des-dossiers)
   - [Configuration et variables d'environnement](#42-configuration-et-variables-denvironnement)
   - [Base de donnees et schema Prisma](#43-base-de-donnees-et-schema-prisma)
   - [Modules et API REST](#44-modules-et-api-rest)
   - [Authentification et securite](#45-authentification-et-securite)
   - [Temps reel (WebSocket)](#46-temps-reel-websocket)
   - [Integrations externes](#47-integrations-externes)
5. [Frontend (Next.js)](#5-frontend-nextjs)
   - [Structure des dossiers](#51-structure-des-dossiers)
   - [Configuration et variables d'environnement](#52-configuration-et-variables-denvironnement)
   - [Routes et pages](#53-routes-et-pages)
   - [Composants](#54-composants)
   - [Services et couche API](#55-services-et-couche-api)
   - [Hooks personnalises](#56-hooks-personnalises)
6. [Flux metier principaux](#6-flux-metier-principaux)
7. [Guide de demarrage](#7-guide-de-demarrage)

---

## 1. Vue d'ensemble du projet

OPSIDE est une plateforme de mise en relation entre entreprises (clients) et developpeurs africains (candidats). La plateforme couvre l'ensemble du cycle de recrutement tech : creation de profil, publication d'offres d'emploi, matching algorithmique, tests techniques generes par IA, gestion de workspace collaboratif et suivi du temps de travail.

**Public cible :**

- Les entreprises (clients) qui souhaitent recruter des developpeurs africains rapidement.
- Les developpeurs africains (candidats) qui cherchent des missions freelance ou des emplois.
- Les administrateurs de la plateforme qui gerent les utilisateurs et les contenus.

**Proposition de valeur :** Trouver et valider un developpeur en moins de 72 heures grace a un systeme de matching, des tests techniques automatises via Claude AI et un espace de travail integre.

---

## 2. Architecture generale

Le projet est divise en deux applications independantes qui communiquent via une API REST et des WebSockets.

```
OPSIDE_Project/
├── backend/          # API NestJS (port 3001)
└── frontend/         # Application Next.js (port 3000)
```

**Communication :**

- Le frontend appelle le backend via HTTP REST (`axios`) avec un access token JWT dans l'en-tete `Authorization: Bearer`.
- Les notifications en temps reel transitent par un WebSocket Socket.IO sur le namespace `/notifications`.
- Le rafraichissement des tokens est gere automatiquement par un intercepteur Axios cote frontend.

**Stack technique :**

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4 |
| Backend | NestJS 11, TypeScript 5, Prisma 7 |
| Base de donnees | PostgreSQL |
| ORM | Prisma Client |
| Authentification | JWT (access 15min + refresh 7j), bcrypt |
| Temps reel | Socket.IO 4 |
| Stockage fichiers | Cloudinary |
| Email | Nodemailer (SMTP Gmail) |
| IA | Anthropic Claude (claude-sonnet-4) |
| Gestionnaire de paquets | pnpm (frontend), npm (backend) |

---

## 3. Prerequis et installation

**Prerequis :**

- Node.js >= 18
- PostgreSQL >= 14 (ecoute sur le port 5433 par defaut dans ce projet)
- pnpm (pour le frontend)
- npm (pour le backend)
- Un compte Cloudinary (stockage media)
- Un compte Anthropic avec une cle API (generation IA des tests)
- Un compte Gmail (ou SMTP compatible) pour l'envoi d'emails

**Cloner le projet :**

```bash
git clone <url-du-depot>
cd OPSIDE_Project
```

**Installation du backend :**

```bash
cd backend
npm install
# Copier et editer le fichier d'environnement
cp .env.example .env
# Appliquer les migrations de base de donnees
npx prisma migrate deploy
# (Optionnel) Seeder les competences de base
npx ts-node prisma/seed-skills.ts
# (Optionnel) Creer un administrateur
npx ts-node prisma/seed-admin.ts
```

**Installation du frontend :**

```bash
cd frontend
pnpm install
# Copier et editer le fichier d'environnement
cp .env.local.example .env.local
```

---

## 4. Backend (NestJS)

### 4.1 Structure des dossiers

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema de la base de donnees
│   ├── seed-admin.ts          # Script de creation de l'admin initial
│   ├── seed-skills.ts         # Script de seed des competences par defaut
│   ├── migrations/            # Historique des migrations Prisma
│   └── sql/                   # Scripts SQL supplementaires
├── src/
│   ├── main.ts                # Point d'entree, bootstrap de l'application
│   ├── app.module.ts          # Module racine, import de tous les modules
│   ├── app.controller.ts      # Controleur de sante de l'application
│   ├── ai/
│   │   ├── claude-client.service.ts   # Client Anthropic (generation IA)
│   │   └── prompts/                   # Prompts systeme pour l'IA
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── decorators/        # @CurrentUser, @Roles
│   │   ├── dto/               # RegisterDto, LoginDto, etc.
│   │   ├── guards/            # JwtAuthGuard, JwtRefreshGuard, RolesGuard
│   │   └── strategies/        # JwtStrategy, JwtRefreshStrategy
│   ├── candidate/
│   │   ├── candidate.controller.ts
│   │   ├── candidate.service.ts
│   │   ├── candidate.module.ts
│   │   └── dto/
│   ├── candidatures/
│   │   ├── candidatures.controller.ts
│   │   ├── candidatures.service.ts
│   │   └── candidatures.module.ts
│   ├── client/
│   │   ├── client.controller.ts
│   │   ├── client.service.ts
│   │   └── client.module.ts
│   ├── common/
│   │   └── filters/           # AllExceptionsFilter (filtre global d'erreurs)
│   ├── custom-test/
│   │   ├── custom-test.controller.ts
│   │   ├── custom-test.service.ts
│   │   └── mock-questions.generator.ts
│   ├── job-offers/
│   │   ├── job-offers.controller.ts
│   │   └── job-offers.service.ts
│   ├── mail/
│   │   └── mail.service.ts    # Emails transactionnels (verification, reset)
│   ├── matches/
│   │   ├── matches.controller.ts
│   │   └── matches.service.ts
│   ├── notifications/
│   │   ├── notifications.controller.ts
│   │   ├── notifications.gateway.ts   # WebSocket Gateway
│   │   └── notifications.service.ts
│   ├── prisma/
│   │   └── prisma.service.ts  # Service Prisma injectable
│   ├── skills/
│   │   ├── skills.controller.ts
│   │   └── skills.service.ts
│   ├── test/                  # Tests techniques platform (generes par IA)
│   │   ├── test.controller.ts
│   │   └── test.service.ts
│   ├── timesheets/
│   │   ├── timesheets.controller.ts
│   │   └── timesheets.service.ts
│   ├── upload/
│   │   └── upload.service.ts  # Upload Cloudinary
│   ├── users/
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   └── videos/
│       ├── videos.controller.ts
│       └── videos.service.ts
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env
```

### 4.2 Configuration et variables d'environnement

Le fichier `.env` a la racine du dossier `backend/` contient toutes les variables de configuration :

```env
# Base de donnees PostgreSQL
DATABASE_URL="postgresql://postgres:root@localhost:5433/opside_project?schema=public"

# JWT - Secrets (minimum 32 caracteres)
JWT_ACCESS_SECRET=your_access_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_here_min_32_chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Cloudinary (stockage des fichiers media)
CLOUDINARY_CLOUD_NAME=<votre_cloud_name>
CLOUDINARY_API_KEY=<votre_api_key>
CLOUDINARY_API_SECRET=<votre_api_secret>

# Serveur
PORT=3001
NODE_ENV=development

# SMTP (envoi des emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<votre_email>
SMTP_PASS=<mot_de_passe_application>
SMTP_FROM=<votre_email>

# URL du frontend (pour les liens dans les emails)
FRONTEND_URL=http://localhost:3000

# Anthropic (IA pour la generation des tests)
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-sonnet-4-20250514
```

**Parametrage du serveur (`main.ts`) :**

- Port d'ecoute : `process.env.PORT || 3001`
- CORS autorise toutes les origines (`origin: '*'`) en developpement
- `ValidationPipe` global avec `whitelist: true` et `forbidNonWhitelisted: true`
- Filtre global `AllExceptionsFilter` pour normaliser les reponses d'erreur
- Rate limiting via `ThrottlerModule` : 100 requetes par minute par IP

### 4.3 Base de donnees et schema Prisma

La base de donnees est PostgreSQL, gree par Prisma. Voici un recapitulatif de tous les modeles.

**Enumerations :**

| Enum | Valeurs |
|---|---|
| `Role` | `candidat`, `client`, `admin` |
| `UserStatus` | `active`, `suspended`, `deleted`, `pending` |
| `CandidateStatus` | `open_to_work`, `in_mission`, `part_time` |
| `Speciality` | `frontend`, `backend`, `fullstack`, `mobile`, `devops`, `data`, `design`, `other` |
| `Availability` | `immediate`, `two_weeks`, `one_month`, `three_months`, `unavailable` |
| `EmploymentType` | `temps_plein`, `temps_partiel`, `freelance`, `independant`, `stage`, `alternance`, etc. |
| `EducationLevel` | `bac`, `bac_plus_2`, ..., `doctorat`, `bac_plus_8`, `autre` |
| `Country` | `kenya`, `nigeria`, `egypte`, `maroc`, `tunisie`, `madagascar`, `senegal`, `maurice` |
| `Currency` | `MGA`, `XOF`, `XAF`, `MAD`, `TND`, `KES`, `NGN`, `EGP`, `MUR`, `EUR`, `USD` |
| `WorkType` | `full_remote`, `hybrid`, `on_site` |
| `JobOfferStatus` | `draft`, `active`, `paused`, `closed` |
| `MatchStatus` | `pending_candidate`, `pending_client`, `confirmed`, `in_workspace`, `rejected` |
| `MatchInitiatedBy` | `candidate`, `client` |
| `CandidatureStatus` | `pending`, `matched`, `rejected`, `withdrawn` |
| `TestStatus` | `pending`, `in_progress`, `submitted`, `scored`, `expired` |
| `CustomTestStatus` | `pending`, `sent`, `in_progress`, `submitted`, `scored`, `expired` |
| `TestType` | `platform`, `client` |
| `TimerStatus` | `running`, `paused`, `stopped` |
| `NotificationType` | `new_application`, `match_request`, `match_confirmed`, `match_rejected`, `test_result`, `sourcing_invitation`, `workspace_invitation` |
| `CompanySize` | `size_1_10`, `size_11_50`, `size_51_200`, `size_200_plus` |

**Modeles de donnees :**

**`User`** - Compte utilisateur central

| Champ | Type | Description |
|---|---|---|
| `id` | UUID | Identifiant unique |
| `email` | String (unique) | Adresse email |
| `password` | String | Mot de passe hache (bcrypt, 10 rounds) |
| `role` | Role | Role dans la plateforme |
| `first_name` | String? | Prenom |
| `last_name` | String? | Nom de famille |
| `status` | UserStatus | Statut du compte (defaut: `pending`) |
| `email_verification_token` | String? | Token de verification email |
| `reset_password_token` | String? | Token de reinitialisation du mot de passe |
| `reset_password_expires` | DateTime? | Expiration du token de reinitialisation |

Relations : `RefreshToken[]`, `CandidateProfile?`, `ClientProfile?`, `Skill[]`, `Test[]`, `JobOffer[]`, `Candidature[]`, `CustomTest[]`, `Match[]`, `Notification[]`, `Timesheet[]`, `History[]`

**`RefreshToken`** - Tokens de rafraichissement JWT

Stocke les refresh tokens avec statut revoque (`is_revoked`) pour la rotation des tokens.

**`CandidateProfile`** - Profil d'un candidat

| Champ | Type | Description |
|---|---|---|
| `phone` | String? | Telephone |
| `country` | Country | Pays |
| `city` | String? | Ville |
| `bio` | String? | Biographie |
| `title` | String? | Titre professionnel |
| `speciality` | Speciality | Domaine de specialisation |
| `experience_years` | Int | Annees d'experience |
| `daily_rate` | Decimal | Taux journalier |
| `currency` | Currency | Devise |
| `availability` | Availability | Disponibilite |
| `status` | CandidateStatus | Statut professionnel |
| `linkedin_url` | String? | URL LinkedIn |
| `portfolio_url` | String? | URL Portfolio |
| `github_url` | String? | URL GitHub |
| `photo_url` | String? | URL de la photo de profil (Cloudinary) |
| `profile_completed` | Boolean | Profil complete ou non |

Relations : `CandidateSkill[]`, `Experience[]`, `Education[]`

**`CandidateSkill`** - Table de jonction candidat-competence (cle composite)

**`Experience`** - Experience professionnelle d'un candidat

Contient : titre, type d'emploi, entreprise, periode (mois/annee de debut et fin), localisation, description, competences associees (`ExperienceSkill[]`), medias (`ExperienceMedia[]`).

**`Education`** - Formation d'un candidat

Contient : ecole, diplome, domaine, periode, niveau d'etude, description, competences associees (`EducationSkill[]`), medias (`EducationMedia[]`).

**`ExperienceMedia` / `EducationMedia`** - Fichiers media (images, videos, PDFs) associes aux experiences et formations, stockes sur Cloudinary.

**`ClientProfile`** - Profil d'une entreprise cliente

| Champ | Type | Description |
|---|---|---|
| `company_name` | String | Nom de l'entreprise |
| `company_size` | CompanySize? | Taille de l'entreprise |
| `industry` | String? | Secteur d'activite |
| `country` | Country | Pays |
| `city` | String? | Ville |
| `contact_name` | String | Nom du contact principal |
| `contact_email` | String | Email du contact |
| `contact_phone` | String? | Telephone du contact |
| `website` | String? | Site web |
| `logo_url` | String? | Logo (Cloudinary) |
| `interview_availability` | String? | Disponibilite pour les entretiens |

**`Skill`** - Competence (globale ou personnalisee)

Contient `name`, `category`, `is_custom` (competence creee par l'utilisateur), et `owner_id` (nul pour les competences globales de la plateforme).
Contrainte d'unicite : `[name, owner_id]` (une competence custom est unique par utilisateur).

**`Test`** - Test technique genere par la plateforme

| Champ | Type | Description |
|---|---|---|
| `skills_tested` | String[] | Competences testees |
| `speciality` | String | Specialite |
| `difficulty` | String | Niveau : junior, mid, senior |
| `questions` | Json | Questions generees par Claude |
| `answers` | Json? | Reponses du candidat |
| `score` | Int? | Score de 0 a 100 |
| `score_details` | Json? | Details par question |
| `duration_minutes` | Int | Duree allouee |
| `status` | TestStatus | Etat du test |
| `ai_model` | String? | Modele IA utilise |

**`JobOffer`** - Offre d'emploi publiee par un client

| Champ | Type | Description |
|---|---|---|
| `title` | String | Intitule du poste |
| `description` | String | Description complete |
| `speciality` | Speciality | Specialite requise |
| `experience_min` | Int? | Annees minimum d'experience |
| `tjm_client` | Decimal | Taux journalier client |
| `contract_duration` | String? | Duree du contrat |
| `work_type` | WorkType | Mode de travail |
| `status` | JobOfferStatus | Statut de l'offre (defaut: `draft`) |
| `is_anonymous` | Boolean | Offre anonyme (defaut: `true`) |
| `views_count` | Int | Nombre de vues |
| `applications_count` | Int | Nombre de candidatures |

Relations : `JobOfferSkill[]`, `Candidature[]`, `Match[]`

**`Candidature`** - Candidature d'un candidat a une offre

Lie un `User` (candidat) a une `JobOffer` avec un statut (`pending`, `matched`, `rejected`, `withdrawn`) et un message optionnel.

**`Match`** - Match entre un candidat et un client

| Champ | Type | Description |
|---|---|---|
| `status` | MatchStatus | Etat du match |
| `initiated_by` | MatchInitiatedBy | Qui a initie le match |
| `matched_at` | DateTime? | Date de confirmation |
| `rejected_at` | DateTime? | Date de rejet |
| `rejected_by` | Role? | Qui a rejete |
| `calendly_url` | String? | Lien Calendly pour l'entretien |

Relations : `CustomTest?`, `Timesheet[]`

**`CustomTest`** - Test technique personnalise cree par un client pour un candidat specifique

| Champ | Type | Description |
|---|---|---|
| `skills_tested` | String[] | Competences a tester |
| `difficulty` | String? | Niveau de difficulte |
| `duration_minutes` | Int | Duree allouee |
| `custom_instructions` | String? | Instructions specifiques |
| `threshold` | Int | Score minimum requis (defaut: 75) |
| `questions` | Json? | Questions (generees par IA ou moquees) |
| `answers` | Json? | Reponses du candidat |
| `score` | Int? | Score final |
| `retest_allowed` | Boolean | Deuxieme chance possible |
| `retest_used` | Boolean | Deuxieme chance utilisee |

**`Notification`** - Notification utilisateur

Contient `type`, `title`, `message`, `link`, `read` (lu/non-lu), `email_sent`.

**`Timesheet`** - Entree de suivi du temps

| Champ | Type | Description |
|---|---|---|
| `description` | String? | Description de la session |
| `start_time` | DateTime | Debut du chronometre |
| `end_time` | DateTime? | Fin du chronometre |
| `duration` | Int | Duree en secondes |
| `status` | TimerStatus | Etat : running, paused, stopped |
| `paused_at` | DateTime[] | Tableau des moments de pause |
| `resumed_at` | DateTime[] | Tableau des moments de reprise |
| `date` | DateTime (Date only) | Date de la session |

**`History`** - Historique des actions d'un candidat (candidatures, tests)

Contient `type`, `title`, `date`, `result`, `icon`, `color`, `reference_id`, `is_deleted`.

**`Video`** - Videos presentationnelles de la plateforme

Contient `title`, `description`, `url`, `public_id` (Cloudinary).

### 4.4 Modules et API REST

Le backend expose une API REST. Tous les endpoints sont prefixes par la racine du backend (`http://localhost:3001`). Les routes protegees necessitent un header `Authorization: Bearer <access_token>`.

#### Module Auth (`/auth`)

| Methode | Route | Protection | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Inscription (candidat ou client uniquement, pas admin) |
| POST | `/auth/login` | Public | Connexion |
| GET | `/auth/verify-email?token=` | Public | Verification de l'email |
| POST | `/auth/forgot-password` | Public | Demande de reinitialisation du mot de passe |
| POST | `/auth/reset-password` | Public | Reinitialisation du mot de passe |
| POST | `/auth/refresh` | JwtRefreshGuard | Rafraichissement des tokens |
| POST | `/auth/logout` | JwtAuthGuard | Deconnexion (revoque le refresh token) |
| POST | `/auth/logout-all` | JwtAuthGuard | Deconnexion de tous les appareils |
| GET | `/auth/me` | JwtAuthGuard | Informations de l'utilisateur connecte |

**Comportement d'inscription :** Le compte est cree avec le statut `pending`. Un email de verification est envoye. La connexion est bloquee jusqu'a la verification de l'email.

**Tokens :** Access token (15 min), Refresh token (7 jours). A chaque rafraichissement, l'ancien refresh token est revoque et un nouveau est genere (rotation).

#### Module Candidate (`/candidate`)

| Methode | Route | Roles | Description |
|---|---|---|---|
| POST | `/candidate/profile` | candidat | Creer le profil candidat |
| GET | `/candidate/profile/me` | candidat | Recuperer son propre profil |
| GET | `/candidate/profile/:id` | candidat, client, admin | Recuperer un profil par ID |
| GET | `/candidate/all` | client, admin | Lister tous les profils candidats |
| GET | `/candidate/applied-jobs` | candidat | IDs des offres auxquelles le candidat a postule |
| PATCH | `/candidate/profile` | candidat | Mettre a jour le profil |
| POST | `/candidate/profile/photo` | candidat | Uploader sa photo de profil (multipart) |
| DELETE | `/candidate/profile/photo` | candidat | Supprimer sa photo de profil |
| POST | `/candidate/experiences` | candidat | Ajouter une experience |
| GET | `/candidate/experiences` | candidat | Lister ses experiences |
| PATCH | `/candidate/experiences/:id` | candidat | Modifier une experience |
| DELETE | `/candidate/experiences/:id` | candidat | Supprimer une experience |
| POST | `/candidate/experiences/:id/media` | candidat | Uploader un media pour une experience |
| DELETE | `/candidate/experiences/:expId/media/:mediaId` | candidat | Supprimer un media d'experience |
| POST | `/candidate/educations` | candidat | Ajouter une formation |
| GET | `/candidate/educations` | candidat | Lister ses formations |
| PATCH | `/candidate/educations/:id` | candidat | Modifier une formation |
| DELETE | `/candidate/educations/:id` | candidat | Supprimer une formation |
| POST | `/candidate/educations/:id/media` | candidat | Uploader un media pour une formation |
| DELETE | `/candidate/educations/:eduId/media/:mediaId` | candidat | Supprimer un media de formation |
| GET | `/candidate/history` | candidat | Historique des actions |
| DELETE | `/candidate/history/:id` | candidat | Supprimer un element de l'historique |

#### Module Client (`/client`)

| Methode | Route | Roles | Description |
|---|---|---|---|
| POST | `/client/profile` | client | Creer le profil entreprise |
| GET | `/client/profile/me` | client | Recuperer son propre profil |
| GET | `/client/profile/:id` | client, admin | Recuperer un profil par ID |
| PATCH | `/client/profile` | client | Mettre a jour le profil |
| POST | `/client/profile/logo` | client | Uploader le logo de l'entreprise (multipart) |

#### Module Job Offers (`/job-offers`)

| Methode | Route | Roles | Description |
|---|---|---|---|
| POST | `/job-offers` | client | Creer une offre d'emploi |
| GET | `/job-offers/candidate` | candidat, admin | Lister les offres actives (vue candidat) |
| GET | `/job-offers/client` | client | Lister ses propres offres |
| GET | `/job-offers/:id` | client, candidat, admin | Recuperer une offre par ID |
| PATCH | `/job-offers/:id` | client | Modifier une offre |
| DELETE | `/job-offers/:id` | client | Supprimer une offre |

#### Module Candidatures (`/candidatures`)

| Methode | Route | Roles | Description |
|---|---|---|---|
| POST | `/candidatures` | candidat | Postuler a une offre |
| GET | `/candidatures/candidate` | candidat | Lister ses propres candidatures |
| GET | `/candidatures/client` | client | Lister les candidatures recues |
| PATCH | `/candidatures/:id/status` | client | Modifier le statut d'une candidature |

#### Module Matches (`/matches`)

| Methode | Route | Roles | Description |
|---|---|---|---|
| POST | `/matches/source` | client | Sourcer directement un candidat |
| PATCH | `/matches/:id/respond` | tous | Repondre a un match (confirmer ou rejeter) |
| GET | `/matches/candidate` | candidat | Lister les matches du candidat |
| GET | `/matches/client` | client | Lister les matches du client |
| PATCH | `/matches/:id/end-contract` | client | Terminer un contrat |
| PATCH | `/matches/:id/add-to-workspace` | client | Ajouter le match au workspace |
| GET | `/matches/admin/all` | admin | Lister tous les matches (admin) |
| GET | `/matches/:id` | tous | Recuperer un match par ID |

**Flux de match :**
1. Un client source un candidat (`/matches/source`) : statut `pending_candidate`
2. Le candidat repond (`confirm` ou `reject`) : statut passe a `pending_client` si confirme
3. Le client confirme : statut passe a `confirmed`
4. Le client ajoute au workspace : statut passe a `in_workspace`

#### Module Tests Plateforme (`/tests`)

Les tests plateforme sont generes automatiquement par Claude AI en fonction des competences et de la specialite du candidat.

| Methode | Route | Roles | Description |
|---|---|---|---|
| POST | `/tests/start` | candidat | Demarrer un nouveau test |
| GET | `/tests/:testId/start` | candidat | Demarrer un test existant |
| POST | `/tests/submit` | candidat | Soumettre les reponses d'un test |
| GET | `/tests/:testId/result` | candidat | Recuperer le resultat d'un test |
| GET | `/tests/latest-score` | candidat | Recuperer le dernier score |

#### Module Custom Tests (`/custom-test`)

Les tests personnalises sont crees par le client pour un candidat specifique dans le cadre d'un match.

| Methode | Route | Roles | Description |
|---|---|---|---|
| POST | `/custom-test` | client | Creer un test personnalise |
| POST | `/custom-test/match/:matchId/send-calendly` | client | Envoyer un lien Calendly |
| GET | `/custom-test/client` | client | Lister les tests crees par ce client |
| POST | `/custom-test/:id/retest` | client | Autoriser un re-test |
| GET | `/custom-test/match/:matchId` | tous | Recuperer le test d'un match |
| GET | `/custom-test/candidate` | candidat | Lister les tests assignes au candidat |
| GET | `/custom-test/:id` | candidat | Recuperer un test specifique |
| PATCH | `/custom-test/:id/start` | candidat | Demarrer le test |
| POST | `/custom-test/:id/submit` | candidat | Soumettre les reponses |

#### Module Skills (`/skills`)

| Methode | Route | Description |
|---|---|---|
| GET | `/skills?category=` | Lister les competences (filtrable par categorie) |
| POST | `/skills` | Creer une competence personnalisee |
| PATCH | `/skills/:id` | Modifier une competence |
| DELETE | `/skills/:id` | Supprimer une competence |
| GET | `/skills/:id` | Recuperer une competence |

#### Module Timesheets (`/timesheets`)

Systeme de suivi du temps avec chronometre integre.

| Methode | Route | Description |
|---|---|---|
| POST | `/timesheets/timer/start` | Demarrer le chronometre |
| POST | `/timesheets/timer/pause` | Mettre en pause |
| POST | `/timesheets/timer/resume` | Reprendre |
| POST | `/timesheets/timer/stop` | Arreter et sauvegarder |
| GET | `/timesheets/timer/active` | Recuperer le chronometre actif |
| POST | `/timesheets` | Creer une entree manuelle |
| PUT | `/timesheets/:id` | Modifier une entree |
| DELETE | `/timesheets/:id` | Supprimer une entree |
| GET | `/timesheets?startDate=&endDate=&matchId=` | Lister les entrees avec filtres |
| GET | `/timesheets/report?matchId=&startDate=&endDate=` | Rapport consolide |

#### Module Notifications (`/notifications`)

| Methode | Route | Description |
|---|---|---|
| GET | `/notifications` | Lister toutes les notifications |
| GET | `/notifications/unread-count` | Nombre de notifications non lues |
| PATCH | `/notifications/:id/read` | Marquer une notification comme lue |
| PATCH | `/notifications/read-all` | Marquer toutes comme lues |
| DELETE | `/notifications/:id` | Supprimer une notification |

#### Module Users (`/users`)

Gestion administrative des utilisateurs.

#### Module Videos (`/videos`)

Gestion des videos presentationnelles de la plateforme (CRUD complet avec upload Cloudinary).

### 4.5 Authentification et securite

**Strategie JWT double token :**

- `access_token` : JWT signe avec `JWT_ACCESS_SECRET`, valide 15 minutes. Transmis dans le header `Authorization: Bearer`.
- `refresh_token` : JWT signe avec `JWT_REFRESH_SECRET`, valide 7 jours. Stocke en base de donnees avec un flag `is_revoked`.

**Guards :**

- `JwtAuthGuard` : Valide l'access token. Utilise la strategie `passport-jwt`.
- `JwtRefreshGuard` : Valide le refresh token. Verifie qu'il n'est pas revoque en base.
- `RolesGuard` : Verifie le role de l'utilisateur via le decorateur `@Roles(Role.candidat)`.

**Decorateurs :**

- `@CurrentUser()` : Injecte l'utilisateur courant depuis le payload JWT.
- `@CurrentUser('id')` : Injecte uniquement le champ `id`.
- `@Roles(...roles)` : Declare les roles autorises sur un endpoint.

**Rate limiting :** 100 requetes par minute par IP via `ThrottlerModule`.

**Mots de passe :** Haches avec bcrypt (salt rounds: 10).

**Inscription :** Le compte est cree avec le statut `pending`. L'email de verification contient un token aleatoire (`crypto.randomBytes(32)`). A la verification, le statut passe a `active` et des tokens JWT sont immediatement generes.

**Reinitialisation du mot de passe :** Token aleatoire avec expiration 1 heure. A la reinitialisation reussie, tous les refresh tokens de l'utilisateur sont revoques.

### 4.6 Temps reel (WebSocket)

Le module `notifications` expose un WebSocket Gateway Socket.IO sur le namespace `/notifications`.

**Connexion :** Le client envoie le JWT dans `socket.handshake.auth.token`. Le gateway le verifie et ajoute le socket a la salle `user_<userId>`.

**Evenements emis au client :**

- `newNotification` : Emis quand une nouvelle notification est creee pour l'utilisateur.
- `unreadCountUpdate` : Emis pour signaler que le compteur de non-lus a change.

**Utilisation cote frontend :** Le hook `useNotifications` etablit la connexion, ecoute ces evenements et met a jour le compteur de notifications en temps reel.

### 4.7 Integrations externes

**Cloudinary (stockage media)**

Le service `UploadService` centralise tous les uploads. Limites :
- Images de profil/logo : JPEG, PNG, GIF, WEBP, max 5 Mo, redimensionnees a 800x800px.
- Medias (experiences, formations) : images, videos (MP4, MPEG, MOV), PDFs, max 50 Mo.

Les fichiers sont ranges dans des dossiers Cloudinary de la forme `freelance-platform/<dossier>`.

**Nodemailer (emails transactionnels)**

Le `MailService` envoie deux types d'emails :
- Email de verification : lien vers `<FRONTEND_URL>/auth/verify-email?token=<token>`
- Email de reinitialisation de mot de passe : lien vers `<FRONTEND_URL>/auth/reset-password?token=<token>`

**Anthropic Claude (IA)**

Le `ClaudeClientService` est une abstraction du SDK Anthropic. Il expose une methode `generateCompletion(systemPrompt, userMessage, temperature, maxTokens)`.

Il est utilise par :
- `TestService` : pour generer les questions des tests plateforme et en evaluer les reponses.
- `CustomTestService` : pour generer et evaluer les tests personnalises clients. Si la cle API est absente ou invalide, un generateur de questions moquees (`mock-questions.generator.ts`) prend le relai.

---

## 5. Frontend (Next.js)

### 5.1 Structure des dossiers

```
frontend/
├── app/                        # App Router de Next.js
│   ├── layout.tsx              # Layout racine (balises html, body, Toaster)
│   ├── globals.css             # Styles globaux et variables CSS
│   ├── page.tsx                # Page d'accueil (landing page publique)
│   ├── auth/                   # Routes d'authentification
│   │   ├── login/
│   │   ├── register/           # /register/candidat et /register/client
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── verify-email/
│   │   └── verify-email-notice/
│   ├── candidat/               # Espace candidat (protege)
│   │   ├── dashboard/          # Tableau de bord principal
│   │   ├── onboarding/         # Creation du profil initial
│   │   ├── profile/            # Gestion du profil
│   │   ├── test/               # Tests techniques plateforme
│   │   ├── custom-test/        # Tests personnalises client
│   │   └── workspace/
│   │       └── [matchId]/      # Workspace specifique a un match
│   ├── client/                 # Espace client (protege)
│   │   ├── dashboard/          # Tableau de bord principal
│   │   ├── onboarding/         # Creation du profil entreprise
│   │   ├── profile/            # Gestion du profil
│   │   └── workspace/          # Vue workspace client
│   └── admin/                  # Espace administrateur (protege)
│       ├── page.tsx            # Tableau de bord admin
│       ├── layout.tsx          # Layout admin
│       ├── matches/            # Gestion des matches
│       ├── users/              # Gestion des utilisateurs
│       └── videos/             # Gestion des videos
├── components/
│   ├── dashboard/
│   │   ├── NotificationsTab.tsx          # Onglet notifications partage
│   │   ├── candidate/                    # Composants dashboard candidat
│   │   │   ├── AideTab.tsx
│   │   │   ├── CustomTestTab.tsx
│   │   │   ├── HistoriqueTab.tsx
│   │   │   ├── MatchesTab.tsx
│   │   │   ├── NotificationsTab.tsx
│   │   │   ├── OffresTab.tsx
│   │   │   ├── ProfilTab.tsx
│   │   │   └── TechniqueTab.tsx
│   │   └── client/                       # Composants dashboard client
│   │       ├── CandidaturesTab.tsx
│   │       ├── ClientOfferFormModal.tsx
│   │       ├── ClientOffresTab.tsx
│   │       ├── ClientProfilTab.tsx
│   │       ├── MatchesTab.tsx
│   │       ├── SourcingTab.tsx
│   │       └── ValidationPostMatchTab.tsx
│   ├── workspace/
│   │   ├── BlankWorkspacePage.tsx        # Page vide quand aucun workspace actif
│   │   ├── candidate/                    # Composants workspace candidat
│   │   │   ├── WorkspaceHome.tsx
│   │   │   ├── WorkspaceTimeTracking.tsx
│   │   │   ├── WorkspaceContrats.tsx
│   │   │   ├── WorkspaceFactures.tsx
│   │   │   └── timer/
│   │   └── client/                       # Composants workspace client
│   │       ├── WorkspaceClientHome.tsx
│   │       ├── WorkspaceClientTimeTracking.tsx
│   │       ├── WorkspaceClientNotes.tsx
│   │       ├── WorkspaceClientFactures.tsx
│   │       └── WorkspaceCollaborateurs.tsx
│   ├── layout/
│   │   ├── Navbar.tsx                    # Navbar publique (landing)
│   │   ├── AdminSidebar.tsx
│   │   ├── CandidatSidebar.tsx
│   │   └── ClientSidebar.tsx
│   ├── test/
│   │   ├── CodeEditor.tsx                # Editeur de code (Monaco)
│   │   ├── QuestionCard.tsx              # Carte de question de test
│   │   ├── TestStepper.tsx               # Indicateur de progression
│   │   └── Timer.tsx                     # Chronometre de test
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── CountrySelect.tsx
│       ├── FadeIn.tsx                    # Animation d'apparition
│       ├── FileUpload.tsx
│       ├── Input.tsx
│       ├── Logo.tsx
│       ├── Modal.tsx
│       ├── Select.tsx
│       ├── SkillSelector.tsx             # Selecteur de competences avec recherche
│       └── Textarea.tsx
├── hooks/
│   └── useNotifications.ts              # Hook WebSocket pour les notifications
├── lib/
│   ├── api.ts                           # Client Axios configure avec intercepteurs
│   ├── auth-service.ts                  # Gestion des tokens et helpers auth
│   ├── admin-service.ts
│   ├── candidate-service.ts
│   ├── candidature-service.ts
│   ├── client-service.ts
│   ├── custom-test-service.ts
│   ├── job-offer-service.ts
│   ├── match-service.ts
│   ├── notification-service.ts
│   ├── skill-service.ts
│   ├── test-service.ts
│   ├── timesheet-service.ts
│   └── video-service.ts
├── public/
│   └── logo.webp
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

### 5.2 Configuration et variables d'environnement

Le fichier `.env.local` a la racine du dossier `frontend/` :

```env
# URL de l'API backend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5.3 Routes et pages

#### Pages publiques

| Route | Description |
|---|---|
| `/` | Landing page : hero, comment ca marche, stats, CTA |
| `/auth/login` | Page de connexion |
| `/auth/register` | Page d'inscription (choix du role) |
| `/auth/forgot-password` | Demande de reinitialisation du mot de passe |
| `/auth/reset-password` | Formulaire de reinitialisation (token en query param) |
| `/auth/verify-email` | Verification de l'email (token en query param) |
| `/auth/verify-email-notice` | Page intermediaire apres inscription |

#### Espace Candidat (`/candidat/`)

| Route | Description |
|---|---|
| `/candidat/dashboard` | Tableau de bord principal avec onglets |
| `/candidat/onboarding` | Creation du profil initial (etapes guidees) |
| `/candidat/profile` | Gestion du profil |
| `/candidat/test` | Prise d'un test technique plateforme |
| `/candidat/custom-test` | Passage d'un test personnalise client |
| `/candidat/workspace/[matchId]` | Workspace dedie a un match specifique |

**Onglets du dashboard candidat :**

- `OffresTab` : Consultation des offres d'emploi disponibles, filtres par specialite et type de travail, bouton de candidature.
- `MatchesTab` : Liste des matches recus ou proposes, avec statut et actions (accepter/refuser).
- `TechniqueTab` : Affichage du score du dernier test technique, bouton pour passer un nouveau test.
- `CustomTestTab` : Suivi des tests personnalises assigns par les clients.
- `HistoriqueTab` : Chronologie des actions (candidatures, tests, scores).
- `NotificationsTab` : Toutes les notifications de l'utilisateur.
- `ProfilTab` : Formulaire complet de gestion du profil (informations, experiences, formations, competences, photo).
- `AideTab` : Section d'aide et support.

**Onglets du workspace candidat (`WorkspaceHome`) :**

- `Overview` : Resume de la mission, progression, journal d'activite, indicateur de charge.
- `Time Tracking` : Chronometre avec start/pause/stop, calendrier journalier des sessions, graphique hebdomadaire.
- `Contrats` : (en cours d'implementation)
- `Factures` : (en cours d'implementation)

#### Espace Client (`/client/`)

| Route | Description |
|---|---|
| `/client/dashboard` | Tableau de bord principal avec onglets |
| `/client/onboarding` | Creation du profil entreprise |
| `/client/profile` | Gestion du profil entreprise |
| `/client/workspace` | Vue workspace client |

**Onglets du dashboard client :**

- `ClientOffresTab` : Gestion de ses offres d'emploi (creer, modifier, publier, fermer).
- `CandidaturesTab` : Gestion des candidatures recues par offre.
- `SourcingTab` : Recherche et sourcing direct de candidats.
- `MatchesTab` : Gestion des matches en cours.
- `ValidationPostMatchTab` : Validation apres match confirme (custom test, Calendly, workspace).
- `ClientProfilTab` : Gestion du profil entreprise.
- `NotificationsTab` : Notifications en temps reel.

**Onglets du workspace client :**

- `WorkspaceClientHome` : Vue d'ensemble de la mission.
- `WorkspaceClientTimeTracking` : Suivi du temps des collaborateurs, graphiques, rapport par semaine et par collaborateur.
- `WorkspaceCollaborateurs` : Gestion des collaborateurs du workspace.
- `WorkspaceClientNotes` : (en cours d'implementation)
- `WorkspaceClientFactures` : (en cours d'implementation)

#### Espace Admin (`/admin/`)

| Route | Description |
|---|---|
| `/admin` | Tableau de bord : stats globales, utilisateurs recents, offres recentes |
| `/admin/matches` | Liste et gestion de tous les matches |
| `/admin/users` | Liste et gestion de tous les utilisateurs |
| `/admin/videos` | Gestion des videos de la plateforme |

### 5.4 Composants

#### Composants UI (`components/ui/`)

| Composant | Description |
|---|---|
| `Button` | Bouton polymorphique (variants: `gradient`, `ghost`, `outline`, `danger`; tailles: `sm`, `md`, `lg`) |
| `Input` | Champ de saisie stylee avec label et message d'erreur |
| `Textarea` | Zone de texte multi-lignes |
| `Select` | Menu deroulant stylee |
| `Modal` | Dialog modal avec fond opaque et animation |
| `Badge` | Badge de statut colore |
| `FadeIn` | Wrapper d'animation d'apparition (CSS transition) avec prop `delay` |
| `FileUpload` | Zone de depot de fichier (drag & drop) |
| `CountrySelect` | Selecteur de pays avec drapeaux |
| `SkillSelector` | Selecteur de competences avec recherche et creation de competences personnalisees |
| `Logo` | Composant logo OPSIDE |

#### Composants Layout (`components/layout/`)

| Composant | Description |
|---|---|
| `Navbar` | Barre de navigation de la landing page avec liens et boutons d'action |
| `CandidatSidebar` | Barre laterale de l'espace candidat avec navigation par onglets et compteur de notifications |
| `ClientSidebar` | Barre laterale de l'espace client |
| `AdminSidebar` | Barre laterale de l'espace administrateur |

#### Composants Test (`components/test/`)

| Composant | Description |
|---|---|
| `Timer` | Chronometre degressif affichant le temps restant |
| `TestStepper` | Indicateur de progression (question X sur N) |
| `QuestionCard` | Carte affichant une question avec les choix de reponse |
| `CodeEditor` | Editeur Monaco (Monaco Editor) pour les questions de code |

### 5.5 Services et couche API

La couche `lib/` isole toute la logique d'appel API.

**`api.ts` - Client Axios central**

Instance Axios configuree avec `baseURL = NEXT_PUBLIC_API_URL`. Deux intercepteurs :
1. **Intercepteur de requete** : Ajoute automatiquement le header `Authorization: Bearer <access_token>` en recuperant le token depuis `localStorage`.
2. **Intercepteur de reponse** : Gere les erreurs 401. Tente automatiquement un rafraichissement du token (`/auth/refresh`). Si le rafraichissement echoue, `clearAuth()` est appele et l'utilisateur est redirige vers `/auth/login`. Un systeme de file d'attente (`failedQueue`) evite les races conditions lorsque plusieurs requetes echouent simultanement.

**`auth-service.ts`**

Fonctions utilitaires pour la gestion de session :
- `getToken()`, `getRefreshToken()` : Lecture depuis `localStorage`.
- `setTokens(access, refresh)` : Ecriture dans `localStorage` ET dans les cookies (`js-cookie`).
- `setUser(user)`, `getUser()` : Serialisation/deserialisation de l'utilisateur en `localStorage`.
- `clearAuth()` : Suppression de toutes les donnees de session (localStorage + cookies).
- `isAuthenticated()` : Verifie la presence du token.
- `getDashboardByRole(role)` : Retourne le chemin du dashboard en fonction du role.

**Services metier (`lib/*.service.ts`)**

Chaque service correspond a un module backend et expose des fonctions typees :

| Service | Fonctions principales |
|---|---|
| `candidate-service` | `getMyProfile`, `updateProfile`, `uploadPhoto`, `createExperience`, `updateExperience`, `createEducation`, `updateEducation`, `uploadMedia`, `getHistory` |
| `client-service` | `getMyProfile`, `updateProfile`, `uploadLogo`, `getAllCandidates` |
| `job-offer-service` | `createJobOffer`, `getJobOffersForCandidate`, `getJobOffersForClient`, `updateJobOffer`, `deleteJobOffer` |
| `candidature-service` | `applyToJob`, `getCandidatures`, `updateCandidatureStatus` |
| `match-service` | `sourceCandidate`, `respondToMatch`, `getMatchesForCandidate`, `getMatchesForClient`, `addToWorkspace`, `endContract` |
| `test-service` | `startTest`, `submitTest`, `getTestResult`, `getLatestScore` |
| `custom-test-service` | `createCustomTest`, `submitCustomTest`, `getTestForCandidate`, `getTestsForClient` |
| `notification-service` | `getNotifications`, `getUnreadCount`, `markAsRead`, `markAllAsRead`, `deleteNotification` |
| `timesheet-service` | `startTimer`, `pauseTimer`, `resumeTimer`, `stopTimer`, `getActiveTimer`, `getEntries`, `createEntry`, `updateEntry`, `deleteEntry`, `getReport` |
| `skill-service` | `getSkills`, `createSkill`, `updateSkill`, `deleteSkill` |
| `video-service` | `getVideos`, `createVideo`, `updateVideo`, `deleteVideo` |
| `admin-service` | Fonctions d'administration (utilisateurs, stats) |

### 5.6 Hooks personnalises

**`useNotifications` (`hooks/useNotifications.ts`)**

Etablit une connexion WebSocket Socket.IO vers le namespace `/notifications` du backend. Authentifie la connexion en passant le JWT dans `socket.handshake.auth.token`. Ecoute les evenements `newNotification` et `unreadCountUpdate` pour maintenir le compteur de notifications a jour en temps reel. Gere le nettoyage de la connexion au demontage du composant.

```typescript
const { unreadCount, fetchUnreadCount } = useNotifications();
```

---

## 6. Flux metier principaux

### Inscription et onboarding

1. L'utilisateur visite la landing page et clique sur "Je suis une entreprise" ou "Je suis un candidat".
2. Il remplit le formulaire d'inscription (`/auth/register`). Son compte est cree avec le statut `pending`.
3. Il recoit un email de verification et est redirige vers `/auth/verify-email-notice`.
4. En cliquant sur le lien dans l'email, il arrive sur `/auth/verify-email`. Son compte passe a `active` et des tokens JWT lui sont delivres.
5. Il est redirige vers son dashboard. S'il n'a pas encore cree son profil, il est guide vers la page d'onboarding (`/candidat/onboarding` ou `/client/onboarding`).

### Flux de candidature (candidat -> offre)

1. Le candidat consulte les offres dans l'onglet `OffresTab`.
2. Il postule via `POST /candidatures`.
3. La candidature apparait dans `CandidaturesTab` du dashboard client avec le statut `pending`.
4. Le client peut accepter (`matched`) ou rejeter (`rejected`) la candidature.
5. Si acceptee, un `Match` est cree automatiquement avec le statut `pending_candidate`.

### Flux de sourcing (client -> candidat)

1. Le client parcourt les profils dans l'onglet `SourcingTab`.
2. Il envoie une invitation via `POST /matches/source`.
3. Le candidat recoit une notification et voit le match dans `MatchesTab` avec le statut `pending_candidate`.
4. Le candidat accepte ou refuse.
5. Si accepte, le statut passe a `pending_client`.
6. Le client confirme, le statut passe a `confirmed`.

### Flux post-match (test personnalise et workspace)

1. Apres confirmation du match, le client accede a `ValidationPostMatchTab`.
2. Le client peut creer un test personnalise (`POST /custom-test`). Questions generees par Claude AI.
3. Le candidat est notifie, passe le test dans `/candidat/custom-test`.
4. Le client voit les resultats. S'il est satisfait, il ajoute le candidat au workspace (`PATCH /matches/:id/add-to-workspace`).
5. Le statut du match passe a `in_workspace`.
6. Les deux parties accedent au workspace dedie au match.

### Suivi du temps

1. Le candidat dans son workspace (`WorkspaceTimeTracking`) peut demarrer le chronometre via `POST /timesheets/timer/start`.
2. Il peut le mettre en pause (`POST /timesheets/timer/pause`) et reprendre (`POST /timesheets/timer/resume`).
3. A l'arret (`POST /timesheets/timer/stop`), la session est sauvegardee avec la duree exacte (pause incluse).
4. Le client peut visualiser les sessions de ses collaborateurs dans `WorkspaceClientTimeTracking` avec des graphiques recharts (bar charts) par semaine et par collaborateur.

---

## 7. Guide de demarrage

**Demarrage du backend (developpement) :**

```bash
cd backend
npm run start:dev
# Serveur accessible sur http://localhost:3001
```

**Demarrage du frontend (developpement) :**

```bash
cd frontend
pnpm dev
# Application accessible sur http://localhost:3000
```

**Migration de la base de donnees :**

```bash
cd backend
# Creer une nouvelle migration apres modification du schema
npx prisma migrate dev --name nom_de_la_migration
# Appliquer les migrations en production
npx prisma migrate deploy
# Ouvrir Prisma Studio (interface visuelle de la BDD)
npx prisma studio
```

---