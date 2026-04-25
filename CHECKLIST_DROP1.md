# Checklist ClickUp — OPSIDE DROP 1

Ce fichier suit l'avancement des tâches et sous-tâches du **Drop 1**.

**Légende :**
- `[ ]` En attente
- `[/]` En cours
- `[x]` Achevé
- `[o]` Mis à jour

---

## 1. Sécurité fondation
- [x] GitHub Dependabot
- [x] Secret scanning
- [x] CI pipeline
- [x] Configuration des variables d'environnement (`.env.example`)
- [x] Configurer la gestion sécurisée des variables sensibles
- [x] Configuration HTTPS & Headers de sécurité (Nginx)

## 2. Setup Automated Testing Environment
- [x] Installer framework test backend (Jest)
- [/] Configurer tests API (Backend)
- [x] Ajouter les scripts nécessaires dans `package.json`
- [x] Setup test framework frontend (Vitest)
- [/] Configurer test composants React (Frontend)
- [x] Ajouter test runner CI (GitHub Actions)

## 3. Tests automatiques critiques (Auth + Test Technique)
- [x] Backend tests automatiques
- [x] Créer tests pour : register user
- [x] Créer tests pour : login JWT
- [x] Créer tests pour : permission rôles A/B/C
- [x] Créer tests pour : submit test technique → calcul score

## 4. Configuration HTTPS & Headers sécurité (Consolidation)
- [o] Setup Security CI/CD Pipeline
- [o] Scan automatique des dépendances

## 5. Sécurité infra
- [x] Sécurisation accès serveur (SSH/Scripts de déploiement)
- [x] Protection API (Rate Limiting NestJS Throttler)

## 6. Tests Admin + performance
- [/] Test endpoints admin
- [/] Test stats globales (Dashboard Admin)
- [x] Test accès sécurisé admin (RolesGuard)
- [/] Début optimisation DB (Indexes recommandés)

## 7. Monitoring sécurité
- [x] Logs auth
- [x] Logs erreurs API (Global Exception Filter)
- [ ] Alertes anomalies
- [/] Logs & monitoring sécurité globaux

## 8. Hardening
- [o] Activer HTTPS sur le serveur de production (VPS)
- [o] Mettre en place rate limiting sur endpoints sensibles
- [o] Vérifier sécurisation des JWT et permissions par rôle
- [/] Effectuer test rapide de vulnérabilités courantes (OWASP Top 10)

## 9. Tests d'intégration complets
- [/] Créer scripts de tests automatisés pour endpoints critiques
- [/] Vérifier workflow end-to-end candidat → client → admin
- [/] Tester intégration notifications email et scoring tests
- [ ] Corriger les erreurs identifiées lors des tests

## 10. Déploiement production stable
- [/] Préparer environnement production (AWS ECS / CI-CD)
- [x] Déployer backend et base de données PostgreSQL
- [x] Effectuer smoke tests post-déploiement
- [/] Valider fonctionnement end-to-end sur live
