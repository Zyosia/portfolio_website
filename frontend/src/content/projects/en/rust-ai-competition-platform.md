---
title: Rust / AI competition platform
summary: A platform where AI programs written in Rust compete at Breakthrough, a strategy board game, with tournaments, scoreboards and game replays.
date: 2025-05-01
tags: [Rust, AI, Game development]
techStack: [Rust, Bevy]
collaboration: team
# TODO(content): replace with a screenshot of the Bevy interface or the terminal menu.
cover: ../../../assets/projects/rust-ai-competition-platform.svg
coverAlt: Cover illustration with the project name and its stack
repositoryUrl: https://github.com/Zyosia/PROJET_E4_RUST
featured: true
draft: false
---

## Overview

A team project at ESIEE Paris, from February to May 2025: a platform to compare Rust programs
playing **Breakthrough**, a two-player strategy board game. Competing AIs are plugged into the
platform and play matches against each other.

## What we built

- **The game engine**: the rules of Breakthrough and the game state.
- **A tournament manager**: add AIs, run every match, score points and display the
  scoreboard.
- **Game history**: every game is recorded and can be replayed move by move.
- **Two interfaces**: an interactive terminal menu and a graphical interface built with
  **Bevy**.
- **A modular Cargo workspace**: board, game engine, tournaments, history, AI management and
  interfaces in separate crates, documented with `cargo doc`.
