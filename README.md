# OPSIDE — Documentation Technique

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture backend](#2-architecture-backend)
3. [Architecture frontend](#3-architecture-frontend)
4. [Schéma base de données PostgreSQL](#4-schéma-base-de-données-postgresql)
5. [Structure des dossiers](#5-structure-des-dossiers)
6. [Conventions de nommage & coding style](#6-conventions-de-nommage--coding-style)
7. [Roadmap par Drop](#7-roadmap-par-drop)

---

## 1. Vue d'ensemble

OPSIDE est une marketplace B2B qui met en relation des développeurs freelance (rôle **A**) avec des clients entreprises (rôle **B**), pilotée par un admin (rôle **C**).

### Stack technique

| Couche | Technologie |
|---|---|
| Backend | Node.js + NestJS |
| Frontend | React + Next.js + TypeScript |
| Base de données | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (access 15min / refresh 7j) |
| IA | API Claude (Anthropic) — `claude-sonnet-4-20250514` |
| Stockage fichiers | AWS S3 |
| Emails | NodeMailer / SendGrid |
| Paiements (Drop 3) | Stripe |
| Signature (Drop 2) | SignFlow |

### Rôles utilisateurs

| Rôle | Label | Création |
|---|---|---|
| A | Candidat (développeur) | Inscription publique |
| B | Client (entreprise) | Inscription publique |
| C | Admin OPSIDE | Manuel en BDD / seed |

---

## 2. Architecture backend

### Organisation des modules (NestJS)

```
src/
├── auth/                  # Inscription, login, JWT, refresh
├── users/                 # Gestion des comptes utilisateurs
├── profiles/
│   ├── candidate/         # Profil candidat (A)
│   └── client/            # Profil client (B)
├── skills/                # Référentiel de compétences (seedé)
├── tests/                 # Tests techniques IA
├── jobs/                  # Offres d'emploi
├── applications/          # Candidatures
├── matches/               # Matching double opt-in
├── notifications/         # Notifications in-app + email
├── timesheets/            # Suivi du temps
├── workspace/             # Workspace post-placement
├── contracts/             # Contrats (Drop 2)
├── invoices/              # Facturation (Drop 3)
├── admin/                 # Dashboard admin (C)
├── ai/                    # Service d'appel à l'API Claude
├── storage/               # Upload S3
└── common/
    ├── guards/            # AuthGuard, RolesGuard
    ├── decorators/        # @Roles(), @CurrentUser()
    ├── filters/           # Exception filters
    ├── interceptors/      # Logging, transform response
    ├── pipes/             # Validation pipes
    └── utils/             # Helpers communs
```

### Couches par module

Chaque module suit la structure NestJS standard :

```
module/
├── module.module.ts
├── module.controller.ts   # Routes HTTP, décoration Swagger
├── module.service.ts      # Logique métier
├── module.repository.ts   # Accès BDD via Prisma
├── dto/
│   ├── create-x.dto.ts
│   └── update-x.dto.ts
└── entities/
    └── x.entity.ts
```

### Middlewares & Guards

| Middleware / Guard | Rôle |
|---|---|
| `JwtAuthGuard` | Vérifie le token JWT sur toutes les routes protégées |
| `RolesGuard` | Restreint l'accès selon le rôle (A / B / C) |
| `ThrottlerGuard` | Rate limiting global |
| `LoggingInterceptor` | Log de chaque requête entrante |
| `TransformInterceptor` | Standardise le format de réponse `{ data, meta }` |
| `HttpExceptionFilter` | Gestion uniforme des erreurs HTTP |

### Service IA (`ai.service.ts`)

Le service IA encapsule tous les appels à l'API Claude :

- `generateTest(params)` — génère 10 questions en JSON à partir des technos et du niveau
- `evaluateAnswers(params)` — score les réponses du candidat
- Variables d'environnement requises :

```env
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-sonnet-4-20250514
AI_MAX_TOKENS_GENERATION=4096
AI_MAX_TOKENS_EVALUATION=2048
AI_TEMPERATURE_GENERATION=0.7
AI_TEMPERATURE_EVALUATION=0.2
TEST_RETRY_LIMIT=3
```

> **Règle de sécurité :** Les réponses correctes aux questions ne sont JAMAIS renvoyées au frontend.

---

## 3. Architecture frontend

### Pages par rôle

#### Candidat (A)

| Route | Page | Drop |
|---|---|---|
| `/register` | Inscription | 1 |
| `/login` | Connexion | 1 |
| `/profile/edit` | Compléter son profil | 1 |
| `/test` | Passer le test technique IA | 1 |
| `/jobs` | Voir les offres anonymes | 1 |
| `/applications` | Mes candidatures | 1 |
| `/matches` | Mes matchs | 1 |
| `/workspace` | Dashboard post-placement | 1 |
| `/workspace/timesheets` | Logger ses heures | 1 |
| `/workspace/contracts` | Voir ses contrats | 2 |
| `/workspace/invoices` | Voir ses factures | 3 |

#### Client (B)

| Route | Page | Drop |
|---|---|---|
| `/register` | Inscription | 1 |
| `/login` | Connexion | 1 |
| `/profile/edit` | Profil entreprise | 1 |
| `/candidates` | Parcourir les profils anonymisés | 1 |
| `/jobs/new` | Poster une offre | 1 |
| `/jobs/:id/applications` | Voir les candidatures | 1 |
| `/matches` | Mes matchs | 1 |
| `/workspace` | Dashboard collaborateurs | 1 |
| `/workspace/timesheets` | Approuver les timesheets | 1 |
| `/workspace/contracts` | Voir les contrats | 2 |
| `/workspace/invoices` | Factures & paiement | 3 |

#### Admin (C)

| Route | Page | Drop |
|---|---|---|
| `/admin/dashboard` | Stats globales | 1 |
| `/admin/users` | Gestion utilisateurs | 1 |
| `/admin/matches` | Supervision matchs | 1 |
| `/admin/contracts` | Générer les contrats | 2 |
| `/admin/invoices` | Lancer la facturation (cron) | 3 |

### Services API (frontend)

```
services/
├── auth.service.ts          # register, login, logout, refresh
├── profile.service.ts       # getMe, updateProfile, uploadPhoto
├── test.service.ts          # startTest, submitAnswers, getResults
├── jobs.service.ts          # listJobs, createJob, applyToJob
├── matches.service.ts       # listMatches, accept, reject
├── timesheets.service.ts    # logHours, listTimesheets, approve
├── notifications.service.ts # listNotifications, markAsRead
├── contracts.service.ts     # listContracts, sign (Drop 2)
└── invoices.service.ts      # listInvoices, pay (Drop 3)
```

Tous les services utilisent une instance Axios centralisée avec :
- Injection automatique du header `Authorization: Bearer <token>`
- Intercepteur de refresh token automatique (401 → refresh → retry)
- Gestion centralisée des erreurs

### Routing & protection

Le routing utilise **Next.js App Router**. Les routes protégées sont wrappées par un composant `<ProtectedRoute role="A|B|C">` qui redirige vers `/login` si l'utilisateur n'est pas authentifié ou n'a pas le bon rôle.

---

## 4. Schéma base de données PostgreSQL

### Vue d'ensemble des tables

```
users
  └─< candidate_profiles
  └─< client_profiles
  └─< candidate_profiles >─< candidate_skills >─ skills
  └─< tests
        └─< test_skills >─ skills
  └─< job_offers
        └─< job_offer_skills >─ skills
        └─< applications
  └─< matches
        └─< contracts (Drop 2)
  └─< timesheets
  └─< notifications
  └─< invoices (Drop 3)
```

---

### Table : `users`

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(10) NOT NULL CHECK (role IN ('A', 'B', 'C')),
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### Table : `candidate_profiles`

```sql
CREATE TABLE candidate_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone               VARCHAR(30),
  country             VARCHAR(100) NOT NULL,
  city                VARCHAR(100),
  bio                 TEXT CHECK (char_length(bio) <= 500),
  speciality          VARCHAR(20) NOT NULL
                      CHECK (speciality IN ('frontend','backend','fullstack','mobile','devops','data')),
  experience_years    INTEGER NOT NULL CHECK (experience_years >= 0),
  daily_rate          NUMERIC(10,2) NOT NULL,
  currency            VARCHAR(5) NOT NULL
                      CHECK (currency IN ('MGA','XOF','XAF','MAD','TND','EUR','USD')),
  availability        VARCHAR(20) NOT NULL
                      CHECK (availability IN ('immediate','1_week','2_weeks','1_month','unavailable')),
  status              VARCHAR(20) NOT NULL DEFAULT 'open_to_work'
                      CHECK (status IN ('open_to_work','in_mission','part_time')),
  linkedin_url        VARCHAR(500),
  portfolio_url       VARCHAR(500),
  photo_url           VARCHAR(500),
  platform_score      INTEGER CHECK (platform_score BETWEEN 0 AND 100),
  profile_completed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### Table : `client_profiles`

```sql
CREATE TABLE client_profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name            VARCHAR(255) NOT NULL,
  company_size            VARCHAR(20) CHECK (company_size IN ('1-10','11-50','51-200','200+')),
  industry                VARCHAR(100),
  country                 VARCHAR(100) NOT NULL,
  city                    VARCHAR(100),
  contact_name            VARCHAR(200) NOT NULL,
  contact_email           VARCHAR(255) NOT NULL,
  contact_phone           VARCHAR(30),
  website                 VARCHAR(500),
  logo_url                VARCHAR(500),
  interview_availability  TEXT,
  nda_template_url        VARCHAR(500),   -- Drop 2
  contract_template_url   VARCHAR(500),   -- Drop 2
  created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### Table : `skills`

```sql
CREATE TABLE skills (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) UNIQUE NOT NULL,
  category  VARCHAR(20) NOT NULL
            CHECK (category IN ('frontend','backend','mobile','devops','data','design'))
);
-- Seedée au déploiement. Pas de CRUD au MVP.
```

---

### Table de jointure : `candidate_skills`

```sql
CREATE TABLE candidate_skills (
  candidate_profile_id  UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  skill_id              INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (candidate_profile_id, skill_id)
);
```

---

### Table : `tests`

```sql
CREATE TABLE tests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id          UUID NOT NULL REFERENCES users(id),
  type                  VARCHAR(20) NOT NULL CHECK (type IN ('platform', 'client')),
  speciality            VARCHAR(20) NOT NULL,
  difficulty            VARCHAR(10) NOT NULL CHECK (difficulty IN ('junior','mid','senior')),
  questions             JSONB NOT NULL,
  answers               JSONB,
  score                 INTEGER CHECK (score BETWEEN 0 AND 100),
  score_details         JSONB,
  duration_minutes      INTEGER NOT NULL DEFAULT 45,
  client_id             UUID REFERENCES users(id),        -- si type = 'client'
  match_id              UUID,                              -- si type = 'client'
  threshold             INTEGER DEFAULT 75,               -- si type = 'client'
  custom_instructions   TEXT,                             -- si type = 'client'
  status                VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','in_progress','submitted','scored','expired')),
  ai_model              VARCHAR(100),
  ai_generation_prompt  TEXT,
  ai_evaluation_prompt  TEXT,
  started_at            TIMESTAMP,
  submitted_at          TIMESTAMP,
  created_at            TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### Table : `test_skills`

```sql
CREATE TABLE test_skills (
  test_id   UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  skill_id  INTEGER NOT NULL REFERENCES skills(id),
  PRIMARY KEY (test_id, skill_id)
);
```

---

### Table : `job_offers`

```sql
CREATE TABLE job_offers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             UUID NOT NULL REFERENCES users(id),
  title                 VARCHAR(255) NOT NULL,
  description           TEXT NOT NULL,
  speciality            VARCHAR(20) NOT NULL,
  experience_min        INTEGER,
  tjm_client            NUMERIC(10,2) NOT NULL,
  contract_duration     VARCHAR(100),
  work_type             VARCHAR(20) NOT NULL CHECK (work_type IN ('full_remote','hybrid','on_site')),
  timezone_preference   VARCHAR(50),
  start_date            DATE,
  status                VARCHAR(20) NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','active','paused','closed')),
  is_anonymous          BOOLEAN NOT NULL DEFAULT TRUE,
  views_count           INTEGER NOT NULL DEFAULT 0,
  applications_count    INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### Table : `job_offer_skills`

```sql
CREATE TABLE job_offer_skills (
  job_offer_id  UUID NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
  skill_id      INTEGER NOT NULL REFERENCES skills(id),
  PRIMARY KEY (job_offer_id, skill_id)
);
```

---

### Table : `applications`

```sql
CREATE TABLE applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id  UUID NOT NULL REFERENCES users(id),
  job_offer_id  UUID NOT NULL REFERENCES job_offers(id),
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','matched','rejected','withdrawn')),
  message       TEXT,
  applied_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (candidate_id, job_offer_id)
);
```

---

### Table : `matches`

```sql
CREATE TABLE matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id  UUID NOT NULL REFERENCES users(id),
  client_id     UUID NOT NULL REFERENCES users(id),
  job_offer_id  UUID REFERENCES job_offers(id),
  status        VARCHAR(30) NOT NULL DEFAULT 'pending_candidate'
                CHECK (status IN ('pending_candidate','pending_client','confirmed','rejected')),
  initiated_by  VARCHAR(20) NOT NULL CHECK (initiated_by IN ('candidate','client')),
  matched_at    TIMESTAMP,
  rejected_at   TIMESTAMP,
  rejected_by   VARCHAR(20) CHECK (rejected_by IN ('candidate','client')),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### Table : `timesheets`

```sql
CREATE TABLE timesheets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id  UUID NOT NULL REFERENCES users(id),
  client_id     UUID NOT NULL REFERENCES users(id),
  contract_id   UUID,                           -- Drop 2
  date          DATE NOT NULL,
  hours         NUMERIC(4,1) NOT NULL
                CHECK (hours >= 0.5 AND hours <= 16),
  description   TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft','submitted','approved','rejected')),
  submitted_at  TIMESTAMP,
  approved_by   UUID REFERENCES users(id),
  approved_at   TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### Table : `notifications`

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL
              CHECK (type IN (
                'new_application','match_confirmed','match_rejected',
                'test_result','contract_ready','invoice','system'
              )),
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  link        VARCHAR(500),
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  email_sent  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### Table : `contracts` _(Drop 2)_

```sql
CREATE TABLE contracts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id          UUID NOT NULL REFERENCES matches(id),
  type              VARCHAR(10) NOT NULL CHECK (type IN ('B_C', 'C_A')),
  client_id         UUID NOT NULL REFERENCES users(id),
  candidate_id      UUID NOT NULL REFERENCES users(id),
  template_url      VARCHAR(500) NOT NULL,
  generated_url     VARCHAR(500),
  signed_url        VARCHAR(500),
  tjm               NUMERIC(10,2) NOT NULL,
  currency          VARCHAR(5) NOT NULL,
  start_date        DATE NOT NULL,
  end_date          DATE,
  status            VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','sent','signed','active','terminated')),
  signed_at         TIMESTAMP,
  terminated_at     TIMESTAMP,
  termination_reason TEXT,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### Table : `invoices` _(Drop 3)_

```sql
CREATE TABLE invoices (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id         UUID NOT NULL REFERENCES contracts(id),
  type                VARCHAR(20) NOT NULL CHECK (type IN ('client_invoice','dev_payment')),
  period_start        DATE NOT NULL,
  period_end          DATE NOT NULL,
  total_hours         NUMERIC(8,2),
  tjm                 NUMERIC(10,2),
  amount_gross        NUMERIC(12,2),
  margin_rate         NUMERIC(5,4) DEFAULT 0.50,
  margin_amount       NUMERIC(12,2),
  amount_net          NUMERIC(12,2),
  tax_amount          NUMERIC(12,2),
  currency            VARCHAR(5) NOT NULL,
  status              VARCHAR(20) NOT NULL DEFAULT 'generated'
                      CHECK (status IN ('generated','sent','paid','overdue')),
  pdf_url             VARCHAR(500),
  due_date            DATE,
  paid_at             TIMESTAMP,
  stripe_payment_id   VARCHAR(255),
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### Index recommandés

```sql
-- Performance sur les requêtes fréquentes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_candidate_profiles_user_id ON candidate_profiles(user_id);
CREATE INDEX idx_candidate_profiles_speciality ON candidate_profiles(speciality);
CREATE INDEX idx_candidate_profiles_availability ON candidate_profiles(availability);
CREATE INDEX idx_job_offers_client_id ON job_offers(client_id);
CREATE INDEX idx_job_offers_status ON job_offers(status);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_job_offer_id ON applications(job_offer_id);
CREATE INDEX idx_matches_candidate_id ON matches(candidate_id);
CREATE INDEX idx_matches_client_id ON matches(client_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_timesheets_candidate_id ON timesheets(candidate_id);
CREATE INDEX idx_timesheets_client_id ON timesheets(client_id);
CREATE INDEX idx_timesheets_status ON timesheets(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
```

---

## 5. Structure des dossiers

### Backend (NestJS)

```
backend/
├── src/
│   ├── auth/
│   ├── users/
│   ├── profiles/
│   │   ├── candidate/
│   │   └── client/
│   ├── skills/
│   ├── tests/
│   ├── jobs/
│   ├── applications/
│   ├── matches/
│   ├── notifications/
│   ├── timesheets/
│   ├── workspace/
│   ├── contracts/
│   ├── invoices/
│   ├── admin/
│   ├── ai/
│   ├── storage/
│   └── common/
│       ├── guards/
│       ├── decorators/
│       ├── filters/
│       ├── interceptors/
│       ├── pipes/
│       └── utils/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── test/
│   ├── unit/
│   └── e2e/
├── .env
├── .env.example
├── nest-cli.json
├── package.json
└── tsconfig.json
```

### Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (candidate)/
│   │   │   ├── profile/page.tsx
│   │   │   ├── test/page.tsx
│   │   │   ├── jobs/page.tsx
│   │   │   ├── applications/page.tsx
│   │   │   └── workspace/
│   │   ├── (client)/
│   │   │   ├── profile/page.tsx
│   │   │   ├── candidates/page.tsx
│   │   │   ├── jobs/
│   │   │   └── workspace/
│   │   └── (admin)/
│   │       └── dashboard/page.tsx
│   ├── components/
│   │   ├── ui/                     # Composants génériques (Button, Input, Modal…)
│   │   ├── auth/                   # LoginForm, RegisterForm
│   │   ├── profile/                # CandidateCard, ProfileForm, SkillsBadge
│   │   ├── test/                   # TestTimer, QuestionCard, ScoreDisplay
│   │   ├── jobs/                   # JobCard, JobForm, ApplicationsList
│   │   ├── matches/                # MatchCard, MatchActions
│   │   ├── timesheets/             # TimerWidget, TimesheetForm, TimesheetTable
│   │   ├── notifications/          # NotifBell, NotifList
│   │   └── layout/                 # Header, Sidebar, ProtectedRoute
│   ├── services/                   # Appels API (Axios)
│   ├── hooks/                      # Custom hooks React
│   ├── store/                      # Zustand (auth, notifications…)
│   ├── types/                      # Interfaces TypeScript globales
│   ├── utils/                      # Helpers (dates, formatters, validators)
│   └── constants/                  # Énumérations, valeurs fixes
├── public/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 6. Conventions de nommage & coding style

### Général

| Contexte | Convention | Exemple |
|---|---|---|
| Variables & fonctions | `camelCase` | `getUserById`, `isProfileComplete` |
| Classes & types TS | `PascalCase` | `CandidateProfile`, `CreateJobDto` |
| Fichiers backend | `kebab-case` | `candidate-profile.service.ts` |
| Fichiers frontend | `PascalCase` pour composants | `CandidateCard.tsx` |
| Tables BDD | `snake_case` (pluriel) | `candidate_profiles`, `job_offers` |
| Colonnes BDD | `snake_case` | `user_id`, `created_at` |
| Variables d'env | `SCREAMING_SNAKE_CASE` | `ANTHROPIC_API_KEY` |
| Constantes globales | `SCREAMING_SNAKE_CASE` | `MAX_SKILLS_PER_TEST = 3` |
| Branches Git | `type/description-courte` | `feat/test-ia`, `fix/auth-refresh` |

### API REST

- Ressources au pluriel : `/users`, `/jobs`, `/matches`
- Verbes HTTP pour les actions : `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- Actions spéciales avec suffixe : `POST /matches/:id/accept`, `POST /tests/submit`
- Réponse standard :

```json
{
  "data": { ... },
  "meta": { "page": 1, "total": 42 }
}
```

- Erreur standard :

```json
{
  "statusCode": 400,
  "message": "Validation error",
  "errors": ["email must be a valid email"]
}
```

### TypeScript

- Toujours typer les paramètres et retours de fonctions
- Préférer `interface` pour les types de données, `type` pour les unions
- Pas de `any` — utiliser `unknown` si le type est indéterminé
- Les DTOs utilisent `class-validator` pour la validation NestJS

### Base de données

- Toutes les PKs sont des `UUID` générés par PostgreSQL (`gen_random_uuid()`)
- Toutes les tables ont `created_at` (et `updated_at` si la table est mutable)
- Les colonnes `status` utilisent des `CHECK` constraints (pas d'ENUM PostgreSQL natif pour faciliter les migrations)
- Les FK ont `ON DELETE CASCADE` uniquement si la suppression en cascade est explicitement souhaitée

### Git

Commits au format **Conventional Commits** :

```
feat(tests): generate questions via Claude API
fix(auth): handle expired refresh token correctly
docs(readme): add database schema section
chore(deps): upgrade NestJS to v11
```

Types utilisés : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Sécurité

- Les `correct_answer` des questions de test ne sont **jamais** renvoyés au frontend
- Les profils candidats sont **anonymisés** pour les clients (prénom + initiale du nom) avant le match
- Les `API keys` ne sont **jamais** hardcodées — uniquement via variables d'environnement
- Les passwords sont hashés avec **bcrypt** (salt rounds : 12)

---

## 7. Roadmap par Drop

| Drop | Période | Fonctionnalités |
|---|---|---|
| **Drop 1 — MVP** | Juin 2026 | Auth, profils A/B, test IA plateforme, offres, matching, workspace basique, timesheets |
| **Drop 2** | Août 2026 | OAuth LinkedIn, test custom client, contrats + signature SignFlow, Calendly, workspace enrichi |
| **Drop 3** | Octobre 2026 | Facturation automatique, Stripe, payroll mensuel, cron jobs financiers |

### Endpoints par Drop

#### Drop 1 — MVP

| Méthode | Endpoint | Rôles |
|---|---|---|
| POST | `/auth/register` | A, B |
| POST | `/auth/login` | A, B, C |
| POST | `/auth/refresh` | — |
| POST | `/auth/logout` | — |
| GET | `/profiles/me` | A, B |
| PUT | `/profiles/me` | A, B |
| GET | `/profiles/candidates` | B, C |
| GET | `/profiles/candidates/:id` | B |
| POST | `/tests/start` | A |
| POST | `/tests/submit` | A |
| GET | `/tests/results/:id` | A, B, C |
| POST | `/jobs` | B |
| GET | `/jobs` | A |
| POST | `/jobs/:id/apply` | A |
| GET | `/jobs/:id/applications` | B |
| POST | `/matches/:id/accept` | A, B |
| POST | `/matches/:id/reject` | A, B |
| POST | `/timesheets` | A |
| GET | `/timesheets` | A, B |
| GET | `/notifications` | A, B, C |
| GET | `/admin/dashboard` | C |

#### Drop 2

| Méthode | Endpoint | Rôles |
|---|---|---|
| POST | `/auth/linkedin` | A |
| POST | `/tests/custom` | B |
| POST | `/contracts/generate` | C |
| POST | `/contracts/:id/sign` | A, B |
| GET | `/contracts` | A, B, C |
| POST | `/workspace/collaborators` | B |
| GET | `/workspace/collaborators` | B |
| POST | `/workspace/notes` | B |

#### Drop 3

| Méthode | Endpoint | Rôles |
|---|---|---|
| POST | `/invoices/generate` | C (cron) |
| GET | `/invoices` | A, B, C |
| POST | `/invoices/:id/pay` | B |
| POST | `/payroll/process` | C (cron) |
| PUT | `/timesheets/:id/approve` | B |
| DELETE | `/workspace/collaborators/:id` | B |

---

*Documentation maintenue dans ce repository. Toute modification de l'architecture ou du schéma BDD doit être reflétée ici avant merge sur `main`.*
