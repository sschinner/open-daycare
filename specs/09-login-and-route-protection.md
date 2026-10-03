# Spec 09 — Login real y protección de rutas

**State:** Approved
**Depends on:** SPEC 03, SPEC 06, SPEC 08
**Date:** 2026-10-03

**Objective:** Conectar `/login` con Supabase Auth (email + contraseña), proteger todas las rutas salvo el login y la activación con redirect en `proxy.ts` más `verifySession()` en el layout, y mostrar el nombre y el rol reales del usuario en el sidebar leyéndolos de `public.users`.

## Por qué este spec existe

La capa de datos está montada (`proxy.ts` + `utils/supabase/*`) pero no verifica nada: `updateSession` refresca la sesión y sigue de largo, así que `/` es pública y cualquiera entra escribiendo la URL. SPEC 03 dejó los formularios decorativos y SPEC 08 dejó `public.users` con RLS sin policies, o sea que tampoco se puede leer el perfil. Este spec cierra las dos cosas: identidad real y rutas cerradas.

## Alcance

### Sí

- `/login` pasa a ser real: página server que renderiza `app/login/LoginForm.tsx` (cliente, `useActionState`) + `app/login/actions.ts` (`'use server'`) con `supabase.auth.signInWithPassword`, validación manual (email y contraseña no vacíos) y `revalidatePath('/', "layout")` antes del `redirect`.
- Se saca el prefill `caro@opendaycare.com`; ambos inputs arrancan vacíos. El botón "Iniciar sesión" (hoy `Link` a `/`) pasa a `submit` y queda deshabilitado mientras corre la acción.
- Error inline en español con `role="alert"`, mensaje genérico ("Email o contraseña incorrectos.") que no revela si el email existe.
- Destino preservado: el proxy redirige a `/login?next=%2Fkids`, la página lee `searchParams` (Promise en Next 16) y lo pasa en un input hidden; la acción acepta solo paths que empiecen por `/`, que no empiecen por `//` y que no sean `/login`; si no, va a `/`.
- `utils/supabase/proxy.ts` gana la lógica de rutas: públicas `/login` y `/activate-account`; no autenticado en ruta protegida → `/login?next=…`; autenticado en `/login` → `/`; **claims sin fila en `public.users`** → `supabase.auth.signOut()` + `/login`. Las respuestas de redirect copian `supabaseResponse.cookies`.
- `utils/supabase/dal.ts` nuevo: `getProfile()` y `verifySession()` envueltos en el `cache()` de React. `verifySession()` redirige a `/login` si no hay claims y también si no hay perfil.
- `app/(app)/layout.tsx` nuevo (async): llama `verifySession()` y renderiza `<AppShell profile={…}>{children}</AppShell>` con el mismo markup que hoy `AppLayout` (`flex flex-1 min-h-screen bg-[#F6ECDF]` + aside + `main`).
- Migración `add_users_select_policy`: una policy de `select` para la propia fila, y el `.sql` commiteado en `supabase/migrations/<version>_add_users_select_policy.sql` con la versión exacta del MCP.
- `Sidebar` lee el perfil de la BD: nombre, inicial y la línea `{etiqueta} · {room.name}` → "Personal · Sala Soles" (`staff` → Personal, `parent` → Familia, `admin` → Administración). `active` sale de `usePathname()` y se cae la prop. "Cerrar sesión" pasa de `<a href="/login">` a `<form action={signOut}>` con la Server Action de `app/(app)/actions.ts`.
- Se mueven `/`, `/kids` y `/kids/[slug]` al grupo `(app)`; el contenido cliente se parte en `HomeClient.tsx` y `KidsClient.tsx`; el perfil llega por contexto (`ProfileProvider` + `useProfile`) y el saludo del feed pasa a "Buenas, Sebastián".
- "Nueva publicación" del sidebar llama `openComposer()` del contexto de `AppShell`; el feed abre `CreatePostModal` cuando `isComposerOpen`. En `/kids` sigue inerte, igual que SPEC 06.
- `AppLayout.tsx` se elimina. `data/mock.ts` pierde el export `user` (queda sin uso); `room` y `posts` no cambian.
- Se elimina `generateStaticParams` de la página de niño: el layout lee cookies, así que la ruta es dinámica.

### No

