# OPSIDE - Documentation du Code Source

## Table des matieres

1. [Backend - Services metier](#1-backend---services-metier)
   - [AuthService](#11-authservice)
   - [CandidateService](#12-candidateservice)
   - [ClientService](#13-clientservice)
   - [JobOffersService](#14-joboffersservice)
   - [CandidaturesService](#15-candidaturesservice)
   - [MatchesService](#16-matchesservice)
   - [CustomTestService](#17-customtestservice)
   - [TestService](#18-testservice)
   - [TimesheetsService](#19-timesheetsservice)
   - [NotificationsService](#110-notificationsservice)
   - [NotificationsGateway](#111-notificationsgateway)
   - [SkillsService](#112-skillsservice)
   - [UploadService](#113-uploadservice)
   - [ClaudeClientService](#114-claudeclientservice)
   - [MailService](#115-mailservice)
   - [UsersService](#116-usersservice)
   - [VideosService](#117-videosservice)
   - [PrismaService](#118-prismaservice)
2. [Backend - Guards et Decorateurs](#2-backend---guards-et-decorateurs)
   - [JwtAuthGuard](#21-jwtauthguard)
   - [JwtRefreshGuard](#22-jwtrefreshguard)
   - [RolesGuard](#23-rolesguard)
   - [CurrentUser](#24-currentuser)
   - [Roles](#25-roles)
   - [AllExceptionsFilter](#26-allexceptionsfilter)
3. [Frontend - Couche API (lib/)](#3-frontend---couche-api-lib)
   - [api.ts](#31-apits)
   - [auth-service.ts](#32-auth-servicets)
   - [candidate-service.ts](#33-candidate-servicets)
   - [client-service.ts](#34-client-servicets)
   - [job-offer-service.ts](#35-job-offer-servicets)
   - [candidature-service.ts](#36-candidature-servicets)
   - [match-service.ts](#37-match-servicets)
   - [test-service.ts](#38-test-servicets)
   - [custom-test-service.ts](#39-custom-test-servicets)
   - [timesheet-service.ts](#310-timesheet-servicets)
   - [notification-service.ts](#311-notification-servicets)
   - [skill-service.ts](#312-skill-servicets)
   - [video-service.ts](#313-video-servicets)
   - [admin-service.ts](#314-admin-servicets)
4. [Frontend - Hooks](#4-frontend---hooks)
   - [useNotifications](#41-usenotifications)
5. [Frontend - Composants UI](#5-frontend---composants-ui)
   - [Button](#51-button)
   - [Input / Textarea / Select](#52-input--textarea--select)
   - [Modal](#53-modal)
   - [FadeIn](#54-fadein)
   - [Badge](#55-badge)
   - [SkillSelector](#56-skillselector)
   - [FileUpload](#57-fileupload)
   - [CountrySelect](#58-countryselect)
6. [Frontend - Composants Test](#6-frontend---composants-test)
7. [Frontend - Composants Dashboard Candidat](#7-frontend---composants-dashboard-candidat)
8. [Frontend - Composants Dashboard Client](#8-frontend---composants-dashboard-client)
9. [Frontend - Composants Workspace Candidat](#9-frontend---composants-workspace-candidat)
10. [Frontend - Composants Workspace Client](#10-frontend---composants-workspace-client)
11. [Conventions de code](#11-conventions-de-code)

---

## 1. Backend - Services metier

Les services NestJS contiennent toute la logique metier. Chaque service est injectable via le systeme de DI de NestJS.

---

### 1.1 AuthService

**Fichier :** `backend/src/auth/auth.service.ts`

Service responsable de toute la logique d'authentification.

**Dependances injectees :**
- `PrismaService` - acces base de donnees
- `JwtService` - generation et verification des JWT
- `ConfigService` - lecture des variables d'environnement
- `MailService` - envoi des emails transactionnels

**Methodes publiques :**

```
register(dto: RegisterDto): Promise<{ message, user }>
```
Inscription d'un nouvel utilisateur. Le role `admin` est interdit par cette voie. Hache le mot de passe avec bcrypt (10 rounds), cree un token de verification aleatoire (`crypto.randomBytes(32)`), cree le compte avec le statut `pending` et envoie l'email de verification. Ne peut pas creer de compte admin.

```
login(dto: LoginDto): Promise<{ message, user, access_token, refresh_token }>
```
Authentification. Verifie que le compte existe, que son statut est `active` (bloque si `pending`), compare le mot de passe avec bcrypt, puis genere une paire de tokens JWT (access + refresh).

```
verifyEmail(token: string): Promise<{ message, user, access_token, refresh_token }>
```
Active le compte utilisateur en passant son statut de `pending` a `active`, efface le token de verification et delivre immediatement une paire de tokens JWT.

```
forgotPassword(dto: ForgotPasswordDto): Promise<{ message }>
```
Genere un token de reinitialisation valable 1 heure et envoie l'email. Repond toujours avec le meme message neutre (evite l'enumeration de comptes).

```
resetPassword(dto: ResetPasswordDto): Promise<{ message }>
```
Verifie que le token est valide et non expire, hache le nouveau mot de passe, efface le token de reinitialisation et revoque tous les refresh tokens de l'utilisateur (`logoutAll`).

```
refreshTokens(userId, email, role, oldRefreshToken): Promise<{ message, access_token, refresh_token }>
```
Revoque l'ancien refresh token (`is_revoked = true`) et genere une nouvelle paire. Mecanisme de rotation des tokens.

```
logout(userId, refreshToken): Promise<{ message }>
```
Revoque uniquement le refresh token specifie (deconnexion sur un seul appareil).

```
logoutAll(userId): Promise<{ message }>
```
Revoque tous les refresh tokens de l'utilisateur (deconnexion de tous les appareils).

```
me(userId): Promise<User>
```
Retourne les donnees de l'utilisateur connecte avec ses profils candidat/client partiels (id, company_name, logo_url, photo_url, profile_completed).

**Methode privee :**

```
generateTokens(userId, email, role): Promise<{ access_token, refresh_token }>
```
Signe en parallele un access token (15 min, `JWT_ACCESS_SECRET`) et un refresh token (7 jours, `JWT_REFRESH_SECRET`), puis persiste le refresh token en base de donnees.

---

### 1.2 CandidateService

**Fichier :** `backend/src/candidate/candidate.service.ts`

Service de gestion des profils candidats, experiences, formations et medias associes.

**Dependances injectees :**
- `PrismaService`
- `UploadService`

**Methodes publiques :**

```
createProfile(userId, dto: CreateCandidateProfileDto): Promise<{ message, profile }>
```
Cree le profil candidat. Verifie que l'utilisateur a bien le role `candidat`, qu'aucun profil n'existe deja, que les `skill_ids` fournis sont valides. Detecte automatiquement si le profil est complet (`profile_completed`) en verifiant la presence des champs obligatoires. Mappe automatiquement la devise (`currency`) en fonction du pays via `mapCountryToCurrency`.

```
getMyProfile(userId): Promise<CandidateProfile>
```
Recupere le profil complet du candidat connecte avec toutes ses relations : competences, experiences (triees par `is_current` desc puis `start_year` desc), formations (meme tri), medias et competences associes.

```
getProfileById(profileId): Promise<CandidateProfile>
```
Recupere un profil par son ID (`CandidateProfile.id`, pas `user_id`). Meme structure de donnees que `getMyProfile`. Accessible aux candidats, clients et admins.

```
findAllProfiles(): Promise<CandidateProfile[]>
```
Retourne tous les profils dont `profile_completed = true`. Les donnees retournees sont volontairement reduites (pas de photo_url, pas de donnees personnelles) pour la vue de sourcing.

```
getAppliedJobIds(candidateId): Promise<string[]>
```
Retourne uniquement les `job_offer_id` des candidatures du candidat. Utilise pour marquer les offres deja postulees dans l'interface.

```
updateProfile(userId, dto: UpdateCandidateProfileDto): Promise<{ message, profile }>
```
Met a jour le profil. Si `skill_ids` est fourni, supprime d'abord toutes les competences existantes (via `deleteMany`) puis relie les nouvelles. Gere la mise a jour partielle (champs non fournis = non modifies).

```
uploadPhoto(userId, file: Express.Multer.File): Promise<{ message, photo_url }>
```
Delegue l'upload a `UploadService.uploadImage` (dossier `candidates/photos`), puis met a jour `photo_url` dans le profil.

```
deletePhoto(userId): Promise<{ message }>
```
Met `photo_url` a `null`. Ne supprime pas le fichier Cloudinary (orphelin volontaire pour performance).

```
createExperience(userId, dto: CreateExperienceDto): Promise<{ message, experience }>
```
Cree une experience liee au `CandidateProfile.id` du candidat. Valide les `skill_ids` et cree les relations `ExperienceSkill`.

```
getExperiences(userId): Promise<Experience[]>
```
Retourne toutes les experiences du candidat triees par `is_current` desc puis par date.

```
updateExperience(userId, experienceId, dto): Promise<{ message, experience }>
```
Met a jour une experience. Si `skill_ids` est fourni, supprime d'abord les competences existantes de l'experience.

```
deleteExperience(userId, experienceId): Promise<{ message }>
```
Supprime une experience (cascade sur `ExperienceSkill` et `ExperienceMedia` via Prisma).

```
uploadExperienceMedia(userId, experienceId, file): Promise<{ message, media }>
```
Upload un media (image, video, PDF) via `UploadService.uploadMedia` (dossier `candidates/experience-media`) et cree l'enregistrement `ExperienceMedia`.

```
deleteExperienceMedia(userId, experienceId, mediaId): Promise<{ message }>
```
Supprime le media de Cloudinary via `UploadService.deleteFile` puis supprime l'enregistrement en base.

```
createEducation / getEducations / updateEducation / deleteEducation / uploadEducationMedia / deleteEducationMedia
```
Memes logiques que les methodes d'experience, appliquees au modele `Education`.

```
getHistory(userId): Promise<History[]>
```
Methode complexe : recupere en parallele toutes les candidatures et tous les custom tests du candidat, puis les synchronise avec la table `History` (cree les entrees manquantes, met a jour les entrees dont le statut/resultat a change). Retourne l'historique trie par date decroissante.

```
deleteHistoryItem(userId, itemId): Promise<{ message }>
```
Soft-delete d'un element d'historique (`is_deleted = true`).

**Methode privee :**

```
mapCountryToCurrency(country: Country): Currency
```
Table de correspondance pays -> devise locale (ex: `madagascar` -> `MGA`, `senegal` -> `XOF`).

---

### 1.3 ClientService

**Fichier :** `backend/src/client/client.service.ts`

Service de gestion des profils clients (entreprises).

**Methodes publiques :**

```
createProfile(userId, dto: CreateClientProfileDto): Promise<ClientProfile>
```
Cree le profil entreprise. Verifie l'unicite (un seul profil par utilisateur).

```
getMyProfile(userId): Promise<ClientProfile>
```
Recupere le profil complet de l'entreprise connectee.

```
getProfileById(profileId): Promise<ClientProfile>
```
Recupere un profil entreprise par son ID.

```
updateProfile(userId, dto: UpdateClientProfileDto): Promise<ClientProfile>
```
Met a jour le profil entreprise.

```
uploadLogo(userId, file: Express.Multer.File): Promise<{ message, logo_url }>
```
Upload le logo de l'entreprise via Cloudinary (dossier `clients/logos`) et met a jour `logo_url` et `logo_public_id`.

---

### 1.4 JobOffersService

**Fichier :** `backend/src/job-offers/job-offers.service.ts`

Service de gestion des offres d'emploi.

**Methodes publiques :**

```
create(userId, dto: CreateJobOfferDto): Promise<{ message, offer }>
```
Cree une offre d'emploi. Resout les competences par leur nom (insensible a la casse) : si une competence n'existe pas encore, elle est creee automatiquement avec `is_custom: true`. Gere la specialite `other` avec `custom_speciality`. Associe les competences via `JobOfferSkill`.

```
findAllForCandidates(): Promise<JobOffer[]>
```
Retourne toutes les offres avec le statut `active`, triees par date de creation decroissante. Aplatit les competences en un tableau de noms : `skills: string[]`.

```
findAllForClient(userId): Promise<JobOffer[]>
```
Retourne toutes les offres du client connecte (tous statuts). Meme aplatissement des competences.

```
findOne(id): Promise<JobOffer>
```
Retourne une offre par ID avec ses competences.

```
update(id, userId, dto: UpdateJobOfferDto): Promise<JobOffer>
```
Met a jour une offre. Verifie que le client est le proprietaire. Si des competences sont fournies, supprime d'abord les relations `JobOfferSkill` existantes et relie les nouvelles.

```
remove(id, userId): Promise<{ message }>
```
Supprime une offre. Verifie que le client est le proprietaire.

---

### 1.5 CandidaturesService

**Fichier :** `backend/src/candidatures/candidatures.service.ts`

Service de gestion des candidatures aux offres d'emploi.

**Dependances injectees :**
- `PrismaService`
- `NotificationsService`
- `MailService`

**Methodes publiques :**

```
create(candidateId, dto: CreateCandidatureDto): Promise<Candidature>
```
Cree une candidature. Verifie qu'il n'y a pas de doublon (un candidat ne peut postuler qu'une fois par offre). Incremente `applications_count` sur l'offre. Envoie une notification in-app au client (via `NotificationsService`) et un email (`MailService.sendNewCandidatureEmail`). Envoie egalement une notification de confirmation au candidat.

```
findAllForCandidate(candidateId): Promise<Candidature[]>
```
Retourne toutes les candidatures du candidat avec les details de l'offre et du client.

```
findAllForClient(clientId): Promise<Candidature[]>
```
Methode complexe avec logique d'anonymisation. Retourne les candidatures recues avec les profils des candidats enrichis. Pour les candidats sources par le client (`initiated_by = 'client'`) ayant un test personnalise qui n'est pas encore passe avec succes, les informations personnelles sont masquees (nom -> `"Candidat Sourced (#xxxx)"`, email -> `"anonyme@opside.com"`, photo_url -> `null`).

```
updateStatus(id, clientId, status: CandidatureStatus): Promise<Candidature>
```
Met a jour le statut d'une candidature. Verifie que le client est le proprietaire de l'offre associee. Si le statut passe a `matched` : cree automatiquement un `Match` confirme et envoie les emails de confirmation match aux deux parties. Si le statut passe a `rejected` : envoie une notification et un email de rejet au candidat.

---

### 1.6 MatchesService

**Fichier :** `backend/src/matches/matches.service.ts`

Service de gestion du matching entre candidats et clients.

**Dependances injectees :**
- `PrismaService`
- `NotificationsService`
- `MailService`

**Methodes publiques :**

```
sourceCandidate(clientId, dto: CreateMatchDto): Promise<Match>
```
Permet a un client de sourcer directement un candidat. Verifie qu'un match n'existe pas deja entre ce client et ce candidat pour la meme offre. Cree le match avec `status: pending_candidate` et `initiated_by: client`. Envoie une notification et un email d'invitation de sourcing au candidat.

```
respondToMatch(matchId, userId, role, action: 'confirm' | 'reject'): Promise<Match>
```
Permet de repondre a un match. Verifie que l'utilisateur est bien le bon acteur du match.

- Si `action = 'reject'` : passe le statut a `rejected`, notifie l'autre partie, envoie un email au client si c'est le candidat qui refuse.
- Si `action = 'confirm'` : verifie que c'est le bon tour (candidat si `pending_candidate`, client si `pending_client`). Passe le statut a `confirmed`. Si le match est lie a une offre, cree une `Candidature` avec le statut `matched` si elle n'existe pas. Envoie des notifications et emails de confirmation aux deux parties.

```
findAllForCandidate(candidateId): Promise<Match[]>
```
Retourne tous les matches du candidat avec les details du client et de l'offre. Tri par `matched_at` decroissant.

```
findAllForClient(clientId): Promise<Match[]>
```
Retourne tous les matches du client avec les profils candidats complets (competences, experiences, formations) et le custom test associe. Tri par `matched_at` decroissant.

```
endContract(matchId, clientId): Promise<Match>
```
Met fin a un contrat (passe le statut a `rejected`). Reserve au client. Envoie une notification de fin de collaboration au candidat.

```
addToWorkspace(matchId, clientId): Promise<Match>
```
Transfert le match vers le workspace (`status: in_workspace`). Necessite que le match soit `confirmed`. Envoie une notification et un email d'invitation workspace au candidat.

```
findAllForAdmin(): Promise<Match[]>
```
Retourne tous les matches avec les profils complets des deux parties.

```
findOne(matchId, userId, role): Promise<Match>
```
Recupere un match par ID. Verifie que l'utilisateur est bien un participant du match (candidat ou client).

---

### 1.7 CustomTestService

**Fichier :** `backend/src/custom-test/custom-test.service.ts`

Service de gestion des tests personnalises crees par les clients pour des candidats specifiques.

**Methodes publiques :**

```
createTest(clientId, dto: CreateCustomTestDto): Promise<CustomTest>
```
Cree un test personnalise pour un match specifique. Tente de generer les questions via Claude AI. En cas d'echec ou si la cle API est absente, bascule sur le generateur de questions moquees (`mock-questions.generator.ts`). Passe le statut du test a `sent` et envoie une notification au candidat.

```
sendCalendlyDirectly(matchId, clientId, calendlyUrl): Promise<Match>
```
Enregistre un lien Calendly directement sur le match et envoie une notification au candidat pour planifier l'entretien.

```
getTestsForClient(clientId): Promise<CustomTest[]>
```
Retourne tous les tests crees par le client.

```
getTestsForCandidate(candidateId): Promise<CustomTest[]>
```
Retourne tous les tests assignes au candidat.

```
getTestByMatch(matchId, userId): Promise<CustomTest>
```
Recupere le test associe a un match specifique.

```
getTestForCandidate(testId, candidateId): Promise<CustomTest>
```
Recupere un test specifique pour le candidat (verification de propriete).

```
startTest(testId, candidateId): Promise<CustomTest>
```
Demarre le test : passe le statut a `in_progress` et enregistre `started_at`.

```
submitTest(testId, candidateId, dto: SubmitCustomTestDto): Promise<CustomTest>
```
Soumet les reponses du candidat. Tente d'evaluer les reponses via Claude AI pour obtenir un score. Passe le statut a `scored` si l'IA reussit, sinon a `submitted`. Envoie une notification au client avec le resultat.

```
requestRetest(testId, clientId): Promise<CustomTest>
```
Autorise le candidat a repasser le test (`retest_allowed = true`, reinitialise le statut a `sent`).

---

### 1.8 TestService

**Fichier :** `backend/src/test/test.service.ts`

Service de gestion des tests techniques generes par la plateforme (non-personnalises).

**Methodes publiques :**

```
startTest(userId, skills: string[], speciality: string): Promise<Test>
```
Genere un nouveau test en appelant Claude AI avec les competences et la specialite du candidat. Cree l'enregistrement avec `status: in_progress` et `started_at`.

```
startTestById(userId, testId): Promise<Test>
```
Demarre un test existant (statut `pending`).

```
submitTest(userId, testId, answers: any): Promise<Test>
```
Soumet les reponses et evalue le test via Claude AI. Met a jour le score et les details par question. Cree une entree dans l'historique du candidat.

```
getTestResult(userId, testId): Promise<Test>
```
Retourne le resultat complet d'un test.

```
getLatestTestScore(userId): Promise<{ score, test }>
```
Retourne le score du dernier test passe par le candidat.

---

### 1.9 TimesheetsService

**Fichier :** `backend/src/timesheets/timesheets.service.ts`

Service de suivi du temps de travail avec gestion du chronometre en temps reel.

**Constante :** `EDITABLE_DAYS = 7` - les entrees de plus de 7 jours ne sont plus modifiables.

**Methode privee :**

```
checkIfEditable(entryId, userId): Promise<Timesheet>
```
Verifie que l'entree appartient a l'utilisateur et qu'elle n'est pas trop ancienne (< 7 jours). Leve une `ForbiddenException` si non.

**Methodes publiques :**

```
startTimer(userId, startTimerDto: StartTimerDto): Promise<Timesheet>
```
Demarre un chronometre. Verifie qu'aucun timer n'est deja actif (`running` ou `paused`). Verifie que le `match_id` fourni appartient bien au candidat. Cree l'entree avec `status: running`, `start_time = now()`, `duration = 0`.

```
pauseTimer(userId): Promise<Timesheet>
```
Met le chronometre actif en pause. Calcule la duree ecoulee depuis `start_time` et l'ajoute a `duration`. Ajoute `now()` dans le tableau `paused_at`. Passe le statut a `paused`.

```
resumeTimer(userId): Promise<Timesheet>
```
Reprend le chronometre. Remet `start_time = now()` pour repartir le calcul de duree. Ajoute `now()` dans `resumed_at`. Passe le statut a `running`.

```
stopTimer(userId): Promise<Timesheet>
```
Arrete le chronometre. Si le timer etait `running`, additionne la derniere tranche de temps. Met `end_time = now()` et `status = stopped`.

```
getActiveTimer(userId): Promise<Timesheet>
```
Retourne le timer actif (statut `running` ou `paused`). Leve une `NotFoundException` si aucun.

```
createEntry(userId, createDto): Promise<Timesheet>
```
Cree une entree manuelle. Verifie que la date n'est pas plus ancienne que 7 jours.

```
updateEntry(userId, id, updateDto): Promise<Timesheet>
```
Met a jour une entree. Verifie d'abord `checkIfEditable`.

```
deleteEntry(userId, id): Promise<void>
```
Supprime une entree. Verifie d'abord `checkIfEditable`.

```
getEntries(userId, matchId?, startDate?, endDate?): Promise<Timesheet[]>
```
Retourne les entrees filtrees par `matchId` et/ou plage de dates. Inclut les details du match avec le client.

```
getReport(reportDto: GetReportDto, requesterId, requesterRole): Promise<Report>
```
Genere un rapport de temps consolide. Pour un client, verifie que le collaborateur cible (`user_id`) est bien en `in_workspace` avec lui. Calcule :
- `totalDuration` (secondes) et `totalHours`
- `byDescription` : repartition du temps par description de tache
- `byDay` : repartition par jour avec gestion des sessions chevauchant minuit (calcul proportionnel de la duree par jour)
- `entries` : liste detaillee des entrees

---

### 1.10 NotificationsService

**Fichier :** `backend/src/notifications/notifications.service.ts`

Service de gestion des notifications in-app.

**Dependances injectees :**
- `PrismaService`
- `NotificationsGateway`

**Methodes publiques :**

```
create(data: { user_id, type, title, message, link? }): Promise<Notification>
```
Cree une notification en base et l'envoie immediatement en temps reel via le WebSocket Gateway (`sendNotificationToUser`). Definit automatiquement `read: false` et `email_sent: true`.

```
findAll(user_id): Promise<Notification[]>
```
Retourne toutes les notifications de l'utilisateur, triees par date decroissante.

```
markAsRead(id, user_id): Promise<BatchResult>
```
Marque une notification comme lue et emet l'evenement `unreadCountUpdate` via le WebSocket.

```
markAllAsRead(user_id): Promise<BatchResult>
```
Marque toutes les notifications non lues comme lues et emet `unreadCountUpdate`.

```
getUnreadCount(user_id): Promise<number>
```
Retourne le nombre de notifications non lues.

```
remove(id, userId): Promise<Notification>
```
Supprime une notification (verification de propriete via `id AND user_id`).

---

### 1.11 NotificationsGateway

**Fichier :** `backend/src/notifications/notifications.gateway.ts`

WebSocket Gateway Socket.IO pour les notifications en temps reel.

**Namespace :** `/notifications`

**Methodes :**

```
handleConnection(client: Socket): Promise<void>
```
Appelee a chaque nouvelle connexion WebSocket. Extrait le JWT depuis `client.handshake.auth.token` ou depuis le header `Authorization`. Verifie le token avec `JWT_ACCESS_SECRET`. En cas de succes, fait rejoindre au socket la salle privee `user_<userId>`. En cas d'echec, deconnecte le client.

```
handleDisconnect(client: Socket): void
```
Log de deconnexion.

```
sendNotificationToUser(userId, notification): void
```
Emets deux evenements sur la salle `user_<userId>` :
- `newNotification` avec le payload de la notification
- `unreadCountUpdate` pour forcer le rafraichissement du compteur

---

### 1.12 SkillsService

**Fichier :** `backend/src/skills/skills.service.ts`

Service de gestion du referentiel de competences.

**Methodes publiques :**

```
findAll(userId, category?): Promise<Skill[]>
```
Retourne les competences globales (`owner_id = null`) et les competences personnalisees de l'utilisateur (`owner_id = userId`). Filtrable par categorie.

```
create(userId, data: { name, category }): Promise<Skill>
```
Cree une competence personnalisee pour l'utilisateur. Respecte la contrainte d'unicite `[name, owner_id]`.

```
update(userId, id, data): Promise<Skill>
```
Met a jour une competence. Verifie que l'utilisateur en est le proprietaire.

```
remove(userId, id): Promise<Skill>
```
Supprime une competence personnalisee. Verifie que l'utilisateur en est le proprietaire.

```
findOne(id): Promise<Skill>
```
Retourne une competence par ID.

---

### 1.13 UploadService

**Fichier :** `backend/src/upload/upload.service.ts`

Service centralise pour l'upload de fichiers vers Cloudinary.

**Configuration au constructeur :** Initialise le SDK Cloudinary avec les credentiels depuis `ConfigService`.

**Methodes publiques :**

```
uploadImage(file: Express.Multer.File, folder: string): Promise<{ url, public_id }>
```
Upload une image vers Cloudinary. Valide :
- Types autorises : JPEG, PNG, GIF, WEBP
- Taille max : 5 Mo
Applique une transformation automatique : redimension a 800x800px (`crop: 'limit'`) + compression qualite auto.

```
uploadMedia(file: Express.Multer.File, folder: string): Promise<{ url, public_id, media_type }>
```
Upload un media (image, video ou document PDF). Detecte automatiquement le `resource_type` Cloudinary en fonction du MIME type. Taille max : 50 Mo.

```
deleteFile(publicId: string): Promise<void>
```
Supprime un fichier image/document de Cloudinary.

```
deleteVideo(publicId: string): Promise<void>
```
Supprime une video de Cloudinary (necessite `resource_type: 'video'`).

---

### 1.14 ClaudeClientService

**Fichier :** `backend/src/ai/claude-client.service.ts`

Abstraction du SDK Anthropic pour les appels a l'API Claude.

**Configuration au constructeur :** Initialise le client Anthropic avec `ANTHROPIC_API_KEY`. Lit le modele depuis `AI_MODEL` (defaut: `claude-sonnet-4-20250514`).

**Methode publique :**

```
generateCompletion(systemPrompt, userMessage, temperature = 0.7, maxTokens = 4096): Promise<string>
```
Envoie un message a l'API Claude et retourne le texte de la reponse. Leve une erreur avec un message generique en cas d'echec de l'API pour ne pas exposer les details.

---

### 1.15 MailService

**Fichier :** `backend/src/mail/mail.service.ts`

Service d'envoi d'emails transactionnels via Nodemailer.

**Configuration :** SMTP defini par `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.

**Methodes publiques :**

```
sendVerificationEmail(email, token): Promise<void>
```
Email de verification du compte. Le lien pointe vers `FRONTEND_URL/auth/verify-email?token=<token>`.

```
sendPasswordResetEmail(email, token): Promise<void>
```
Email de reinitialisation du mot de passe. Lien vers `FRONTEND_URL/auth/reset-password?token=<token>`. Token valable 1 heure.

```
sendNewCandidatureEmail(clientEmail, candidateName, jobTitle, message?): Promise<void>
```
Notifie le client de la reception d'une nouvelle candidature.

```
sendMatchConfirmationEmail(email, role: 'candidate' | 'client', partnerName, jobTitle?): Promise<void>
```
Email de confirmation de match. Le contenu varie selon le role (candidat ou client).

```
sendMatchDecisionEmail(email, candidateName, decision: 'accepted' | 'refused', jobTitle?): Promise<void>
```
Email notifiant le client de la decision du candidat sur le match.

```
sendSourcingInvitationEmail(candidateEmail, companyName, projectName): Promise<void>
```
Email d'invitation de sourcing envoye au candidat.

```
sendCandidatureRejectionEmail(candidateEmail, jobTitle): Promise<void>
```
Email de rejet de candidature envoye au candidat.

```
sendWorkspaceInvitationEmail(candidateEmail, companyName, projectName): Promise<void>
```
Email notifiant le candidat que le workspace est ouvert.

---

### 1.16 UsersService

**Fichier :** `backend/src/users/users.service.ts`

Service de gestion administrative des utilisateurs.

**Methodes publiques :**

```
findAll(): Promise<User[]>
```
Retourne tous les utilisateurs (sans mots de passe). Usage admin uniquement.

```
findOne(id): Promise<User>
```
Recupere un utilisateur par ID.

```
updateStatus(id, status: UserStatus): Promise<User>
```
Modifie le statut d'un compte (active, suspended, deleted).

---

### 1.17 VideosService

**Fichier :** `backend/src/videos/videos.service.ts`

Service CRUD pour les videos presentationnelles de la plateforme.

**Methodes publiques :** `create`, `findAll`, `findOne`, `update`, `remove`

Le `create` delegue l'upload du fichier video a `UploadService`. Le `remove` supprime egalement le fichier Cloudinary.

---

### 1.18 PrismaService

**Fichier :** `backend/src/prisma/prisma.service.ts`

Service injectable qui etend `PrismaClient` et gere le cycle de vie de la connexion a la base de donnees.

```
onModuleInit(): Promise<void>
```
Etablit la connexion a PostgreSQL au demarrage du module NestJS (`$connect()`).

---

## 2. Backend - Guards et Decorateurs

### 2.1 JwtAuthGuard

**Fichier :** `backend/src/auth/guards/jwt-auth.guard.ts`

Extends `AuthGuard('jwt')` de `@nestjs/passport`. Valide le Bearer token dans le header `Authorization` a chaque requete. Utilise `JwtStrategy` qui decode le JWT avec `JWT_ACCESS_SECRET` et injecte le payload dans `request.user`.

### 2.2 JwtRefreshGuard

**Fichier :** `backend/src/auth/guards/jwt-refresh.guard.ts`

Extends `AuthGuard('jwt-refresh')`. Utilise `JwtRefreshStrategy` qui valide le token avec `JWT_REFRESH_SECRET` et verifie en base de donnees que le token n'est pas revoque (`is_revoked = false`).

### 2.3 RolesGuard

**Fichier :** `backend/src/auth/guards/roles.guard.ts`

Guard qui verifie le role de l'utilisateur authentifie contre les roles declares avec le decorateur `@Roles()`. Si aucun role n'est declare, l'acces est autorise. Necessite que `JwtAuthGuard` ait deja ete execute.

### 2.4 CurrentUser

**Fichier :** `backend/src/auth/decorators/current-user.decorator.ts`

Decorateur de parametre qui extrait l'utilisateur (ou un champ specifique) du `request.user` injecte par le JwtAuthGuard.

```typescript
// Usage : extrait tout l'objet user
@CurrentUser() user: any

// Usage : extrait uniquement l'id
@CurrentUser('id') userId: string

// Usage : extrait le role
@CurrentUser('role') role: Role
```

### 2.5 Roles

**Fichier :** `backend/src/auth/decorators/roles.decorator.ts`

Decorateur qui marque les metadata `roles` sur un controleur ou une methode. Utilise par `RolesGuard`.

```typescript
@Roles(Role.candidat, Role.admin)
```

### 2.6 AllExceptionsFilter

**Fichier :** `backend/src/common/filters/http-exception.filter.ts`

Filtre global d'exceptions. Capture toutes les exceptions non gerees et normalise la reponse d'erreur en JSON avec le code HTTP, le message et le timestamp. Evite que les erreurs internes exposent des details d'implementation.

---

## 3. Frontend - Couche API (lib/)

### 3.1 api.ts

**Fichier :** `frontend/lib/api.ts`

Instance Axios centrale utilisee par tous les services frontend.

**Configuration :**
- `baseURL` : `NEXT_PUBLIC_API_URL || 'http://localhost:3001'`
- Header par defaut : `Content-Type: application/json`

**Intercepteur de requete :**
Ajoute automatiquement `Authorization: Bearer <token>` en lisant le token depuis `localStorage` via `getToken()`.

**Intercepteur de reponse (gestion du 401) :**
Logique de refresh token automatique :
1. Si une reponse 401 est recue et que la requete n'a pas deja ete reessayee (`_retry`)
2. Si un refresh est deja en cours (`isRefreshing`), met la requete en file d'attente (`failedQueue`)
3. Sinon, tente un `POST /auth/refresh` avec le refresh token
4. En cas de succes : sauvegarde les nouveaux tokens, resout la file d'attente, rejoue la requete originale
5. En cas d'echec : vide la session (`clearAuth`), redirige vers `/auth/login`

La `failedQueue` evite les races conditions : plusieurs requetes echouant simultanement ne declenchent qu'un seul appel refresh.

### 3.2 auth-service.ts

**Fichier :** `frontend/lib/auth-service.ts`

**Types exportes :**
- `UserRole` : `'candidat' | 'client' | 'admin'`
- `UserStatus` : `'active' | 'suspended' | 'pending' | 'deleted'`
- `User` : interface complete avec `id`, `email`, `role`, `first_name`, `last_name`, `status`, `created_at`, `candidate?`, `client?`
- `AuthResponse` : `{ access_token, refresh_token, user }`

**Constantes :**
- `TOKEN_KEY = 'opside_access_token'`
- `REFRESH_KEY = 'opside_refresh_token'`
- `USER_KEY = 'opside_user'`

**Fonctions de session :**

```
getToken(): string | null
```
Lit l'access token depuis `localStorage`. Retourne `null` cote serveur (SSR guard).

```
getRefreshToken(): string | null
```
Lit le refresh token depuis `localStorage`.

```
setTokens(access, refresh): void
```
Sauvegarde les deux tokens dans `localStorage` ET dans les cookies `js-cookie` (expires 7 jours, path `/`). La double persistance permet au middleware Next.js de lire les cookies.

```
setUser(user: User): void
```
Serialise l'objet user en JSON dans `localStorage` et dans un cookie.

```
getUser(): User | null
```
Deserialise l'user depuis `localStorage`. Retourne `null` si absent ou si le JSON est invalide.

```
clearAuth(): void
```
Supprime toutes les donnees de session : `localStorage` (3 cles) et cookies (3 cles).

```
isAuthenticated(): boolean
```
Retourne `true` si un access token est present dans `localStorage`.

```
getDashboardByRole(role: UserRole): string
```
Retourne le chemin de redirection post-login selon le role :
- `admin` -> `/admin`
- `candidat` -> `/candidat/dashboard`
- `client` -> `/client/dashboard`

**Objet `authApi` :**

```typescript
authApi.register(data)        // POST /auth/register
authApi.login(email, password) // POST /auth/login
authApi.logout(refresh_token)  // POST /auth/logout
authApi.me()                   // GET /auth/me
authApi.verifyEmail(token)     // GET /auth/verify-email?token=
authApi.forgotPassword(email)  // POST /auth/forgot-password
authApi.resetPassword(data)    // POST /auth/reset-password
```

### 3.3 candidate-service.ts

**Fichier :** `frontend/lib/candidate-service.ts`

Fonctions d'appel API pour les profils candidats.

```
getMyProfile()                                // GET /candidate/profile/me
getProfileById(id)                            // GET /candidate/profile/:id
getAllCandidates()                             // GET /candidate/all
getAppliedJobs()                              // GET /candidate/applied-jobs
createProfile(data)                           // POST /candidate/profile
updateProfile(data)                           // PATCH /candidate/profile
uploadPhoto(file: File)                       // POST /candidate/profile/photo (multipart)
deletePhoto()                                 // DELETE /candidate/profile/photo

createExperience(data)                        // POST /candidate/experiences
getExperiences()                              // GET /candidate/experiences
updateExperience(id, data)                    // PATCH /candidate/experiences/:id
deleteExperience(id)                          // DELETE /candidate/experiences/:id
uploadExperienceMedia(id, file: File)         // POST /candidate/experiences/:id/media (multipart)
deleteExperienceMedia(expId, mediaId)         // DELETE /candidate/experiences/:expId/media/:mediaId

createEducation(data)                         // POST /candidate/educations
getEducations()                               // GET /candidate/educations
updateEducation(id, data)                     // PATCH /candidate/educations/:id
deleteEducation(id)                           // DELETE /candidate/educations/:id
uploadEducationMedia(id, file: File)          // POST /candidate/educations/:id/media (multipart)
deleteEducationMedia(eduId, mediaId)          // DELETE /candidate/educations/:eduId/media/:mediaId

getHistory()                                  // GET /candidate/history
deleteHistoryItem(id)                         // DELETE /candidate/history/:id
```

Les fonctions d'upload utilisent `FormData` et l'instance `api` (Axios) sans le header `Content-Type` explicite pour laisser le navigateur definir le boundary multipart.

### 3.4 client-service.ts

**Fichier :** `frontend/lib/client-service.ts`

```
getMyProfile()         // GET /client/profile/me
getProfileById(id)     // GET /client/profile/:id
createProfile(data)    // POST /client/profile
updateProfile(data)    // PATCH /client/profile
uploadLogo(file: File) // POST /client/profile/logo (multipart)
getAllCandidates()      // GET /candidate/all
```

### 3.5 job-offer-service.ts

**Fichier :** `frontend/lib/job-offer-service.ts`

```
createJobOffer(data)          // POST /job-offers
getJobOffersForCandidate()    // GET /job-offers/candidate
getJobOffersForClient()       // GET /job-offers/client
getJobOffer(id)               // GET /job-offers/:id
updateJobOffer(id, data)      // PATCH /job-offers/:id
deleteJobOffer(id)            // DELETE /job-offers/:id
```

### 3.6 candidature-service.ts

**Fichier :** `frontend/lib/candidature-service.ts`

```
applyToJob(data)                    // POST /candidatures
getCandidatures()                   // GET /candidatures/candidate
getCandidaturesForClient()          // GET /candidatures/client
updateCandidatureStatus(id, status) // PATCH /candidatures/:id/status
```

### 3.7 match-service.ts

**Fichier :** `frontend/lib/match-service.ts`

```
getMatchesForCandidate()            // GET /matches/candidate
getMatchesForClient()               // GET /matches/client
getMatch(id)                        // GET /matches/:id
sourceCandidate(data)               // POST /matches/source
respondToMatch(id, action)          // PATCH /matches/:id/respond
addToWorkspace(id)                  // PATCH /matches/:id/add-to-workspace
endContract(id)                     // PATCH /matches/:id/end-contract
getAllMatchesAdmin()                 // GET /matches/admin/all
```

### 3.8 test-service.ts

**Fichier :** `frontend/lib/test-service.ts`

```
startTest(skills, speciality)       // POST /tests/start
startTestById(testId)               // GET /tests/:testId/start
submitTest(testId, answers)         // POST /tests/submit
getTestResult(testId)               // GET /tests/:testId/result
getLatestScore()                    // GET /tests/latest-score
```

### 3.9 custom-test-service.ts

**Fichier :** `frontend/lib/custom-test-service.ts`

```
createCustomTest(data)              // POST /custom-test
getTestsForClient()                 // GET /custom-test/client
getTestsForCandidate()              // GET /custom-test/candidate
getTestByMatch(matchId)             // GET /custom-test/match/:matchId
getTest(testId)                     // GET /custom-test/:id
startTest(testId)                   // PATCH /custom-test/:id/start
submitTest(testId, answers)         // POST /custom-test/:id/submit
requestRetest(testId)               // POST /custom-test/:id/retest
sendCalendly(matchId, calendlyUrl)  // POST /custom-test/match/:matchId/send-calendly
```

### 3.10 timesheet-service.ts

**Fichier :** `frontend/lib/timesheet-service.ts`

```
startTimer(matchId, description?)   // POST /timesheets/timer/start
pauseTimer()                        // POST /timesheets/timer/pause
resumeTimer()                       // POST /timesheets/timer/resume
stopTimer()                         // POST /timesheets/timer/stop
getActiveTimer()                    // GET /timesheets/timer/active
getEntries(filters?)                // GET /timesheets?startDate=&endDate=&matchId=
createEntry(data)                   // POST /timesheets
updateEntry(id, data)               // PUT /timesheets/:id
deleteEntry(id)                     // DELETE /timesheets/:id
getReport(params)                   // GET /timesheets/report?matchId=&startDate=&endDate=&user_id=
```

### 3.11 notification-service.ts

**Fichier :** `frontend/lib/notification-service.ts`

```
getNotifications()                  // GET /notifications
getUnreadCount()                    // GET /notifications/unread-count
markAsRead(id)                      // PATCH /notifications/:id/read
markAllAsRead()                     // PATCH /notifications/read-all
deleteNotification(id)              // DELETE /notifications/:id
```

### 3.12 skill-service.ts

**Fichier :** `frontend/lib/skill-service.ts`

```
getSkills(category?)                // GET /skills?category=
createSkill(data)                   // POST /skills
updateSkill(id, data)               // PATCH /skills/:id
deleteSkill(id)                     // DELETE /skills/:id
```

### 3.13 video-service.ts

**Fichier :** `frontend/lib/video-service.ts`

```
getVideos()                         // GET /videos
createVideo(file, data)             // POST /videos (multipart)
updateVideo(id, data)               // PATCH /videos/:id
deleteVideo(id)                     // DELETE /videos/:id
```

### 3.14 admin-service.ts

**Fichier :** `frontend/lib/admin-service.ts`

Fonctions d'administration (gestion des utilisateurs, acces aux statistiques globales).

---

## 4. Frontend - Hooks

### 4.1 useNotifications

**Fichier :** `frontend/hooks/useNotifications.ts`

Hook React qui gere la connexion WebSocket pour les notifications en temps reel.

**Retour :**
```typescript
{ unreadCount: number, fetchUnreadCount: () => Promise<void> }
```

**Fonctionnement :**

1. Au montage, appelle `fetchUnreadCount()` pour initialiser le compteur.
2. Recupere le JWT depuis `getToken()`.
3. Etablit une connexion Socket.IO vers `NEXT_PUBLIC_API_URL/notifications` avec le token dans `auth: { token }`, transport `websocket`.
4. Ecoute l'evenement `newNotification` : appelle `fetchUnreadCount()` pour mettre a jour le compteur.
5. Ecoute l'evenement `unreadCountUpdate` : appelle `fetchUnreadCount()`.
6. Au demontage du composant, deconnecte le socket (`newSocket.disconnect()`).

Ce hook est utilise dans les sidebars (`CandidatSidebar`, `ClientSidebar`) pour afficher le badge de notification en temps reel.

---

## 5. Frontend - Composants UI

### 5.1 Button

**Fichier :** `frontend/components/ui/Button.tsx`

Composant polymorphique : rendu en `<button>` par defaut, en `<a>` si la prop `href` est fournie.

**Props :**
- `variant` : `'gradient'` (fond violet degrade) | `'ghost'` (fond transparent) | `'outline'` (bordure) | `'danger'` (rouge)
- `size` : `'sm'` | `'md'` | `'lg'`
- `disabled`, `loading` : gere l'etat de chargement avec un spinner
- `href`, `target`, `rel` : props de lien pour le rendu `<a>`
- `className` : classes supplementaires

### 5.2 Input / Textarea / Select

**Fichiers :** `frontend/components/ui/Input.tsx`, `Textarea.tsx`, `Select.tsx`

Composants de formulaire stylises avec label, champ de saisie et message d'erreur integres.

**Props communes :** `label?`, `error?`, `className?`, toutes les props HTML natives du champ.

### 5.3 Modal

**Fichier :** `frontend/components/ui/Modal.tsx`

Dialog modal avec fond opaque sombre. S'affiche/se masque via la prop `isOpen`. Inclut un bouton de fermeture et un titre. Clic sur le fond ferme le modal. Gere le scroll du body (`overflow: hidden`) quand ouvert.

**Props :** `isOpen`, `onClose`, `title`, `children`, `className?`

### 5.4 FadeIn

**Fichier :** `frontend/components/ui/FadeIn.tsx`

Wrapper d'animation d'entree par transition CSS. Au montage, declenche un `setTimeout` avec le `delay` fourni pour ajouter la classe d'opacite complete et supprimer le translateY initial.

**Props :** `delay?` (ms, defaut 0), `className?`, `children`

Utilise sur la landing page pour les animations sequentielles des sections.

### 5.5 Badge

**Fichier :** `frontend/components/ui/Badge.tsx`

Petit composant de statut colore. Accepte un `color` ou un `variant` predefined (success, warning, danger, info).

### 5.6 SkillSelector

**Fichier :** `frontend/components/ui/SkillSelector.tsx`

Composant avance de selection de competences avec recherche.

**Fonctionnement :**
- Charge les competences via `GET /skills` au montage
- Affiche un champ de recherche qui filtre les competences
- Permet de selectionner/deselectionner des competences (pill cliquables)
- Bouton pour creer une competence personnalisee si elle n'existe pas
- Retourne les IDs des competences selectionnees via `onChange(skillIds: string[])`

**Props :** `value: string[]` (IDs), `onChange`, `label?`, `placeholder?`

### 5.7 FileUpload

**Fichier :** `frontend/components/ui/FileUpload.tsx`

Zone de depot de fichier avec drag and drop. Affiche un apercu si le fichier est une image.

**Props :** `onFile`, `accept?`, `label?`, `currentUrl?` (apercu actuel)

### 5.8 CountrySelect

**Fichier :** `frontend/components/ui/CountrySelect.tsx`

Selecteur de pays avec icones de drapeau. Liste les pays supportes par la plateforme (Afrique francophone + autres marches cibles).

---

## 6. Frontend - Composants Test

**Dossier :** `frontend/components/test/`

### Timer

**Fichier :** `Timer.tsx`

Chronometre degressif affichant le temps restant au format `MM:SS`. Recoit `durationSeconds` et appelle `onTimeUp()` a expiration.

### TestStepper

**Fichier :** `TestStepper.tsx`

Barre de progression visuelle indiquant la question courante sur le total. Affiche les etapes sous forme de cercles numerotes.

### QuestionCard

**Fichier :** `QuestionCard.tsx`

Carte d'affichage d'une question de test. Supporte les types :
- `multiple_choice` : choix multiples avec selection
- `code` : editeur Monaco integre via `CodeEditor`
- `open` : zone de texte libre

**Props :** `question`, `selectedAnswer`, `onAnswer(answer)`

### CodeEditor

**Fichier :** `CodeEditor.tsx`

Wrapper autour de `@monaco-editor/react`. Configure le langage, le theme (dark), la police et la hauteur minimale. Appelle `onChange` a chaque modification.

---

## 7. Frontend - Composants Dashboard Candidat

**Dossier :** `frontend/components/dashboard/candidate/`

### OffresTab

**Fichier :** `OffresTab.tsx` (18 Ko)

Onglet principal de decouverte des offres d'emploi.

**Fonctionnalites :**
- Charge les offres via `getJobOffersForCandidate()`
- Charge les IDs des offres deja postulees via `getAppliedJobs()`
- Filtres locaux : par specialite, par type de travail (`work_type`)
- Modale de detail d'offre avec description complete et competences requises
- Bouton de candidature qui ouvre un formulaire avec message optionnel
- Indicateur visuel "Deja postule" sur les offres concernees

### MatchesTab

**Fichier :** `MatchesTab.tsx` (7 Ko)

Liste les matches du candidat avec leur statut et les actions disponibles.

**Fonctionnalites :**
- Affiche le statut de chaque match avec un code couleur (en attente, confirme, rejete, workspace)
- Boutons "Accepter" et "Refuser" sur les matches `pending_candidate`
- Appelle `respondToMatch(id, 'confirm' | 'reject')`
- Affiche les informations de l'entreprise cliente

### TechniqueTab

**Fichier :** `TechniqueTab.tsx` (3.5 Ko)

Onglet de gestion des tests techniques plateforme.

**Fonctionnalites :**
- Affiche le score du dernier test (`getLatestScore()`)
- Lien vers `/candidat/test` pour passer un nouveau test
- Jauge visuelle du score

### CustomTestTab

**Fichier :** `CustomTestTab.tsx` (10 Ko)

Onglet de suivi des tests personnalises assignes par les clients.

**Fonctionnalites :**
- Liste tous les custom tests du candidat
- Affiche le statut, le score (si disponible) et le seuil requis
- Lien vers `/candidat/custom-test` pour passer le test
- Indicateur de reussite/echec par rapport au seuil

### HistoriqueTab

**Fichier :** `HistoriqueTab.tsx` (6 Ko)

Chronologie des actions du candidat (candidatures et tests).

**Fonctionnalites :**
- Liste les entrees d'historique avec icone, date, titre et resultat
- Bouton de suppression par element (soft-delete)
- Code couleur selon le resultat (vert = succes, rouge = echec/rejet)

### ProfilTab

**Fichier :** `ProfilTab.tsx` (70 Ko - composant le plus volumineux)

Formulaire complet de gestion du profil candidat. Divise en sections :
- Informations de base (photo, titre, specialite, experience, taux journalier, disponibilite, pays, ville, bio)
- Liens professionnels (LinkedIn, GitHub, Portfolio)
- Competences (SkillSelector)
- Experiences professionnelles (CRUD avec modal, upload media)
- Formations (CRUD avec modal, upload media)

**Fonctionnalites :**
- Sauvegarde partielle section par section
- Upload photo avec apercu immediat
- CRUD experiences avec modal de formulaire complet
- Upload de medias (images, videos, PDFs) par experience/formation
- Gestion des competences par experience et formation

### NotificationsTab (candidat)

**Fichier :** `NotificationsTab.tsx` (2 Ko)

Affiche toutes les notifications du candidat. Boutons pour marquer comme lu et supprimer.

### AideTab

**Fichier :** `AideTab.tsx` (3.7 Ko)

Section d'aide et FAQ. Contenu statique avec accordeons.

---

## 8. Frontend - Composants Dashboard Client

**Dossier :** `frontend/components/dashboard/client/`

### ClientOffresTab

**Fichier :** `ClientOffresTab.tsx` (15 Ko)

Gestion des offres d'emploi du client.

**Fonctionnalites :**
- Liste toutes les offres du client avec statut et compteurs (vues, candidatures)
- Bouton de creation ouvrant `ClientOfferFormModal`
- Actions par offre : modifier (rouvre le modal), changer le statut (draft/active/paused/closed), supprimer
- Filtre par statut

### ClientOfferFormModal

**Fichier :** `ClientOfferFormModal.tsx` (14 Ko)

Modal de creation et modification d'offre d'emploi.

**Champs :**
- Titre, description, specialite, experience minimum, TJM, duree du contrat
- Type de travail (remote/hybrid/on-site), fuseau horaire, date de demarrage
- Competences requises (champ libre avec creation automatique)

### CandidaturesTab

**Fichier :** `CandidaturesTab.tsx` (48 Ko - composant le plus volumineux du client)

Gestion des candidatures recues.

**Fonctionnalites :**
- Groupement des candidatures par offre
- Affichage du profil complet du candidat (competences, experiences, formations)
- Gestion de l'anonymisation : si un candidat source n'a pas passe le test avec succes, son identite est masquee
- Actions : accepter (`matched`), refuser (`rejected`)
- Acces au profil public du candidat en lecture seule

### SourcingTab

**Fichier :** `SourcingTab.tsx` (20 Ko)

Recherche et sourcing direct de candidats.

**Fonctionnalites :**
- Charge tous les profils candidats complets (`getAllCandidates()`)
- Filtres : specialite, experience, disponibilite, pays
- Affichage des profils avec competences et experience resumee
- Bouton "Sourcer" qui ouvre un modal pour choisir l'offre associee (optionnel) et confirmer l'invitation

### MatchesTab (client)

**Fichier :** `MatchesTab.tsx` (5 Ko)

Liste les matches du client.

**Fonctionnalites :**
- Affiche tous les matches avec le profil du candidat et le statut
- Bouton "Confirmer" sur les matches `pending_client`
- Navigation vers le workflow post-match

### ValidationPostMatchTab

**Fichier :** `ValidationPostMatchTab.tsx` (33 Ko)

Workflow post-match pour valider et integrer un candidat.

**Fonctionnalites (par etapes) :**
1. **Test personnalise** : creation du custom test (competences, difficulte, duree, instructions, seuil de score)
2. **Planification** : envoi d'un lien Calendly au candidat
3. **Workspace** : bouton pour ouvrir le workspace quand le candidat est valide
4. **Fin de contrat** : bouton pour terminer la collaboration

### ClientProfilTab

**Fichier :** `ClientProfilTab.tsx` (23 Ko)

Formulaire de gestion du profil entreprise.

**Champs :** Nom entreprise, taille, secteur, pays, ville, contact principal, email/telephone, site web, disponibilites pour entretiens, upload logo.

---

## 9. Frontend - Composants Workspace Candidat

**Dossier :** `frontend/components/workspace/candidate/`

### WorkspaceHome

**Fichier :** `WorkspaceHome.tsx` (27 Ko)

Onglet d'accueil du workspace candidat.

**Sections :**
- Resume de la mission (entreprise, offre, date de debut)
- Chronometre avec start/pause/stop et affichage du temps actif en cours
- Graphique en barres des heures travaillees par semaine (Recharts)
- Journal d'activite avec les dernieres sessions
- Indicateur de charge de travail (jours actifs / jours de la semaine)
- Totaux par jour affiches sous chaque date

### WorkspaceTimeTracking

**Fichier :** `WorkspaceTimeTracking.tsx` (20 Ko)

Onglet de suivi du temps detaille.

**Fonctionnalites :**
- Vue calendrier hebdomadaire des sessions
- Chronometre interactif (start/pause/resume/stop)
- CRUD manuel des entrees (creation, modification, suppression dans la fenetre de 7 jours)
- Totaux par jour (format `HH:MM:SS`)
- Graphique Recharts des heures par jour de la semaine

### WorkspaceContrats / WorkspaceFactures

**Fichiers :** `WorkspaceContrats.tsx`, `WorkspaceFactures.tsx`

Composants placeholders pour les fonctionnalites de contrats et factures (en cours de developpement).

---

## 10. Frontend - Composants Workspace Client

**Dossier :** `frontend/components/workspace/client/`

### WorkspaceClientTimeTracking

**Fichier :** `WorkspaceClientTimeTracking.tsx` (34 Ko - le plus volumineux)

Tableau de bord de suivi du temps des collaborateurs pour le client.

**Fonctionnalites :**
- Selecteur de collaborateur (liste les candidats en `in_workspace` avec ce client)
- Selecteur de periode (navigation semaine par semaine)
- Graphique Recharts en barres des heures par jour avec transparence et couleurs harmonieuses
- Tableau detaille des sessions avec heure debut/fin, duree, description
- Total hebdomadaire en `HH:MM:SS`
- Rapport export (via `getReport()`)

### WorkspaceCollaborateurs

**Fichier :** `WorkspaceCollaborateurs.tsx` (22 Ko)

Gestion des collaborateurs dans le workspace.

**Fonctionnalites :**
- Liste tous les candidats dont le match est `in_workspace` avec ce client
- Affiche le profil, les competences et le statut de chaque collaborateur
- Bouton de fin de contrat (`endContract`) avec confirmation

### WorkspaceClientHome / WorkspaceClientNotes / WorkspaceClientFactures

Composants d'accueil, notes et facturation du workspace client (certains en cours de developpement).

---

## 11. Conventions de code

### Nommage

| Element | Convention | Exemple |
|---|---|---|
| Fichiers backend | kebab-case | `candidate.service.ts` |
| Classes backend | PascalCase | `CandidateService` |
| Methodes backend | camelCase | `createProfile()` |
| Variables d'env backend | UPPER_SNAKE_CASE | `JWT_ACCESS_SECRET` |
| Fichiers frontend | PascalCase (composants) | `ProfilTab.tsx` |
| Fichiers frontend | kebab-case (services) | `candidate-service.ts` |
| Champs Prisma | snake_case | `profile_completed`, `created_at` |
| Routes API | kebab-case | `/job-offers`, `/custom-test` |

### Gestion des erreurs (Backend)

Les services NestJS utilisent les exceptions HTTP natives :
- `NotFoundException` : ressource introuvable (404)
- `ConflictException` : doublon ou contrainte metier (409)
- `ForbiddenException` : acces refuse a une ressource existante (403)
- `BadRequestException` : donnees invalides (400)
- `UnauthorizedException` : authentification echouee (401)

Toutes les exceptions non catchees remontent vers `AllExceptionsFilter` qui normalise la reponse.

### Validation des DTOs (Backend)

Tous les DTOs utilisent les decorateurs de `class-validator` :
- `@IsString()`, `@IsEmail()`, `@IsEnum()`, `@IsUUID()`
- `@IsOptional()` pour les champs optionnels
- `@IsArray()`, `@ArrayMinSize()`
- `@Min()`, `@Max()` pour les valeurs numeriques

La `ValidationPipe` globale avec `whitelist: true` supprime automatiquement les proprietes non declarees dans le DTO.

### Gestion des tokens (Frontend)

Les tokens sont stockes en double :
- `localStorage` : pour les appels API (lecture dans l'intercepteur Axios)
- Cookies `js-cookie` : pour le middleware Next.js (protection des routes cote serveur)

Cette double persistance permet aux redirections SSR de fonctionner correctement sans flash de contenu non authentifie.

### Composants React

- Tous les composants sont des composants fonctionnels avec hooks
- Les composants de page utilisent `'use client'` (App Router)
- La gestion d'etat locale utilise `useState` et `useEffect`
- Pas de gestionnaire d'etat global (Redux/Zustand) : chaque composant charge ses donnees independamment
- Les notifications temps reel sont gerees via le hook `useNotifications` centralise dans les sidebars

### Conventions Prisma

- Toutes les tables sont mappees avec `@@map("snake_case_plural")`
- Les UUIDs sont generes cote base de donnees (`@default(uuid())`)
- Les timestamps `created_at` et `updated_at` sont automatiques (`@default(now())`, `@updatedAt`)
- Les suppressions en cascade sont declarees explicitement (`onDelete: Cascade`)
- Les competences utilisent une cle primaire composite : `@@id([candidate_id, skill_id])`

---

## 12. Backend - Strategies Passport (JWT)

### 12.1 JwtStrategy

**Fichier :** `backend/src/auth/strategies/jwt.strategy.ts`

Strategie Passport nommee `'jwt'`. Utilisee par `JwtAuthGuard`.

**Configuration :**
- Extraction du token : `ExtractJwt.fromAuthHeaderAsBearerToken()` — lit le Bearer token dans le header `Authorization`
- `ignoreExpiration: false` — les tokens expires sont rejetes
- `secretOrKey` : `JWT_ACCESS_SECRET`

**Methode `validate(payload)` :**

Recoit le payload decode `{ sub: string, email: string, role: string }`. Effectue une verification supplementaire en base : recherche l'utilisateur par `id = payload.sub` et verifie que son statut est `active`. Leve une `UnauthorizedException` si l'utilisateur n'existe plus ou si son compte a ete suspendu/supprime entre l'emission du token et la requete. Retourne `{ id, email, role }` qui est injecte dans `request.user`.

### 12.2 JwtRefreshStrategy

**Fichier :** `backend/src/auth/strategies/jwt-refresh.strategy.ts`

Strategie Passport nommee `'jwt-refresh'`. Utilisee par `JwtRefreshGuard`.

**Configuration :**
- Extraction : `ExtractJwt.fromBodyField('refresh_token')` — lit le token dans le corps de la requete
- `secretOrKey` : `JWT_REFRESH_SECRET`
- `passReqToCallback: true` — le handler `validate` recoit la requete complete

**Methode `validate(req, payload)` :**

1. Extrait le refresh token brut depuis `req.body.refresh_token`
2. Verifie en base de donnees que le token existe (`RefreshToken.findUnique`)
3. Verifie que `is_revoked = false` et que `expires_at` n'est pas depasse
4. Verifie que l'utilisateur associe est `active`
5. Retourne `{ id, email, role, refreshToken }` (le `refreshToken` brut est passe pour pouvoir le revoquer dans `AuthService.refreshTokens`)

---

## 13. Backend - DTOs (Data Transfer Objects)

Les DTOs valident et typent les corps de requetes HTTP. Tous utilisent `class-validator`.

### 13.1 Auth DTOs

**RegisterDto** (`backend/src/auth/dto/register.dto.ts`)

| Champ | Type | Contraintes |
|---|---|---|
| `email` | string | `@IsEmail`, `@IsNotEmpty` |
| `password` | string | `@MinLength(8)`, regex (1 maj + 1 min + 1 chiffre ou special) |
| `role` | Role | `@IsEnum([Role.candidat, Role.client])` — l'admin est exclu |
| `first_name` | string? | `@IsOptional` |
| `last_name` | string? | `@IsOptional` |

**LoginDto**

| Champ | Type | Contraintes |
|---|---|---|
| `email` | string | `@IsEmail` |
| `password` | string | `@IsString`, `@IsNotEmpty` |

**ForgotPasswordDto**

| Champ | Type | Contraintes |
|---|---|---|
| `email` | string | `@IsEmail`, `@IsNotEmpty` |

**ResetPasswordDto**

| Champ | Type | Contraintes |
|---|---|---|
| `token` | string | `@IsString`, `@IsNotEmpty` |
| `password` | string | `@MinLength(8)`, regex complexite |

**RefreshTokenDto**

| Champ | Type | Contraintes |
|---|---|---|
| `refresh_token` | string | `@IsString`, `@IsNotEmpty` |

### 13.2 Timesheets DTOs

**StartTimerDto**

| Champ | Contraintes |
|---|---|
| `match_id` | `@IsUUID` |
| `description` | `@IsString`, `@IsOptional` |

**CreateTimesheetDto**

| Champ | Contraintes |
|---|---|
| `match_id` | `@IsUUID` |
| `start_time` | `@IsDateString` |
| `end_time` | `@IsDateString`, `@IsOptional` |
| `duration` | `@IsNumber`, `@IsOptional` |
| `description` | `@IsString`, `@IsOptional` |
| `status` | `@IsEnum(TimerStatus)`, `@IsOptional` |

**GetReportDto**

| Champ | Contraintes |
|---|---|
| `match_id` | `@IsUUID`, `@IsOptional` |
| `start_date` | `@IsDateString`, `@IsOptional` |
| `end_date` | `@IsDateString`, `@IsOptional` |
| `user_id` | `@IsUUID`, `@IsOptional` (pour les clients ciblant un collaborateur) |

### 13.3 CreateMatchDto

| Champ | Contraintes |
|---|---|
| `candidate_id` | `@IsUUID` |
| `job_offer_id` | `@IsUUID`, `@IsOptional` |

### 13.4 CreateCandidatureDto

| Champ | Contraintes |
|---|---|
| `job_offer_id` | `@IsUUID` |
| `message` | `@IsString`, `@IsOptional` |

---

## 14. Backend - Modules IA et Prompts

### 14.1 Structure des prompts

**Fichier :** `backend/src/ai/prompts/generate-test.prompt.ts`

Fonction `generateTestPrompt(speciality, difficulty, skills[])` — construit le prompt de generation de test envoye a Claude.

**Regles injectees dans le prompt :**
- Exactement 10 questions
- Distribution des types : 4 QCM, 3 code, 2 debug, 1 open
- Distribution des difficultes : 3 easy, 4 medium, 3 hard
- Total des points = 100
- QCM avec 4 options dont 1 seule correcte
- Questions de code avec contexte clair

**Format de reponse attendu (JSON strict) :**
```json
{
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "skill": "React",
      "difficulty": "easy",
      "question_text": "...",
      "options": ["...", "...", "...", "..."],
      "correct_answer": "...",
      "points": 10,
      "evaluation_criteria": "..."
    }
  ]
}
```

Note de securite : les champs `correct_answer` et `evaluation_criteria` sont supprimes des questions avant envoi au client via la methode `sanitizeQuestions` du `TestService`.

---

**Fichier :** `backend/src/ai/prompts/evaluate-answers.prompt.ts`

Fonction `evaluateAnswersPrompt(questions[], candidateAnswers[])` — construit le prompt d'evaluation.

**Grille d'evaluation injectee :**
- QCM : 100% si correct, 0% sinon
- Code : logique 40%, syntaxe 30%, bonnes pratiques 30%
- Debug : identification du bug 50%, correction proposee 50%
- Open : comprehension 50%, clarte de la reponse 50%

**Format de reponse attendu :**
```json
{
  "scores": [
    {
      "question_id": 1,
      "points_earned": 8,
      "max_points": 10,
      "feedback": "..."
    }
  ],
  "total_score": 75
}
```

### 14.2 Logique de retry dans TestService

Le `TestService` utilise une boucle de retry (`maxRetries = 3`) pour les appels Claude. Si la reponse n'est pas du JSON valide, la methode `extractAndParseJSON` tente deux patterns d'extraction :

1. Bloc de code Markdown : ` ```json ... ``` `
2. Objet JSON brut : regex `({[\s\S]*})`

Si les 3 tentatives echouent, une `BadRequestException` est levee. La temperature utilisee est :
- `0.7` pour la generation (variete)
- `0.2` pour l'evaluation (determinisme)

### 14.3 Generateur de questions moquees

**Fichier :** `backend/src/custom-test/mock-questions.generator.ts`

Utilise comme fallback quand Claude AI est inaccessible (pas de cle API ou erreur reseau).

**`generateMockQuestions(skillsTested, difficulty)`**

Retourne un tableau fixe de 10 questions generiques adaptees a la competence principale et au niveau. Distribution : 4 QCM, 3 code, 2 debug, 1 open. Les questions de code incluent des exercices classiques : filtre/tri d'objets, implementation de `debounce`, `EventEmitter`. La question de debug inclut un exemple avec bugs intentionnels (initialisation a 1, `<=` a la place de `<`, `=` a la place de `===`, `returns` a la place de `return`).

**`evaluateMockAnswers(questions, answers)`**

Evaluation heuristique des reponses moquees. Attribue un score aleatoire entre 55 et 95. Chaque question recoit un score proportionne si la reponse contient au moins 10 caracteres. Note : contient un mecanisme de cheat detection de debug — si une reponse contient `"PASS"` le score est fixe a 88, si elle contient `"FAIL"` le score est 35.

---

## 15. Backend - Configuration AppModule

**Fichier :** `backend/src/app.module.ts`

Module racine qui importe tous les modules de l'application.

**Modules globaux :**
- `ConfigModule.forRoot({ isGlobal: true })` — rend `ConfigService` injectable partout sans re-import
- `ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }])` — rate limiting global : 100 requetes par fenetre de 60 secondes par IP

**Modules metier importes :**

| Module | Responsabilite |
|---|---|
| `PrismaModule` | Service Prisma global |
| `AuthModule` | Inscription, connexion, JWT |
| `UsersModule` | CRUD utilisateurs (admin) |
| `CandidateModule` | Profils candidats, experiences, formations |
| `ClientModule` | Profils clients, logo |
| `SkillsModule` | Referentiel competences |
| `UploadModule` | Upload Cloudinary centralise |
| `MailModule` | Emails transactionnels |
| `TestModule` | Tests techniques plateforme (IA) |
| `VideosModule` | Videos presentationnelles |
| `JobOffersModule` | Offres d'emploi |
| `NotificationsModule` | Notifications in-app + WebSocket |
| `CandidaturesModule` | Candidatures aux offres |
| `MatchesModule` | Matching candidat-client |
| `CustomTestModule` | Tests personnalises client |
| `TimesheetsModule` | Suivi du temps de travail |

---

## 16. Frontend - Pages de test technique (flux complet)

Le flux de passage d'un test plateforme est decompose en plusieurs sous-routes sous `/candidat/test/`.

### Structure des routes de test

```
/candidat/test/
├── start/          # Selection des competences et lancement
├── ready/          # Page d'information avant de demarrer
├── [testId]/       # Interface de passage du test (questions)
└── test-result/    # Affichage du score et du feedback
```

**Flux utilisateur :**

1. **`/candidat/test/start`** : Le candidat selectionne ses competences via `SkillSelector` et sa specialite. Appelle `POST /tests/start` -> recoit `testId` et les questions (sans les bonnes reponses). Redirige vers `/candidat/test/ready?testId=<id>`.

2. **`/candidat/test/ready`** : Page de preparation. Affiche les regles du test (10 questions, 45 minutes, pas de retour en arriere). Bouton "Commencer" qui redirige vers `/candidat/test/[testId]` et demarre le chronometre.

3. **`/candidat/test/[testId]`** : Interface principale du test. Affiche les questions une par une via `QuestionCard`. Le `Timer` decompte en haut. La navigation entre questions utilise `TestStepper`. A la soumission, appelle `POST /tests/submit` et redirige vers `/candidat/test/test-result`.

4. **`/candidat/test/test-result`** : Affiche le score final, le feedback par question (si disponible) et un bouton pour retourner au dashboard.

---

## 17. Frontend - Pages Admin

### 17.1 AdminDashboard (`/admin`)

**Fichier :** `frontend/app/admin/page.tsx`

Tableau de bord de supervision globale. Client component (`'use client'`).

**Chargement des donnees :**
Appel parallele via `Promise.all` :
- `adminApi.getUsers()` -> liste de tous les utilisateurs
- `adminApi.getMatches()` -> liste de tous les matches

**Statistiques calculees (avec `useMemo`) :**
- Total utilisateurs, nombre de candidats, nombre de clients, nombre de suspendus, nombre de matches

**Composants de visualisation (Recharts) :**

- `PieChart` en donut (innerRadius: 60, outerRadius: 80) pour la repartition des utilisateurs (candidats / entreprises / suspendus)
- `PieChart` en donut pour la repartition des statuts de matches avec un code couleur specifique par statut :
  - `pending_candidate` : ambre
  - `pending_client` : bleu
  - `confirmed` : emerald
  - `in_workspace` : violet
  - `rejected` : rose

**Etats de chargement :** Squelettes animes (`animate-pulse`) pendant le chargement initial des `KPICardSkeleton` et `ChartSkeleton`.

**Actions rapides :** 4 liens vers les pages de gestion (`/admin/users`, `/admin/matches`).

### 17.2 Admin Users (`/admin/users`)

**Fichier :** `frontend/app/admin/users/page.tsx`

Liste paginees de tous les utilisateurs avec :
- Filtres par role (candidat / client / admin) via query param `?role=`
- Affichage du statut avec badges colores
- Actions : suspension/activation du compte via `updateStatus`
- Liens vers les profils

### 17.3 Admin Matches (`/admin/matches`)

**Fichier :** `frontend/app/admin/matches/page.tsx`

Supervision de tous les matches de la plateforme. Affiche le candidat, le client, le statut et la date de match.

### 17.4 Admin Videos (`/admin/videos`)

**Fichier :** `frontend/app/admin/videos/page.tsx`

CRUD complet des videos presentationnelles avec upload de fichier.

---

## 18. Backend - Scripts de Seed

### 18.1 seed-admin.ts

**Fichier :** `backend/prisma/seed-admin.ts`

Script a executer une seule fois en ligne de commande pour creer le compte administrateur initial.

```bash
npx ts-node prisma/seed-admin.ts
```

Cree un utilisateur avec :
- Email defini en dur (ou via variable d'environnement)
- Mot de passe hache avec bcrypt
- Role `admin`
- Statut `active` directement (sans verification email)

### 18.2 seed-skills.ts

**Fichier :** `backend/prisma/seed-skills.ts`

Peuple la table `Skill` avec un referentiel de competences pre-existantes (JavaScript, TypeScript, React, Vue, Angular, NestJS, Django, Laravel, PostgreSQL, MongoDB, Docker, Kubernetes, AWS, Flutter, React Native, Figma, etc.).

```bash
npx ts-node prisma/seed-skills.ts
```

Chaque competence est inseree avec `upsert` pour eviter les doublons en cas de re-execution. Les competences du seed ont `owner_id = null` et `is_custom = false`, ce qui les distingue des competences personnalisees des utilisateurs.

---

## 19. Frontend - Layout et Sidebars

### 19.1 Layout Racine

**Fichier :** `frontend/app/layout.tsx`

Layout minimal qui inclut les balises `<html>` et `<body>` avec la police globale et le composant `<Toaster>` de `react-hot-toast` pour les notifications flash.

### 19.2 CandidatSidebar

**Fichier :** `frontend/components/layout/CandidatSidebar.tsx`

Barre laterale de navigation de l'espace candidat. Utilise `useNotifications` pour afficher le compteur de notifications en temps reel sur l'icone de l'onglet "Notifications". Gere la navigation entre les onglets du dashboard candidat. Sur mobile, peut se replier en icones uniquement.

**Onglets affiches :** Offres, Matches, Technique, Tests Client, Historique, Notifications (avec badge), Profil, Aide

### 19.3 ClientSidebar

**Fichier :** `frontend/components/layout/ClientSidebar.tsx`

Meme logique que `CandidatSidebar` mais pour l'espace client. Utilise egalement `useNotifications` pour le badge temps reel.

**Onglets affiches :** Offres, Candidatures, Sourcing, Matches, Validation, Profil, Notifications (avec badge)

### 19.4 AdminSidebar

**Fichier :** `frontend/components/layout/AdminSidebar.tsx`

Navigation de l'espace administrateur. Liens vers Dashboard, Utilisateurs, Matches, Videos.

---

## 20. Frontend - Dependances notables

### Backend (`package.json`)

| Dependance | Usage |
|---|---|
| `@nestjs/core`, `@nestjs/common` | Framework NestJS |
| `@nestjs/passport`, `passport-jwt` | Authentification JWT |
| `@nestjs/jwt` | Generation et verification JWT |
| `@nestjs/throttler` | Rate limiting |
| `@nestjs/websockets`, `@nestjs/platform-socket.io` | WebSocket Gateway |
| `@prisma/client` | ORM PostgreSQL |
| `prisma` (devDep) | CLI migrations |
| `bcrypt` | Hachage mots de passe |
| `@anthropic-ai/sdk` | Client API Claude |
| `cloudinary` | Upload fichiers |
| `nodemailer` | Envoi emails SMTP |
| `multer` | Gestion upload multipart |
| `class-validator`, `class-transformer` | Validation DTOs |
| `date-fns` | Calculs de dates (timesheets) |
| `socket.io` | WebSocket |

### Frontend (`package.json`)

| Dependance | Usage |
|---|---|
| `next` | Framework React (App Router) |
| `react`, `react-dom` | Librairie UI |
| `typescript` | Typage statique |
| `tailwindcss` | Styles utilitaires |
| `axios` | Client HTTP avec intercepteurs |
| `socket.io-client` | Client WebSocket |
| `js-cookie` | Gestion des cookies session |
| `recharts` | Graphiques (timesheets, admin) |
| `@monaco-editor/react` | Editeur de code dans les tests |
| `react-hot-toast` | Notifications flash |
| `lucide-react` | Icones SVG |
| `date-fns` | Formatage des dates |
