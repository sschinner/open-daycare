<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

## MCPs

- Playwright Screenshots y cualquier cosa relacionada a Playwright tienen que estar en la carpeta .playwright-mcp.
- Context7 Usaremos este MCP para trear la documentación actualizada del Framework.

<!-- END:nextjs-agent-rules -->

# Project notes

## Stack

- Next.js 16.3.5 (App Router) + React 19 + TypeScript strict. Tailwind v4 (CSS-first config in `app/globals.css` via `@import "tailwindcss"` — there is **no** `tailwind.config.*` file).
- Path alias `@/*` maps to the repo root (`tsconfig.json`).
- Target app: "open-daycare". UI copy is in **Spanish** — match it.

## Commands

- `npm run dev` — dev server (re-adds the Next.js agent-rules block above).
- `npm run lint` — ESLint only (flat config, `eslint.config.mjs`).
- `npm run build` — production build (performs type checking).
- There is **no test framework and no test script** in this repo.

## References (design sources, read-only)

- `references/pantallas/*.dc.html` — generated standalone screen mockups; `references/screenshots/*.png` — screenshots. Use them as the UI source of truth for building screens.
- Do **not** edit files under `references/`. They are generated (`references/pantallas/support.js` header); the `dc-runtime` generator is not vendored in this repo.

## Working on features

- Use the **`spec`** skill to design a new feature; specs go in `specs/` (folder does not exist yet). The **`spec-impl`** skill implements an approved spec.
- Specs are written in the same language as the conversation (Spanish unless prompted otherwise).

## Reglas de código

- User código limpio, nombres, funciones, variables, etc. en inglés.