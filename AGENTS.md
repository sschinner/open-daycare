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
- Backend: Supabase. La app accede a la base **exclusivamente con los paquetes oficiales de Supabase para Next.js** (`@supabase/supabase-js` + `@supabase/ssr`) a través de los helpers de `utils/supabase/` — ver la sección **Capa de datos en la app**. Los specs 01–06 todavía muestran mocks de `data/`.

## Commands

- `npm run dev` — dev server (re-adds the Next.js agent-rules block above).
- `npm run lint` — ESLint only (flat config, `eslint.config.mjs`).
- `npm run build` — production build (performs type checking).
- There is **no test framework and no test script** in this repo.

## Supabase

- Proyecto: `kvisrrdefgoayoaezgti` → API en `https://kvisrrdefgoayoaezgti.supabase.co`.
- La contraseña de la DB está en `.env` (`SUPABASE_DB_PASSWORD`); `.env` está gitignored y `.env.template` es el archivo commiteado. Nunca hardcodear credenciales en el código.
- El MCP de Supabase está configurado **globalmente** en `~/.config/opencode/opencode.jsonc` (no en el `opencode.json` del repo) con las features `docs, account, database, debugging, development, functions, branching`.
- Antes de cualquier tarea de Supabase, cargar la skill `supabase` (ver abajo) y verificar contra la documentación actual, no contra memoria del modelo.
- Tools de inspección (solo lectura): `supabase_list_tables`, `supabase_list_migrations`, `supabase_get_advisors`, `supabase_list_extensions` y `supabase_execute_sql`.

## Capa de datos en la app

La app habla con Supabase **solo** a través de los paquetes oficiales para Next.js: `@supabase/supabase-js` y `@supabase/ssr`. Nada de `fetch` a la API REST, `axios`, el SDK de Python, o cualquier otro camino: un cliente por tipo de componente, y siempre a través de estos helpers.

- **`utils/supabase/client.ts`** — `createClient()` para Client Components y cualquier código que corre en el browser. Envolvente de `createBrowserClient` de `@supabase/ssr`.
- **`utils/supabase/server.ts`** — `createClient()` **async** para Server Components, Server Actions y Route Handlers. Hace `await cookies()` internamente, así que el call site es `const supabase = await createClient()`; no hay que pasarle `cookieStore`.
- **`utils/supabase/proxy.ts`** — `updateSession(request)`, la lógica de refresco de sesión.
- **`proxy.ts`** (raíz) — el archivo que Next lee; solo delega en `updateSession`. Ojo: en Next 16 la convención `middleware.ts` fue renombrada a **`proxy.ts`** y `middleware` está deprecada. No crear `middleware.ts`.
- Cada cliente se crea **por request**, nunca en un módulo compartido a nivel de scope.

Reglas de auth (verificadas contra la doc actual, no de memoria):

- En el server, para **verificar identidad** usar `supabase.auth.getClaims()`; `getUser()` solo cuando haga falta el record actualizado del user (hace una llamada de red). `getSession()` no verifica nada: no usarlo para decisiones de autorización.
- Server Components no pueden escribir cookies; por eso el refresco vive en `proxy.ts`. El `catch` del `setAll` en `server.ts` es esperado y se ignora a propósito.
- `getClaims()` verifica el token y refresca las cookies de request y response — **no correr nada entre `createServerClient` y `getClaims()`**.
- Nunca exponer la `service_role` / secret key. Todo lo del cliente es `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; el secreto de la DB solo vive en `.env`.

Variables: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local` (gitignored) y en `.env-template`. Nunca hardcodearlas en el código.

Pendiente: los tipos de la DB todavía **no** están generados. Cuando se hagan, el output de `supabase_generate_typescript_types` va a un archivo commiteado y los clientes se tipan contra ese `Database`.

## Migraciones — siempre, sin excepciones

**Todo cambio en la base de datos va en una migración.** No hay atajo: DDL, DML, RLS, funciones, `grant`/`revoke`, índices y seeds. Nada de "SQL rápido" para una sola operación.

