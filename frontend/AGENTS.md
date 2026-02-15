# AGENTS GUIDE

This repository is a Vue 2 + Vite SPA with Element UI. Keep changes small, follow existing patterns, and avoid refactors during fixes.

## Quick Facts
- Framework: Vue 2.6 (Options API)
- Build tool: Vite 5
- UI: Element UI 2
- Router: Vue Router 3
- Node: 22.x (see package.json)
- No automated tests currently

## Commands (local)
- Install: `yarn install`
- Dev server: `yarn dev`
- Build: `yarn build`
- Preview build: `yarn preview`
- Lint: `yarn lint`

## Single-Test / Focused Runs
- There is no test runner configured (no Jest/Vitest scripts).
- If you add tests later, document the single-test command here.

## CI / Workflows
- Build on push to `master` and `dev`: `.github/workflows/build.yml` runs `yarn install` + `yarn build`.
- Docker build+push on `master`: `.github/workflows/docker-build-push.yml`.

## Repository Layout
- `src/main.js`: app bootstrap, plugin setup, Vue mount
- `src/router/index.js`: router (history mode)
- `src/views/Subconverter.vue`: main screen
- `src/components/`: UI components
- `src/composables/`: shared logic
- `src/services/`: API adapters
- `src/utils/`: utility helpers
- `src/config/`: env-backed constants and option lists
- `src/icons/svg`: SVG sprite inputs
- `services/`: docker compose stack

## Code Style (Observed + ESLint)
- Indentation: 2 spaces
- Quotes: single quotes are preferred in most files
- Semicolons: not used (`semi: 0`)
- Vue component names: single-word allowed (`vue/multi-word-component-names: off`)
- Console/debugger: forbidden in production (`no-console`, `no-debugger`)

## Imports & Modules
- Use ES modules (`import`/`export`).
- Prefer absolute alias `@` for `src/` (see `vite.config.js`).
- Keep import groups readable: core libs, local config/utils, services, components.
- Dynamic import only used for route lazy-load.

## Vue Patterns
- Options API is used across components.
- Component file structure: `<template>`, `<script>`, `<style>`.
- Keep reactive state in `data()`; derived state in `computed`.
- Use composables from `src/composables/` for shared logic.

## Services & Error Handling
- Service classes in `src/services/*Service.js` handle API calls.
- Prefer explicit error messages with `Error` instances.
- UI errors are surfaced with `this.$message.*` or `this.$notify`.
- Silent failures are acceptable only when UX demands it (e.g., backend version fetch).

## Validation
- Use validators from `src/utils/validators.js` for user-facing checks.
- Return `{ valid, message }` or booleans; avoid throwing for validation flow.

## Environment Variables
- Use `import.meta.env` with `VITE_` prefix.
- Key constants live in `src/config/constants.js`.
- Do not commit local env files (`.env.local`, `.env.*.local`).

## Icons
- SVG sprites via `vite-plugin-svg-icons` and `src/icons/svg`.
- Use `<svg-icon icon-class="name" />`.

## Storage
- Local storage helpers live in `src/utils/storage.js`.
- TTL-based caching is already implemented; reuse it.

## Linting
- ESLint config: `.eslintrc.js`.
- If you add new rules, keep consistent with current minimal setup.

## Formatting
- No Prettier config present; rely on ESLint and existing style.
- Keep formatting consistent with nearby code.

## Git Hygiene
- Do not commit `dist/`, `node_modules/`, `.env.local`, `.env.*.local`.
- Avoid adding generated files.

## Frontend Safety
- Avoid adding inline styles unless already used in nearby code.
- Prefer Element UI components and existing patterns.
- Keep UX messages consistent with existing language (mostly Chinese UI strings).

## Performance Notes
- Do not introduce heavy deps; prefer existing utilities.
- Keep network calls centralized in `src/services`.

## Example Patterns
- Router lazy-load: `component: () => import('../views/Subconverter.vue')`
- Service class: `export class BackendService { static async ... }`
- Composable: `export function useSubscription() { return { ... } }`

## Cursor / Copilot Rules
- No Cursor rules found (`.cursor/rules`, `.cursorrules` absent).
- No Copilot instructions found (`.github/copilot-instructions.md` absent).

## If You Add Tests Later
- Document the runner and single-test command here.
- Keep test files near the logic or under a dedicated `tests/` folder.

## Suggested Manual Checks
- `yarn lint`
- `yarn build`
- Run dev server and smoke the main screen

## Notes for Agents
- Follow existing patterns and minimize scope.
- No large refactors unless explicitly requested.
- Avoid introducing TypeScript or new tooling without approval.