- `/activate-account` queda intacta: ni form, ni código de invitación, ni signup. La tabla `invitations` no se toca.
- Signup, recuperación de contraseña, magic link, OAuth, confirmación de email, reset de contraseña.
- El trigger `AFTER INSERT` en `auth.users` que SPEC 08 sacó a propósito: el perfil se sigue creando a mano en el Dashboard.
- Policies de `users` más allá de la lectura de la propia fila. Nada de `daycares`, `rooms`, `children`, `posts`.
- Generar los tipos de TypeScript de la DB (spec aparte). `Profile` se declara a mano.
- Signup de prueba: el login se verifica con `sebastian@google.com`.
- Cambios visuales en login/activate-account más allá del prefill, el error y el estado pending; feed y `/kids` conservan su aspecto.

## Data model

Perfil que lee la DAL (declarado a mano hasta que existan tipos generados):

```ts
export type UserRole = "staff" | "parent" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
};
```

Consulta de `utils/supabase/dal.ts`:

```ts
supabase
  .from("users")
  .select("id, full_name, role")
  .eq("id", claims.sub)
  .maybeSingle();
```

Único cambio en la base, en la migración `add_users_select_policy`:

```sql
create policy users_select_own
  on public.users
  for select
  to authenticated
  using ((select auth.uid()) = id);
```

## Plan de implementación

1. **Policy RLS** — aplicar `add_users_select_policy` con `supabase_apply_migration`, guardar el SQL en `supabase/migrations/` con la versión devuelta. Verificar `pg_policies` y que `GET /rest/v1/users?select=*` sin sesión siga devolviendo `[]`.
2. **DAL** — crear `utils/supabase/dal.ts` con `getProfile()` y `verifySession()`. Todavía nadie los llama; `npm run build` pasa.
3. **Login real** — `app/login/actions.ts`, `app/login/LoginForm.tsx` y `app/login/page.tsx`. `/login` autentica contra Supabase; nada más cambia todavía.
4. **Route group** — `AppShell.tsx`, `ProfileProvider.tsx`, `app/(app)/layout.tsx`, mover las 3 páginas, partir en `HomeClient`/`KidsClient`, borrar `AppLayout`, quitar `generateStaticParams` y el export `user` de `data/mock.ts`. El layout ya exige sesión.
5. **Sidebar con perfil real** — perfil por prop, `active` por `usePathname()`, línea "Personal · Sala Soles", y `app/(app)/actions.ts` con `signOut` + `<form action={signOut}>`.
6. **Composer por contexto** — `openComposer()` en `AppShell`, `CreatePostModal` en el feed.
7. **Proxy** — rutas públicas, los tres redirects, copia de cookies y `signOut` del caso sin perfil.
8. **Verificación** — `npm run lint`, `npm run build`, flujo completo con Playwright (login válido, inválido, vacío, redirecciones, logout) contra la DB y el advisores.

## Criterios de aceptación

- [ ] Con email y contraseña correctos de `sebastian@google.com`, el login entra a `/` (o al `next` preservado) y el sidebar muestra "Sebastián" y "Personal · Sala Soles".
- [ ] Email o contraseña incorrectos muestran un error inline en español y no navegan.
- [ ] Al menos un campo vacío muestra error inline y no dispara la llamada a Supabase.
- [ ] Sin sesión, `/`, `/kids` y `/kids/<slug>` redirigen a `/login?next=<destino>` y, tras loguearse, se vuelve a ese destino.
- [ ] Con sesión, entrar a `/login` redirige a `/` sin mostrar el formulario.
- [ ] "Cerrar sesión" borra la sesión; al escribir `/` a mano vuelve a redirigir a `/login`.
- [ ] El modal "Nueva publicación" se abre desde el sidebar en `/` y sigue inerte en `/kids`.
- [ ] El feed abre con "Buenas, Sebastián" y el avatar con la inicial "S".
- [ ] `pg_policies` muestra `users_select_own`; `GET /rest/v1/users?select=*` sin sesión devuelve `[]` y con el access token del staff devuelve exactamente su fila.
- [ ] Un usuario de Auth sin fila en `public.users` (creado en el Dashboard para la prueba y borrado después) cierra sesión y cae en `/login`.
- [ ] `supabase_list_migrations` muestra `add_users_select_policy` y el `.sql` local tiene la misma versión y el mismo SQL.
- [ ] `supabase_get_advisors security` no reporta `WARN`/`ERROR` nuevos.
- [ ] `npm run lint` y `npm run build` pasan; nada bajo `references/` ni `../07-DB-Schema` cambió.

