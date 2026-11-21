---
title: Ce site portfolio
summary: Développé from scratch et auto-hébergé de A à Z — site statique Astro, API FastAPI, conteneurs Docker derrière Caddy, CI/CD avec GitHub Actions.
date: 2026-11-18
tags: [DevOps, Web, Python]
techStack: [Astro, TypeScript, Tailwind CSS, FastAPI, Docker, Caddy, GitHub Actions]
collaboration: personal
cover: ../../../assets/projects/portfolio-website.svg
coverAlt: Illustration de couverture avec le nom du projet et ses technologies
repositoryUrl: https://github.com/Zyosia/portfolio_website
featured: true
draft: false
---

## Présentation

Le site que vous lisez, conçu, développé et déployé de A à Z. Il se veut la preuve des
pratiques qu’il décrit : code typé, tests, conteneurs durcis, livraison automatisée et
décisions documentées.

## Réalisations

- **Frontend** : site statique Astro, bilingue (français / anglais), accessible (contrôles axe
  automatisés) et rapide (Lighthouse 99–100).
- **Backend** : API FastAPI pour le formulaire de contact, avec validation, honeypot, limitation
  du débit par IP et envoi d’e-mails via un fournisseur transactionnel. Organisée par
  fonctionnalité, prête pour un futur chatbot IA.
- **Infrastructure** : deux conteneurs sur un VPS (non-root, lecture seule, healthchecks)
  derrière Caddy : HTTPS automatique, Content Security Policy stricte, en-têtes de sécurité.
- **CI/CD** : lint, vérification des types, tests (99 % de couverture côté backend), scans
  Trivy et hadolint, images publiées sur GHCR, déploiement SSH avec health check et rollback en
  une commande.
- **Documentation** : chaque choix d’architecture consigné dans un ADR.
