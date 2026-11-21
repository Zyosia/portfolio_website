---
title: Poker engine and desktop app
summary: A No-Limit Texas Hold'em engine written in Python, with a PySide6 desktop app, strategy bots and analysis tools.
date: 2026-11-01
tags: [Python, AI, Game development]
techStack: [Python, PySide6, pytest, uv, Ruff]
collaboration: personal
cover: ../../../assets/projects/poker-engine.png
coverAlt: Screenshot of a cash game table, with the action panel and the hand history
repositoryUrl: https://github.com/Zyosia/poker_app
featured: true
draft: false
---

## Overview

A personal project started in July 2026 and still evolving: a reliable, extensible Texas
Hold'em engine, turned into a complete desktop application. Screenshots and animations of
every mode are on the [demo page](https://github.com/Zyosia/poker_app/blob/main/DEMO.md).

## What I built

- **The rules engine**: action order, all-ins and short all-ins, side pots and split pots,
  hand evaluation. It is driven one step at a time, so the interface never blocks.
- **A layered architecture**: engine → application → interface, with a single dependency
  direction. The engine knows nothing about the UI or the bots.
- **The desktop app**: cash games from heads-up to full ring, tournaments, Spin & Go,
  multi-tabling, hand replayer, equity calculator and PokerStars / Winamax hand history import.
- **Strategy bots**: Monte Carlo equity, opponent range modelling and expected-value decisions;
  heads-up push/fold solved with **CFR+** (Nash equilibrium).
- **A Bot Arena** to measure bots against each other in headless simulations.
- **Quality**: more than 1,900 tests, and chip conservation checked after every hand.
