---
title: This portfolio website
summary: Built from scratch and self-hosted end to end — static Astro site, FastAPI API, Docker containers behind Caddy, CI/CD with GitHub Actions.
date: 2026-11-18
tags: [DevOps, Web, Python]
techStack: [Astro, TypeScript, Tailwind CSS, FastAPI, Docker, Caddy, GitHub Actions]
collaboration: personal
cover: ../../../assets/projects/portfolio-website.svg
coverAlt: Cover illustration with the project name and its stack
repositoryUrl: https://github.com/Zyosia/portfolio_website
featured: true
draft: false
---

## Overview

The site you are reading, designed, built and deployed from A to Z. It is meant to be evidence
of the practices it describes: typed code, tests, hardened containers, automated delivery and
documented decisions.

## What I built

- **Frontend**: static Astro site, bilingual (French / English), accessible (automated axe
  checks) and fast (Lighthouse 99–100).
- **Backend**: FastAPI API for the contact form, with validation, honeypot, per-IP rate limiting
  and email through a transactional provider. Organised by feature, ready for a future AI
  chatbot.
- **Infrastructure**: two containers on a VPS (non-root, read-only, health checks) behind Caddy:
  automatic HTTPS, strict Content Security Policy, security headers.
- **CI/CD**: lint, type checks, tests (99% backend coverage), Trivy and hadolint scans, images
  pushed to GHCR, SSH deployment with a health check and one-command rollback.
- **Documentation**: every architectural choice recorded as an ADR.
