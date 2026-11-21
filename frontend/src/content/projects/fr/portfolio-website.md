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

Ce site a été conçu, développé et déployé de bout en bout. Il sert aussi de démonstration
concrète des pratiques mises en œuvre : un code typé et testé, des conteneurs sécurisés, un
déploiement automatisé et des choix techniques documentés.

## Réalisations

- **Frontend** : un site statique en Astro, disponible en français et en anglais. Son
  accessibilité est vérifiée automatiquement avec axe, et il obtient entre 99 et 100 sur
  Lighthouse.
- **Backend** : une API FastAPI gère le formulaire de contact. Elle valide les données, filtre
  les robots grâce à un honeypot, limite le nombre de requêtes par IP et envoie les messages via
  un service d’e-mails transactionnels. Le code est organisé par fonctionnalité, ce qui
  facilitera l’ajout d’un futur chatbot IA.
- **Infrastructure** : le site tourne dans deux conteneurs sur un VPS. Ils s’exécutent sans
  droits root, en lecture seule, avec des healthchecks. Caddy est placé devant eux et gère le
  HTTPS automatique, une Content Security Policy stricte et les en-têtes de sécurité.
- **CI/CD** : à chaque modification, le pipeline lance le lint, la vérification des types et
  les tests (99 % de couverture côté backend), puis analyse les images avec Trivy et hadolint.
  Les images sont publiées sur GHCR et déployées par SSH. Un health check suit chaque
  déploiement, et un retour à la version précédente se fait en une seule commande.
- **Documentation** : chaque décision d’architecture est expliquée dans un ADR.
