# Spec 07 — Tabla `daycares`

**State:** Approved
**Depends on:** — (ninguna: SPEC 01–06 siguen con los mocks de `data/`)
**Date:** 2026-10-01

**Objective:** Crear la tabla `daycares` en Supabase con la migración `create_daycares` (RLS habilitado, sin policies) más la migración `seed_daycares` con 4 guarderías, dejando el SQL versionado en `supabase/migrations/`.

## Por qué este spec existe

La base de datos del proyecto está vacía: `public` no tiene ninguna tabla y el único objeto propio de la plataforma es la función `rls_auto_enable()`. Este spec abre la secuencia de tablas parte de la entidad raíz (`daycares`) y fija, en la primera migración, las convenciones con las que van las demás: identificadores `uuid` con `gen_random_uuid()`, `text` en vez de `varchar(n)`, `timestamptz` en vez de `timestamp`, nombres en `snake_case` minúsculo, RLS habilitado desde el día uno y el SQL versionado también en el repo.

## Alcance

### Sí

- Migración `create_daycares` aplicada al proyecto `kvisrrdefgoayoaezgti` con `supabase_apply_migration`:
  - `create table public.daycares (id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz not null default now());`
  - `alter table public.daycares enable row level security;`
- **Sin policies**: deny-by-default para `anon` y `authenticated`.
- Migración `seed_daycares` aparte (no mezclar DDL y DML) con 4 filas: `Guardería Sala Soles`, `Guardería El Arce`, `Guardería Arcoíris`, `Guardería Los Gorriones`.
- Ids generados por `gen_random_uuid()`; no se hardcodean UUIDs.
- El SQL de cada migración queda commiteado en `supabase/migrations/<version>_<name>.sql` con la versión exacta que devuelve el MCP.
- Verificación: queries de catálogo (`pg_class`, `pg_policies`), `curl` a la Data API del proyecto con la publishable key esperando `[]`, y `supabase_get_advisors security`.
- Se sigue en la rama `01-schemaDB`, ya creada.

### No

- Las otras 12 tablas del schema de referencia (`users`, `rooms`, `children`, `parent_children`, `invitations`, `posts`, `post_children`, `post_photos`, `reactions`, `comments`, `daily_summaries`, `devices`).
- Los 6 enums (`user_role`, `user_status`, `relationship_type`, `invitation_status`, `post_type`, `child_status`) y la función `set_updated_at()`: `daycares` no los usa.
- Policies de RLS, `grant`/`revoke` explícitos, `force row level security`, índices o columnas extra.
- Capa de datos en la app: `@supabase/supabase-js`, `@supabase/ssr`, tipos generados, variables de entorno.
- Storage para fotos y cualquier flujo de UI.
- Limpieza de las 3 migraciones de prueba que ya están en el historial remoto.

## Data model

Única estructura nueva de este spec, en el schema `public`:

```sql
create table public.daycares (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  created_at timestamptz not null default now()
);

alter table public.daycares enable row level security;  -- sin policies: deny-by-default
```

Convenciones:

- Fiel a `../07-DB-Schema` §1: mismos nombres, tipos y defaults. Ese documento sigue siendo la fuente de verdad del schema y no se modifica.
- `name` es `not null` pero sin `check` (cadena vacía) ni `unique` (dos guarderías pueden llamarse igual en ciudades distintas). Cualquiera de las dos restricciones se agrega después con un `alter table`, sin reescribir historia.
- `text` en vez de `varchar(n)`: sin límite artificial de longitud, mismo rendimiento.
- `timestamptz` en vez de `timestamp`: siempre con zona horaria.
- Identificadores en `snake_case` minúsculo, sin comillas.
- Sin índice en `name`: no hay consultas por nombre todavía.
- `gen_random_uuid()` está disponible de forma nativa en PostgreSQL 13+ (el proyecto corre 17.6); no hace falta `pgcrypto`.

## Plan de implementación

1. **Migración `create_daycares`** — `supabase_apply_migration` con el SQL de arriba; capturar la versión devuelta y escribir `supabase/migrations/<version>_create_daycares.sql` con el mismo texto. Verificar con `supabase_list_tables` que aparece `daycares` y que `pg_class.relrowsecurity` es `true`.
2. **Migración `seed_daycares`** — `supabase_apply_migration` con el `insert` de las 4 filas; escribir `supabase/migrations/<version>_seed_daycares.sql`. Verificar con `select name from public.daycares order by name` que hay 4 filas y que `Guardería Sala Soles` está entre ellas.
3. **Verificación de seguridad** — `pg_policies` sin filas para `daycares`; `curl` a `/rest/v1/daycares?select=*` con la publishable key devuelve `[]`; `supabase_get_advisors security` sin hallazgos sobre `daycares`; `supabase_list_migrations` muestra las 2 migraciones.
4. **Build** — `npm run lint` y `npm run build` pasan, y `git status` muestra únicamente los 2 archivos nuevos bajo `supabase/`.

