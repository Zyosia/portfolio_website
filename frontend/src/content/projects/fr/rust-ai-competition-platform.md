---
title: Plateforme de compétition Rust / IA
summary: Une plateforme où des IA écrites en Rust s’affrontent au jeu de stratégie Breakthrough, avec tournois, tableau des scores et replays des parties.
date: 2025-05-01
tags: [Rust, IA, Développement de jeux]
techStack: [Rust, Bevy]
collaboration: team
# TODO(content): remplacer par une capture de l’interface Bevy ou du menu terminal.
cover: ../../../assets/projects/rust-ai-competition-platform.svg
coverAlt: Illustration de couverture avec le nom du projet et ses technologies
repositoryUrl: https://github.com/Zyosia/PROJET_E4_RUST
featured: true
draft: false
---

## Présentation

Un projet de groupe à l’ESIEE Paris, de février à mai 2025 : une plateforme pour comparer des
programmes Rust appliqués à **Breakthrough**, un jeu de stratégie à deux joueurs. Des IA
concurrentes sont intégrées à la plateforme et s’affrontent.

## Réalisations

- **Le moteur de jeu** : les règles de Breakthrough et l’état de la partie.
- **Un gestionnaire de tournois** : ajout d’IA, lancement de toutes les parties, attribution
  des points et tableau des scores.
- **L’historique des parties** : chaque partie est enregistrée et peut être rejouée coup par
  coup.
- **Deux interfaces** : un menu interactif dans le terminal et une interface graphique
  développée avec **Bevy**.
- **Un workspace Cargo modulaire** : plateau, moteur de jeu, tournois, historique, gestion des
  IA et interfaces dans des crates séparées, documentées avec `cargo doc`.