- **Nunca** aplicar DDL/DML con `supabase_execute_sql`. Ese tool es **solo lectura**: sirve para consultar el catálogo y verificar, no para modificar. Si el SQL modifica algo, es una migración.
- **Siempre** `supabase_apply_migration`, con `name` en `snake_case` y en inglés (`create_daycares`, `add_email_to_users`, `seed_daycares`).
- **Siempre** guardar el SQL en `supabase/migrations/<version>_<name>.sql` en el **mismo paso**, con la **versión exacta** que devuelve el MCP. El repo es la fuente auditable del schema; si el archivo y el historial divergen, `supabase db pull` rompe.
- El historial remoto es **inmutable**: una migración aplicada no se edita ni se borra. Para corregir algo se escribe otra migración nueva.
- **DDL y DML van en migraciones separadas**: `create_<tabla>` para el schema, `seed_<tabla>` para los datos. No se mezclan.
- Convención del SQL: minúsculas, `snake_case` sin comillas, `uuid` + `gen_random_uuid()` para ids, `text` en vez de `varchar(n)`, `timestamptz` en vez de `timestamp`, RLS habilitado desde la creación de cada tabla.
- El schema completo está descrito en `../07-DB-Schema` (reference `docs` en `opencode.json`). Es **solo referencia**: no se modifica y no se implementa entero de una; cada tabla se migra en su propia spec.
- Antes de dar por terminada una tarea de DB, verificar: `supabase_list_migrations` muestra la migración nueva y el `.sql` local tiene esa misma versión.

## Estado actual de la base

- `public` tiene 1 tabla: `daycares` (`id`, `name`, `created_at`), RLS habilitado sin policies (deny-by-default), 4 filas de seed.
- La capa de datos en la app está montada (helpers de `utils/supabase/` + `proxy.ts`) pero **ninguna pantalla la consume todavía**: specs 01–06 siguen con mocks en `data/`.
- El historial remoto tiene 5 migraciones: `create_test_table` ×2 y `drop_test_table` (basura de una prueba previa; inmutable e inofensiva), más `create_daycares` y `seed_daycares`.

## Skills

Instaladas con `npx skills add` (origen `supabase/agent-skills`), registradas en `skills-lock.json`:

- **`supabase`** (`.agents/skills/supabase/SKILL.md`) — cargar para cualquier tarea que toque Supabase: cliente JS y SSR en Next.js, auth/cookies/JWT, RLS, migraciones, Edge Functions, Realtime, Storage, logs. Cubre trampas de seguridad conocidas (no usar `user_metadata` para autorización, RLS en todo schema expuesto, granting de la Data API).
- **`supabase-postgres-best-practices`** (`.agents/skills/supabase-postgres-best-practices/SKILL.md`) — cargar **antes** de escribir o modificar cualquier cosa en Postgres: tipos de columna, schema design, índices, RLS, funciones, particionado. Las reglas están en `references/` con prefijo por categoría (`query-`, `conn-`, `security-`, `schema-`, `lock-`, `data-`, `monitor-`, `advanced-`); leer el archivo concreto de la regla, no las 40.
- Location canónica: `.agents/skills/`. `.claude/skills/` contiene symlinks a las mismas (compatibilidad con Claude Code). Las copias en `agent/skills/` y `data/skills/` son basura del instalador: no editarlas ni usarlas.

## References (design sources, read-only)

- `references/pantallas/*.dc.html` — generated standalone screen mockups; `references/screenshots/*.png` — screenshots. Use them as the UI source of truth for building screens.
- Do **not** edit files under `references/`. They are generated (`references/pantallas/support.js` header); the `dc-runtime` generator is not vendored in this repo.

## Working on features

- Use the **`spec`** skill to design a new feature. Specs for features go in `specs/`. **Specs related to the database (migrations, schema, RLS, seeds, Postgres functions, indexes, etc.) must always be created in `specs/databases/`, not in `specs/`.**
- The **`spec-impl`** skill implements an approved spec.
- Use the **`spec-check`** agent (`.opencode/agent/spec-check.md`) to verify the acceptance criteria of an implemented spec against the code. Run it after `spec-impl`, passing the spec name (e.g. `01-feed-home`). It reviews, fixes and marks the `## Criterios de aceptación` checks, using Context7 for current Next.js practices and Playwright to validate screens against the mockups. It never commits and asks for approval before writing changes to the spec.
- Specs are written in the same language as the conversation (Spanish unless prompted otherwise).

## Reglas de código

- User código limpio, nombres, funciones, variables, etc. en inglés.