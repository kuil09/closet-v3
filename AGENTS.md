# AGENTS.md

This file is the maintenance guide for coding agents working in this repository.

## Mission

Keep The Atelier healthy as a `local-only` wardrobe and lookbook product.

The product must remain:

- Backend-free
- Account-free
- Cloud-sync-free
- AI-auto-analysis-free

All user data stays in the browser via IndexedDB and localStorage.

## Product Guardrails

Do not add:

- Servers or server APIs
- Authentication or user accounts
- Remote databases or sync services
- AI tagging, AI image analysis, or AI outfit generation
- Import/export or backup features unless explicitly requested

Prefer:

- Local-first persistence
- Explainable rule-based behavior
- Fast, direct UI flows
- Progressive disclosure for rare controls

## Tech Stack

- React 18
- TypeScript
- Vite
- Bun
- Dexie for IndexedDB
- Zustand for lightweight persisted preferences
- React Router
- React Konva for the lookbook canvas
- Vite PWA plugin
- Bun test + Testing Library + happy-dom
- Playwright only for CI screenshot capture

## Important Paths

- [`src/app`](/Users/al03140583/Developer/closet-v3/src/app): app shell, routing, boot flow
- [`src/features`](/Users/al03140583/Developer/closet-v3/src/features): product screens
- [`src/features/shared`](/Users/al03140583/Developer/closet-v3/src/features/shared): shared UI pieces like disclosure sections and image rendering
- [`src/lib/db`](/Users/al03140583/Developer/closet-v3/src/lib/db): Dexie schema, seed data, repositories, product types
- [`src/lib/state`](/Users/al03140583/Developer/closet-v3/src/lib/state): persisted preference state
- [`src/lib/weather`](/Users/al03140583/Developer/closet-v3/src/lib/weather): Open-Meteo integration and weather hooks
- [`src/lib/recommendation`](/Users/al03140583/Developer/closet-v3/src/lib/recommendation): rule-based recommendation engine
- [`tests/browser`](/Users/al03140583/Developer/closet-v3/tests/browser): app-level browser flows
- [`tests/unit`](/Users/al03140583/Developer/closet-v3/tests/unit): unit coverage for core domain logic
- [`.github/workflows/ci.yml`](/Users/al03140583/Developer/closet-v3/.github/workflows/ci.yml): PR validation + screenshot comments
- [`.github/workflows/deploy.yml`](/Users/al03140583/Developer/closet-v3/.github/workflows/deploy.yml): GitHub Pages deployment

## Working Rules

### 1. Preserve local-only architecture

If a feature seems to need a server, stop and reconsider. This repository is intentionally designed to avoid one.

### 2. Keep state boundaries clear

- IndexedDB stores product data: items, lookbooks, images, weather cache
- Zustand/localStorage stores lightweight app preferences
- UI-only disclosure state can stay in localStorage when it does not belong in product data

Do not blur those layers without a strong reason.

### 3. Favor progressive disclosure

This codebase intentionally hides rare controls behind collapsible sections or mobile sheets. New settings or advanced controls should usually follow that pattern.

### 4. Respect GitHub Pages constraints

- Production `base` is `/closet-v3/`
- Deep links rely on [`404.html`](/Users/al03140583/Developer/closet-v3/404.html)
- Avoid features that require secrets or server rendering

### 5. Update tests with behavior changes

If UI flow, persistence, routing, or weather behavior changes, update the relevant browser tests.

## Commands

Install dependencies:

```bash
bun install
```

Run dev server:

```bash
bun run dev
```

Run tests:

```bash
bun test
```

Build production output:

```bash
bun run build
```

Run production preview:

```bash
bun run preview
```

CI visual smoke screenshot helpers:

```bash
bun run preview:ci
bun run ci:screenshots
```

## Testing Expectations

Before closing meaningful changes, run:

```bash
bun test
bun run build
```

When working on CI screenshot logic, also ensure the script remains syntactically valid:

```bash
node --check scripts/capture-ci-screenshots.mjs
```

## UI and UX Expectations

- Keep the top-level screens focused: Home, Wardrobe, Register, Lookbook, Settings
- Primary actions should remain immediately visible
- Rare actions should be tucked into disclosure sections
- Mobile should use sheet-style access for secondary controls when appropriate
- Keep accessibility labels intact so the browser tests remain meaningful

## Persistence and Seed Data

- Seed data loads only on first run
- If the user clears local data, do not silently restore the seed afterward
- Browser profile is the source of truth

## CI Expectations

Pull requests should:

- Pass `bun test`
- Pass `bun run build`
- Produce visual smoke screenshots
- Leave a PR comment with the screenshot artifact link

Main branch pushes should continue to deploy to GitHub Pages.

## Git Workflow For This Project

The current project rule is:

- Make the change
- Verify it
- Commit it immediately
- Push it immediately

Do not leave completed local changes uncommitted unless the user explicitly asks for that.

## When Unsure

If a proposed change conflicts with `local-only`, `GitHub Pages static hosting`, or the product's progressive-disclosure UX direction, choose the conservative option and keep the architecture simple.
