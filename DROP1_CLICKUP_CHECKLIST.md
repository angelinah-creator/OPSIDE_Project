]633;E;head -n 146 DROP1_CLICKUP_CHECKLIST.md;9ed1b253-8096-4dbb-951a-76d13f8b932c]633;C# DROP 1 - Checklist ClickUp (etat apres automation)

Date de reference: 2026-04-16
Scope: etat du code dans ce repo + verifications executees sur le VPS.

## Legende
- [x] Termine (peut etre passe en "Done" sur ClickUp)
- [ ] En attente (ne pas passer en "Done")
- [ ] Partiel (garder en "In Progress")

---

## 1) Securite fondation
Statut global: Partiel

- [x] GitHub Dependabot (fichier cree: .github/dependabot.yml)
- [x] Secret scanning (workflow security avec gitleaks)
- [x] CI pipeline (workflow CI backend/frontend)
- [x] Env variables (validation runtime + .env.example + seed admin via env)

Sous-taches:
- [x] Configurer la gestion securisee des variables sensibles
- [x] Configurer la gestion securisee des variables sensibles (doublon conserve tel que fourni)
- [x] Configuration HTTPS & Headers securite (niveau application)

Reste a faire hors code repo (infra/settings):
- [ ] Activation HTTPS au niveau reverse proxy/serveur
- [ ] Activation secret scanning GitHub Advanced Security au niveau repo/org (si requis)
- [ ] Definition des secrets GitHub Actions en settings du repository

---

## 2) Setup Automated Testing Environment
Statut global: Partiel

Sous-taches Back:
- [x] Installer framework test backend (Jest / Pytest selon stack) (Back)
- [x] Configurer tests API (Back) (e2e smoke + script test:api)
- [x] Ajouter script necessaire (Back)
- [x] Installer framework test backend (Jest / Pytest selon stack) (Back) (doublon)
- [x] Configurer tests API (Back) (doublon)

Sous-taches Front:
- [x] Setup test framework (Vitest / Jest) (Front)
- [x] Configurer test composants React (Front)
- [x] Ajouter test runner CI (Front)

Etat execution:
- Front local: OK (`npm run test:ci` passe)
- Back local: OK via runtime Node 22 ponctuel (details section "Diagnostic npm install backend")
- Back CI GitHub: prepare avec Node 22.12 + `prisma generate` explicite

---

## 3) Tests automatiques critiques (Auth + Test Technique)
Statut global: Partiel

Backend tests automatiques:
- [x] register user
- [x] login JWT
- [ ] permission roles A/B/C (partiel: protections en code, couverture auto complete a finir)
- [ ] submit test technique -> calcul score (module non implemente)

---

## 4) Configuration HTTPS & Headers securite
Statut global: Partiel

Sous-taches:
- [x] Setup Security CI/CD Pipeline (security.yml + ci.yml)
- [x] Scan automatique des dependances (dependency-review + dependabot)

---

## 5) Securite infra
Statut global: Partiel

Sous-taches:
- [ ] Securisation acces serveur
- [x] Protection API (Rate Limiting)

---

## 6) Tests Admin + performance
Statut global: En attente

Sous-taches:
- [ ] test endpoints admin
- [ ] test stats globales
- [ ] test acces securise admin
- [ ] debut optimisation DB verifiee par tests

---

## 7) Monitoring securite
Statut global: En attente

Sous-taches:
- [ ] Logs auth
- [ ] Logs erreurs API
- [ ] Alertes anomalies
- [ ] Logs & monitoring securite

---

## 8) Hardening
Statut global: Partiel

Sous-taches:
- [ ] Activer HTTPS sur le serveur de production
- [ ] Mettre en place rate limiting sur endpoints sensibles (partiel: rate limiting global present)
- [ ] Verifier securisation des JWT et permissions par role (partiel)
- [ ] Effectuer test rapide de vulnerabilites courantes (OWASP Top 10)

---

## 9) Tests d'integration complets
Statut global: En attente (bloque par modules metier manquants)

Sous-taches:
- [ ] Creer scripts de tests automatises pour endpoints critiques
- [ ] Verifier workflow end-to-end candidat -> client -> admin
- [ ] Tester integration notifications email et scoring tests
- [ ] Corriger les erreurs identifiees lors des tests

---

## 10) Deploiement production stable
Statut global: En attente

Sous-taches:
- [ ] Preparer environnement production (AWS ECS / CI-CD)
- [ ] Deployer backend et base de donnees PostgreSQL + Redis
- [ ] Effectuer smoke tests post-deploiement
- [ ] Valider fonctionnement end-to-end sur live

---

## Diagnostic npm install backend (demande utilisateur)

Dernieres lignes utiles observees:
- `npm install` backend -> EXIT=0 (installation OK)
- Warnings `EBADENGINE` sur Prisma 7 (`@prisma/client`, `prisma`, etc.)
  - requis: Node `^20.19 || ^22.12 || >=24`
  - VPS actuel: Node `v20.18.1`

Impact:
- `npm install` backend reste OK (malgre warnings engine).
- `prisma generate` echoue avec le Node systeme `v20.18.1`.
- Validation locale backend possible via runtime ponctuel Node 22 sans changer le systeme global.

Validation locale executee sur VPS (2026-04-16):
- `npx -y node@22.12.0 ./node_modules/prisma/build/index.js generate` -> OK
- `npx -y node@22.12.0 ./node_modules/jest/bin/jest.js --config ./test/jest-e2e.json` -> OK (2/2 tests)

Blocage environnement VPS (toujours present pour un run 100% natif):
- Node systeme reste `v20.18.1` (< requis Prisma 7)
- upgrade Node globale via nvm encore instable sur ce VPS (telechargement coupe)

Contournement deja prepare dans le code:
- CI GitHub backend configure en Node 22.12.0 + step `npx prisma generate`
- local: execution backend possible via shim Node 22 (`npx -y node@22.12.0`)

---

## Ce que tu peux marquer "Termine" maintenant dans ClickUp

1. Task 1 -> GitHub Dependabot
2. Task 1 -> Secret scanning (niveau workflow)
3. Task 1 -> CI pipeline (mise en place)
4. Task 1 -> Env variables (niveau code)
5. Task 1 -> Configurer la gestion securisee des variables sensibles (x2)
6. Task 1 -> Configuration HTTPS & Headers securite (niveau app)
7. Task 2 -> Toutes les sous-taches Front
8. Task 2 -> Installer framework test backend
9. Task 2 -> Ajouter scripts necessaires backend
10. Task 2 -> Configurer tests API backend (mise en place)
11. Task 4 -> Setup Security CI/CD Pipeline
12. Task 4 -> Scan automatique des dependances

## A garder en "In Progress"

1. Task 1 global (reste activations infra/settings externes)
2. Task 2 global (execution locale OK via shim Node 22; upgrade Node systeme a finaliser)
3. Task 3 permission roles A/B/C couverture complete
4. Task 5, 6, 7, 8, 9, 10
