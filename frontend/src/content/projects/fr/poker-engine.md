---
title: Moteur de poker et application desktop
summary: Un moteur de Texas Hold'em No-Limit écrit en Python, avec une application desktop PySide6, des bots stratégiques et des outils d’analyse.
date: 2026-11-01
tags: [Python, IA, Développement de jeux]
techStack: [Python, PySide6, pytest, uv, Ruff]
collaboration: personal
cover: ../../../assets/projects/poker-engine.png
coverAlt: Capture d’écran d’une table de cash game, avec le panneau d’actions et l’historique des mains
repositoryUrl: https://github.com/Zyosia/poker_app
featured: true
draft: false
---

## Présentation

Un projet personnel commencé en juillet 2026 et toujours en évolution : un moteur de Texas
Hold'em fiable et extensible, devenu une application desktop complète. Captures et animations
de chaque mode sur la [page de démo](https://github.com/Zyosia/poker_app/blob/main/DEMO.md).

## Réalisations

- **Le moteur de règles** : ordre de parole, all-in et short all-in, side pots et pots
  partagés, évaluation des mains. Il avance pas à pas, l’interface ne bloque donc jamais.
- **Une architecture en couches** : moteur → application → interface, avec une seule
  direction de dépendance. Le moteur ignore tout de l’interface et des bots.
- **L’application desktop** : cash game du heads-up à la table pleine, tournois, Spin & Go,
  multi-tabling, replayer de mains, calculateur d’équité et import d’historiques PokerStars /
  Winamax.
- **Des bots stratégiques** : équité par Monte Carlo, modélisation des ranges adverses et
  décisions à l’espérance de gain ; push/fold heads-up résolu par **CFR+** (équilibre de Nash).
- **Une Bot Arena** pour mesurer les bots entre eux par simulations sans interface.
- **Qualité** : plus de 1 900 tests, et conservation des jetons vérifiée après chaque main.
