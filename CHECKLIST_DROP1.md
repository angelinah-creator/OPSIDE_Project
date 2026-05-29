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
- [x] Configuration des variables d'environnement (`.env.production` fixée avec JWT sécurisés)
- [x] Configurer la gestion sécurisée des variables sensibles
- [x] Configuration HTTPS & Headers de sécurité (Nginx préparé)

## 2. Setup Automated Testing Environment
- [x] Installer framework test backend (Jest)
- [x] Configurer tests API (Backend - Stable)
- [x] Ajouter les scripts nécessaires dans `package.json`
- [x] Setup test framework frontend (Vitest)
- [x] Configurer test composants React (Frontend - Stable)
- [x] Ajouter test runner CI (GitHub Actions)

## 3. Tests automatiques critiques (Auth + Test Technique)
- [x] Backend tests automatiques
- [x] Créer tests pour : register user
- [x] Créer tests pour : login JWT
- [x] Créer tests pour : permission rôles A/B/C
- [x] Créer tests pour : submit test technique → calcul score

## 4. Configuration HTTPS & Headers sécurité (Consolidation)
- [x] Setup Security CI/CD Pipeline
- [x] Scan automatique des dépendances

## 5. Sécurité infra
- [x] Sécurisation accès serveur (Watchdog v2 + Automation)
- [x] Protection API (Rate Limiting NestJS Throttler configuré)

## 6. Tests Admin + performance
- [x] Test endpoints admin (Validé via Panel-Ops)
- [x] Test stats globales (Dashboard Admin - Temps réel ajouté)
- [x] Test accès sécurisé admin (RolesGuard)
- [/] Début optimisation DB (Indexes recommandés)

## 7. Monitoring sécurité
- [x] Logs auth
- [x] Logs erreurs API (Global Exception Filter)
- [x] Alertes anomalies (Via Watchdog v2)
- [x] Logs & monitoring sécurité globaux (Panel-Ops à jour)

## 8. Hardening
- [x] Activer HTTPS sur le serveur de production (VPS - SSL opsideworks.com OK)
- [x] Mettre en place rate limiting sur endpoints sensibles
- [x] Vérifier sécurisation des JWT et permissions par rôle
- [/] Effectuer test rapide de vulnérabilités courantes (OWASP Top 10)

## 9. Tests d'intégration complets
- [x] Créer scripts de tests automatisés pour endpoints critiques
- [x] Vérifier workflow end-to-end candidat → client → admin
- [x] Tester intégration notifications email et scoring tests
- [x] Corriger les erreurs identifiées lors des tests

## 10. Déploiement production stable
- [x] Préparer environnement production (Backend/Frontend ports 3101/3102)
- [x] Déployer backend et base de données PostgreSQL (Stable)
- [x] Effectuer smoke tests post-déploiement (Passé)
- [x] Valider fonctionnement end-to-end sur live (Status Panel-Ops OK)
