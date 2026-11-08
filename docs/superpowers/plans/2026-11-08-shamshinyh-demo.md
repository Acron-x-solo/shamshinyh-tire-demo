# Shamshinyh Workshop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Create and publish another complete tyre-workshop demo with a distinct light cobalt visual identity and real source data.

**Architecture:** React/Vite static site with a shared business source module, service selection, source-backed price list, inquiry builder and native photo dialog. Reuse the proven Three.js scene lifecycle while changing its materials and layout for the new studio.

**Tech Stack:** React19, Vite7, Motion12, Three.js0.181, Lucide, Playwright/axe.

**Spec:** docs/superpowers/specs/2026-11-08-shamshinyh-design.md.

## Global Constraints
- Exact firmID70000001025191287; keep previous demos unchanged.
- Frontend5175, preview4175, repository shamshinyh-tire-demo.
- Every published price and real downloaded workshop photo carries source semantics; no invented price calculations or booking confirmations.
- All appointment CTAs lead to #contacts; original photographer attribution retained.

## Review Focus
- Historic or unpublished size pricing must not be portrayed as a current fixed quotation.
- Missing WebGL and reduced motion must leave meaningful content and accessible controls.
- Narrow phones and landscape dialogs must not clip actions or create page overflow.
- Native gallery must trap focus, close on Escape and restore its trigger.
- All assets must load through the repository prefix on GitHub Pages.

## Task1: Source data and working page
- [x] Verify full firm HTML, catalogue pagination, price-image album and contact links; save docs/source-facts.json and attribution.
- [x] Create package/index/styles/data and the page components; locally host Unbounded/GolosText.
- [x] Start frontend5175 early, before polishing details.
- [x] Add meaningful failing checks for inquiry parameters, gallery and contact behavior, then implement and verify.

## Task2: Visual and interaction delivery
- [x] Build the light hero, cobalt 3D stage, photo service selector, complete source prices, inquiry, real gallery and blue contacts.
- [x] Preserve GPU lifecycle, WebGL fallback/loss/restore, pause and reduced motion.
- [x] Inspect desktop/mobile screenshots and revise verified problems.

## Task3: Verify and publish
- [x] Run unit/browser/axe, formatting, build, DESIGN lint and strict audit.
- [x] Request a fresh read-only whole-project reviewer, resolve important findings.
- [ ] Verify production asset prefix, commit/push and wait for Pages success.
- [ ] Verify the public site and report the finished link.