## Criterios de aceptación

- [ ] `public.daycares` existe con exactamente `id uuid PK default gen_random_uuid()`, `name text not null` y `created_at timestamptz not null default now()`, sin otras columnas.
- [ ] `pg_class.relrowsecurity` de `daycares` es `true` y `pg_policies` no devuelve filas para la tabla.
- [ ] `GET https://kvisrrdefgoayoaezgti.supabase.co/rest/v1/daycares?select=*` con la publishable key devuelve `[]`.
- [ ] La tabla tiene 4 filas y una de ellas es `Guardería Sala Soles`.
- [ ] `supabase_list_migrations` muestra `create_daycares` y `seed_daycares`.
- [ ] `supabase/migrations/` contiene los 2 `.sql` con el mismo SQL y la misma versión que el historial remoto.
- [ ] `supabase_get_advisors security` no reporta hallazgos sobre `daycares` (los 2 avisos de `rls_auto_enable` son preexistentes de la plataforma).
- [ ] Nada bajo `app/`, `data/`, `references/` ni `package.json` cambió; `npm run lint` y `npm run build` pasan.

## Decisiones tomadas y descartadas

- **Sí:** solo la tabla `daycares`. Los enums y `set_updated_at()` van en la spec de la tabla que los use; crearlos ahora es schema especulativo.
- **Sí:** RLS habilitado sin policies (deny-by-default). Descartado: policy `SELECT` pública (no hay app que lea todavía) y sin RLS (deja la escritura abierta por la Data API).
- **Sí:** grants por defecto de la plataforma, sin `revoke`. RLS sin policies ya bloquea a `anon` y `authenticated`; revocar obligaría a re-grantear más adelante sin ganancia hoy.
- **Sí:** SQL commiteado en `supabase/migrations/` (convención `<timestamp>_<name>.sql` de la CLI), para que el repo sea la fuente auditable del schema.
- **Sí:** seed en migración separada `seed_daycares`; DDL y DML no se mezclan.
- **Sí:** `gen_random_uuid()` (v4) según `../07-DB-Schema`. Descartado `pg_uuidv7`: extensión extra y desviación de la referencia, y con 4 filas la fragmentación de índice es irrelevante.
- **Sí:** `name text not null` sin `check` ni `unique`. Descartado `unique` porque dos guarderías pueden llamarse igual en ciudades distintas.
- **No:** `force row level security` — bloquearía al owner y, sin policies, no aporta nada.
- **No:** índice en `name` — no hay consultas por nombre todavía.
- **Sí:** continuar en la rama `01-schemaDB`, que ya existe; no crear `spec-07-*`.
- **No:** tocar `../07-DB-Schema` — la referencia ya describe esta tabla tal cual.
- **No:** variables de entorno nuevas. La publishable key se usa solo para verificación manual por `curl`, no se persiste en el repo.

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| Los default privileges de la plataforma dan `arwdDxtm` a `anon` y `authenticated`, así que la tabla nueva queda alcanzable por la Data API | RLS habilitado sin policies; se verifica que la Data API devuelve `[]` |
| La versión del archivo puede divergir de la aplicada y romper `supabase db pull` | El archivo se escribe en el mismo paso, con la versión exacta devuelta por el MCP |
| El historial remoto ya tiene 3 migraciones de prueba (`create_test_table` ×2, `drop_test_table`) que no se pueden borrar | Inmutable; se documenta, sin impacto funcional |
| UUID v4 fragmenta índices si `daycares` creciera a volumen alto | 4 filas hoy; migrar a `pg_uuidv7` en una spec aparte si aparece la necesidad |
| Sin policies ni `grant` de INSERT, nadie puede escribir la tabla todavía | Correcto en esta spec: la capa de datos define el modelo de escritura |

## Lo que **no** está en este spec

- Las otras 12 tablas, los 6 enums y la función `set_updated_at()`.
- Policies de RLS para lectura o escritura (cada tabla define las suyas).
- Capa de datos en la app: cliente Supabase, SSR, tipos generados, variables de entorno.
- Storage para fotos y cualquier flujo de la UI.

Cada uno de esos, si llega, va en su propio spec.
