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

I designed, built and deployed this site end to end. It also doubles as a concrete
demonstration of the practices behind it: typed and tested code, secured containers, automated
deployment and documented technical decisions.

## What I built

- **Frontend**: a static Astro site, available in French and English. Its accessibility is
  checked automatically with axe, and it scores between 99 and 100 on Lighthouse.
- **Backend**: a FastAPI API handles the contact form. It validates the input, filters out bots
  with a honeypot, limits the number of requests per IP and sends messages through a
  transactional email service. The code is organised by feature, which will make it easy to add
  an AI chatbot later on.
- **Infrastructure**: the site runs in two containers on a VPS. They run without root
  privileges, on a read-only filesystem, with health checks. Caddy sits in front of them and
  handles automatic HTTPS, a strict Content Security Policy and the security headers.
- **CI/CD**: on every change, the pipeline runs linting, type checks and tests (99% backend
  coverage), then scans the images with Trivy and hadolint. The images are published to GHCR
  and deployed over SSH. A health check follows every deployment, and rolling back to the
  previous version takes a single command.
- **Documentation**: every architectural decision is explained in an ADR.