## Decisiones tomadas y descartadas

- **Sí:** login en Server Action con `useActionState`. Una Server Action escribe cookies y el `redirect` lo resuelve Next. Descartado login desde el cliente (tokens en el browser, sin redirect de servidor) y `fetch` a la API REST.
- **Sí:** `verifySession()` con `cache()` de React en `utils/supabase/dal.ts`, además del proxy. El proxy es la primera barrera; la DAL es la autoritativa si el matcher se toca o aparece una ruta fuera.
- **Sí:** route group `(app)` con layout server. Descartado fetch por página (se repite 3 veces) y descartado mantener `AppLayout` recibiendo props desde páginas cliente.
- **Sí:** el proxy consulta `public.users` para el caso "claims sin perfil" y ahí hace el `signOut`. Es el único lugar que puede escribir cookies: un Server Component no puede, y el `catch` de `setAll` en `server.ts` se traga la escritura en silencio. Descartado cerrar sesión desde el layout.
- **Sí:** policy solo de `select` de la propia fila. Descartada la policy de staff sobre su guardería: no hay ninguna pantalla que la necesite.
- **Sí:** perfil desde la BD y `user` fuera de `data/mock.ts`. Descartado mantener el mock en el sidebar.
- **Sí:** "Nueva publicación" por contexto en `AppShell`. Descartado `?newPost=1` (cambia el comportamiento en `/kids` y mete estado de UI en la URL) y descartado un evento en `window`.
- **Sí:** preservar el destino con `next` validado. Descartado siempre ir a `/` y descartado aceptar `next` sin validar (open redirect).
- **Sí:** prefill fuera, solo placeholder. Descartado prefillear el email real del staff.
- **Sí:** `active` derivado de `usePathname()`. Un layout compartido no puede recibir un prop distinto por página; el highlight se resuelve por ruta.
- **Sí:** quitar `generateStaticParams`. El layout lee cookies, así que la ruta es dinámica y el prerender no aplica.
- **Sí:** `Profile` a mano y sin dependencia de validación nueva. Descartado generar los tipos de la DB y descartado `zod`.
- **No:** signup, activación, recuperación de contraseña y trigger en `auth.users`. Descartados acá a propósito: el alta real pertenece a la spec de invitaciones.

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| El proxy corre también en prefetch de `<Link>` y puede disparar el `signOut` del caso sin perfil | El caso solo aplica a sesiones sin perfil y el destino (`/login`) es el correcto; se acepta |
| Una query a `public.users` por request en el proxy | Es una lectura de PK indexada; `cache()` memoiza la del layout. Si molesta, se mueve el caso sin perfil a un Server Action explícito |
| Un Server Component no puede cerrar sesión (el `catch` de `setAll` traga el error) | El `signOut` vive solo en el proxy y en la Server Action, que sí escriben cookies |
| Loop `/login` ⇄ `/` si el caso sin perfil se resuelve en el layout | El proxy lo resuelve antes de que corra el layout; el layout solo redirige |
| `next` como open redirect | Solo paths relativos: empieza por `/`, no por `//`, nunca `/login` |
| Contraseña del usuario staff fuera del repo | El spec solo documenta el email; la contraseña se elige en el Dashboard |
| Sin tipos generados, un cambio de columna en `users` no lo detecta TS | `Profile` a mano y el riesgo queda anotado para el spec de tipos |
| Cookies refrescadas perdidas al redirigir desde el proxy | Las respuestas de redirect copian `supabaseResponse.cookies.getAll()` |

## Lo que **no** está en este spec

- Activación de cuenta real con código de invitación, la tabla `invitations` y el signup.
- Recuperación de contraseña, magic link, OAuth y confirmación de email.
- El trigger de creación de perfil en `auth.users`.
- Policies de RLS para otras tablas y cualquier lectura de `daycares`, `rooms`, `children` o `posts`.
- Tipos generados de la DB.
- Pantallas "Mi cuenta" y "Avisos".