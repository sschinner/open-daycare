# open-daycare

App de guardería/colectivo parental. Next.js 16 (App Router) + React 19 + TypeScript, Tailwind v4 y Supabase como backend.

- UI en español.
- La app habla con Supabase **únicamente** a través de `@supabase/supabase-js` + `@supabase/ssr`, usando los helpers de `utils/supabase/`.
- El schema de la base vive en el repo como migraciones en `supabase/migrations/`.

---

## Requisitos

| Herramienta | Versión | Para qué |
| --- | --- | --- |
| Node.js | `>= 20.9` (probado en 24.x) | correr la app |
| npm | el que venga con Node | instalar dependencias |
| Docker | opcional | solo si vas a levantar el stack local de Supabase (hoy no se usa) |
| [Supabase CLI](https://supabase.com/docs/guides/cli) | cualquiera | solo para `link` / `db push` / `db pull`. **No hace falta para levantar la app** |
| [opencode](https://opencode.ai) + MCP de Supabase | — | solo para que el agente trabaje sobre la base de datos |

Acceso al proyecto de Supabase: <https://supabase.com/dashboard/project/kvisrrdefgoayoaezgti>
(project ref `kvisrrdefgoayoaezgti`).

---

## Levantar el proyecto

```bash
git clone <repo-url>
cd 06-open-daycare
npm install
cp .env-template .env.local     # .env también funciona; ambos están gitignored
```

Editá `.env.local` y completá los valores (ver [Variables de entorno](#variables-de-entorno)):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://kvisrrdefgoayoaezgti.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_DB_PASSWORD=...
SUPABASE_USER_TEST_PASSWORD=...
```

Después:

```bash
npm run dev
```

Abrí <http://localhost:3000>.

La app no necesita Docker, ni el stack local de Supabase, ni el CLI para arrancar: se conecta directo al proyecto remoto.

### Variables de entorno

| Variable | ¿La usa la app? | Dónde se saca |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | sí | Dashboard → Project Settings → API → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | sí | Dashboard → Project Settings → API → **Publishable key** (`sb_publishable_...`) |
| `SUPABASE_DB_PASSWORD` | no | Dashboard → Project Settings → Database → **Database password**. Solo para el CLI (`supabase link`, `db push`) |
| `SUPABASE_USER_TEST_PASSWORD` | no | la que vos elijas para los usuarios de prueba del seed |

En el código solo se leen las dos `NEXT_PUBLIC_*`, desde `utils/supabase/`. Nunca hardcodearlas y nunca exponer la `service_role` / secret key.

`.env*` está en `.gitignore`; el único archivo de variables que se commitea es `.env-template`.

### Scripts

```bash
npm run dev     # dev server en http://localhost:3000
npm run build   # build de producción (type check incluido)
npm run start   # sirve el build
npm run lint    # ESLint
```

No hay framework de tests ni script de test en el repo.

### Estructura útil

```
app/                  rutas y pantallas (App Router)
utils/supabase/       helpers de datos: client.ts (browser), server.ts (RSC), proxy.ts, dal.ts
proxy.ts              refresh de sesión por request (en Next 16 reemplazo de middleware.ts)
supabase/migrations/  historial de migraciones, espejo auditable del schema remoto
specs/                specs de features (specs/databases/ para temas de DB)
references/           mockups de pantallas y screenshots — solo lectura, no se edita
.agents/skills/       skills que usa el agente (spec, spec-impl, supabase, postgres best practices)
```

---

## Supabase

### Migraciones

El **historial remoto es la fuente de verdad** y es inmutable: una migración aplicada no se edita ni se borra, se corrige con una migración nueva. `supabase/migrations/` es el espejo auditable; si el archivo local y el remoto divergen, `supabase db pull` rompe.

Reglas (ver también `AGENTS.md`):

- Todo cambio en la base es una migración. DDL y DML van separadas: `create_<tabla>` para el schema, `seed_<tabla>` para los datos.
- Con el MCP: `supabase_apply_migration` y guardar el SQL en `supabase/migrations/<version>_<name>.sql` con la versión exacta que devuelve el MCP.
- `supabase_execute_sql` es **solo lectura**. Si el SQL modifica algo, es migración.
- `supabase_list_migrations` tiene que mostrar la migración nueva y el `.sql` local la misma versión.

### CLI: instalar, autenticarse y linkear

Instalación (global o con `npx`, sin instalar):

```bash
npm install -g supabase     # o bien: npx supabase <comando>
```

**Login con navegador** (la forma normal en una máquina de desarrollo):

```bash
supabase login
```

Abre el navegador, generás un **access token** y el CLI lo guarda localmente para todos los comandos siguientes.

**Login con token** (SSH sin navegador, CI, o cuando *querés* que el token viva en una variable de entorno):

1. Generá el token en <https://supabase.com/dashboard/account/tokens>.
2. Exportalo y pasalo por flag:

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...
supabase login --token "$SUPABASE_ACCESS_TOKEN" --name work
```

También existe `supabase login --no-browser` si el flujo interactivo no abre bien.

Chequeá con `supabase projects list` que el token tenga acceso al proyecto.

**Linkear el proyecto local con el remoto** (guarda el project ref para `db push` / `db pull`; pide el password de la base, el de `SUPABASE_DB_PASSWORD`):

```bash
supabase link --project-ref kvisrrdefgoayoaezgti
# o, sin prompt:
supabase link --project-ref kvisrrdefgoayoaezgti --password "$SUPABASE_DB_PASSWORD"
```

`supabase link` crea `supabase/.temp/` con datos de la conexión local.

**Migraciones desde el CLI** (el camino manual, cuando no se usa el MCP):

```bash
supabase db push --dry-run   # ver qué aplicaría
supabase db push
supabase db pull              # bajar el schema remoto como migración nueva (solo para inspeccionar)
```

### MCP de Supabase (para el agente)

El MCP **no** va en el `opencode.json` del repo: vive en el config global
`~/.config/opencode/opencode.jsonc`, así el token nunca se commitea.

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp?project_ref=kvisrrdefgoayoaezgti&features=docs,account,database,debugging,development,functions,branching",
      "enabled": true
    }
  }
}
```

#### Autenticación del MCP: OAuth (default)

El MCP hosteado de Supabase usa registro dinámico de cliente OAuth: no hace falta crear PAT ni OAuth app a mano.

```bash
opencode mcp list             # ver servidores y su estado de auth
opencode mcp auth supabase    # dispara el flujo: abre el navegador
```

Ojo con el paso del navegador: hay que **elegir la organización que contiene el proyecto**. Si elegís otra, el MCP queda conectado pero sin acceso a estos datos. Los tokens se guardan en `~/.local/share/opencode/mcp-auth.json`.

Para cambiar de cuenta o desloguear: `opencode mcp logout supabase`.

#### Autenticación del MCP: access token

Para cuando no hay navegador (contenedores, WSL sin GUI, CI) o preferís no depender de OAuth:

1. Generá un access token en <https://supabase.com/dashboard/account/tokens>. Si el scope lo permite, usá un token **scoped** (`sbp_fc...`): nunca otorga más permisos que los de tu cuenta, solo los restringe.
2. Exportalo en tu shell: `export SUPABASE_ACCESS_TOKEN=sbp_...`
3. En `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "mcp": {
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp?project_ref=kvisrrdefgoayoaezgti&features=docs,account,database,debugging,development,functions,branching",
      "oauth": false,
      "enabled": true,
      "headers": {
        "Authorization": "Bearer {env:SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

`oauth: false` desactiva la detección automática para que opencode use el header. `{env:VAR}` es la sintaxis de opencode para leer variables de entorno.

Debug: `opencode mcp debug supabase`.

#### Onboarding del equipo

1. Cada persona crea su cuenta en Supabase y **la_invita el owner de la organización** (<https://supabase.com/dashboard/org>) con un rol sobre el proyecto `kvisrrdefgoayoaezgti`. Un token con scope solo puede acotar los permisos de una cuenta que ya tiene rol: nunca agrega.
2. Cada una instala el MCP en su `~/.config/opencode/opencode.jsonc` con la config de arriba.
3. Corre `opencode mcp auth supabase` (o define `SUPABASE_ACCESS_TOKEN`) y **elige la organización del proyecto** al autorizar.
4. Verificación: en el agente, pedir `supabase_list_tables` y ver las tablas de `public`. Si devuelve vacío o error de permisos, es que el MCP quedó conectado a otra org o a otro proyecto.
5. Para migraciones, cada uno necesita además `supabase login` + `supabase link` (§ anterior) y el password de la base.

### Permisos del MCP

Dos límites distintos, que conviene no confundir:

- **Qué tools existen**: lo determina el `features=` de la URL. Acá están todas las que usa el repo.
- **Qué puede hacer cada tool**: lo determina el scope del token. Un token con scope solo acota los permisos de tu cuenta, nunca los agranda.

| Feature | Tools que usa el repo | Permiso que necesitan |
| --- | --- | --- |
| `database` | `supabase_execute_sql`, `supabase_list_tables`, `supabase_get_advisors` | **Database** (Read) |
| `development` | `supabase_apply_migration` | **Migrations** (Read-write) |
| `development` | `supabase_generate_typescript_types`, `supabase_get_project_url`, `supabase_get_publishable_keys` | **Database** (Read) |
| `account` | listar proyectos/orgs | **Organization Projects** / **Organizations** (Read) |
| `debugging` | `supabase_query_logs` | lectura de logs |
| `functions` | deploy de Edge Functions | **Edge Functions** (Read-write) |
| `branching` | crear/mergear ramas de dev | **Development Branches** (Read-write) |

`supabase_execute_sql` es read-only por disciplina del repo (ver `AGENTS.md`), no por permisos: el token sí puede escribir. Por eso todo DDL/DML va como migración.

Un token **scoped** para este proyecto alcanza con: Database (Read), Migrations (Read-write), Advisors (Read), Organization Projects (Read), Organizations (Read). Si el scope no está disponible en tu cuenta (alpha), creá un token clásico y cuidalo como una contraseña.

---

## Otros agentes

- `references/pantallas/*.dc.html` son los mockups y `references/screenshots/*.png` las capturas: son la fuente de verdad de la UI. No se editan.
- `../07-DB-Schema` es el schema completo de referencia, solo lectura.
- El MCP de Playwright se levanta con `npx -y @playwright/mcp@latest` (ya está en el `opencode.json` del repo) y sus screenshots van a `.playwright-mcp/`.
