# The Atelier

The Atelier is a local-only digital wardrobe and lookbook studio built with React, TypeScript, Vite, and Bun.

This product is intentionally designed without a backend:

- No server
- No sign-up or login
- No cloud sync
- No AI auto-analysis

All wardrobe data, uploaded images, lookbooks, preferences, and cached weather state stay in the browser on the current device/profile.

## Product Scope

The app includes:

- Home dashboard with wardrobe stats, recent items, current weather, and rule-based recommendations
- Wardrobe catalog with search, sorting, favorites, and archive handling
- Item registration with hero image, palette colors, metadata assets, style notes, and draft/saved states
- Lookbook maker with free-form composition, layer controls, local save, and PNG export
- Settings for theme, language, motion, units, manual weather fallback, and local data reset

## Tech Stack

- React 18
- TypeScript
- Vite
- Bun
- Dexie + IndexedDB
- Zustand
- React Router
- React Konva
- Vite PWA plugin
- Bun test + Testing Library + happy-dom

## Local-Only Architecture

- Persistent product data: IndexedDB via Dexie
- Lightweight preferences: localStorage via Zustand persist
- Weather source: Open-Meteo public API
- Offline behavior: PWA shell + cached assets + cached weather responses
- Deployment target: GitHub Pages

The app never sends wardrobe or lookbook data to a remote service.

## Project Structure

```text
src/
  app/         App shell, routing, lazy-loaded pages, PWA entry
  features/    Home, wardrobe, register, lookbook, settings
  lib/         DB, i18n, media, recommendation, state, weather, utils
tests/
  browser/     App-level browser flows
  unit/        Domain and adapter tests
```

## Getting Started

### Requirements

- [Bun](https://bun.sh/)

### Install

```bash
bun install
```

### Run locally

```bash
bun run dev
```

### Build

```bash
bun run build
```

### Preview production build

```bash
bun run preview
```

## Testing

Run the full test suite:

```bash
bun test
```

Watch mode:

```bash
bun test --watch
```

The test suite covers:

- Dexie repository behavior
- Preferences persistence
- i18n fallback behavior
- Weather adapter mapping
- Recommendation engine scoring
- Browser flows for theme/language switching, item registration, lookbook save, manual weather override, and local data reset

## Visual CI Screenshots

Pull requests also run a visual smoke pass in GitHub Actions:

- Build the production preview
- Capture representative screenshots with a headless Chromium browser
- Upload the PNGs as a workflow artifact
- Post or update a pull request comment with a link to the screenshot artifact

Current captures include desktop views for Home, Wardrobe, Register, and Lookbook, plus a mobile Settings capture that shows the sheet-style secondary controls.

## GitHub Pages Deployment

This repository is configured to deploy automatically from `main` with GitHub Actions.

Deployment flow:

1. `bun install --frozen-lockfile`
2. `bun test`
3. `bun run build`
4. Upload `dist/`
5. Deploy to GitHub Pages

Important implementation detail:

- [`vite.config.ts`](./vite.config.ts) uses the GitHub Pages repository name (`closet-v3`) as the production `base`
- [`404.html`](./404.html) provides SPA fallback behavior for deep links

## Notes

- Seed data is loaded only on first run
- If the user clears local product data, the app does not auto-restore the seed afterward
- Data is tied to the current browser profile and device
- Weather fallback can be switched to manual mode from Settings
