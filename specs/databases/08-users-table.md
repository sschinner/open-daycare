# Spec 08 — Tabla `users`, enums y usuario staff de prueba

**State:** Approved
**Depends on:** SPEC 07
**Date:** 2026-10-01

**Objective:** Crear los enums `user_role` y `user_status`, la función `set_updated_at()` y la tabla `public.users` (FK a `daycares` y a `auth.users`, RLS habilitado sin policies, índice en `daycare_id`), más la migración `seed_users` que da de alta a `sebastian@google.com` como staff de Guardería Sala Soles.

## Por qué este spec existe

Es la segunda tabla del schema y la primera que rompe todas las convenciones que fijó spec 07: usa tipos enum, es la primera con `updated_at`, es la primera con una FK a otro schema (`auth.users`) y es la primera que guarda datos personales. También es la que obliga a decidir **dónde vive la creación del perfil**: la referencia propone un trigger `AFTER INSERT` en `auth.users` que copia `role` y `daycare_id` desde `raw_user_meta_data`, y eso es un agujero — Supabase documenta que `user_metadata` es editable por el usuario, así que cualquiera que se registre podría autoasignarse `role = 'admin'` y meterse en otra guardería. Este spec deja la tabla lista y saca el trigger fuera de scope, para que la spec de auth lo resuelva con validación.

## Alcance

### Sí

- Migración `create_users` (DDL) aplicada con `supabase_apply_migration`:
  - `create type public.user_role as enum ('staff', 'parent', 'admin');`
  - `create type public.user_status as enum ('pending', 'active');`
  - `create or replace function public.set_updated_at() returns trigger language plpgsql ...`
  - `create table public.users (...)` con las 11 columnas de `../07-DB-Schema` §2
  - `create index users_daycare_id_idx on public.users (daycare_id);`
  - `create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();`
  - `alter table public.users enable row level security;` — **sin policies**, deny-by-default igual que spec 07.
- Migración `seed_users` (DML, separada del DDL) con 1 fila: el usuario de Auth con email `sebastian@google.com`, `role = 'staff'`, `status = 'active'`, `full_name = 'Sebastián'`, `daycare_id` resuelto por nombre contra `Guardería Sala Soles`.
- Paso manual documentado: crear el usuario `sebastian@google.com` en el Dashboard (Authentication → Users → Add user, email confirmado) antes de aplicar `seed_users`.
- SQL de las 2 migraciones commiteado en `supabase/migrations/<version>_<name>.sql` con la versión exacta que devuelve el MCP.
- Verificación: catálogo (`pg_class`, `pg_policies`, `pg_constraint`, `pg_indexes`, `pg_type`), join `users` ↔ `auth.users` ↔ `daycares`, prueba del trigger de `updated_at`, `curl` a la Data API esperando `[]`, `supabase_get_advisors security`.
- Rama `spec-08-users-table`, creada desde `main` (spec 07 ya está mergeada).

### No

- El trigger `AFTER INSERT` en `auth.users` y la función que crea el perfil. Va en la spec de auth, donde se pueda validar `role` y `daycare_id` sin confiar en `raw_user_meta_data`.
- Los otros 4 enums (`relationship_type`, `invitation_status`, `post_type`, `child_status`): ninguna tabla de este spec los usa.
- Cualquier policy de RLS, `grant`/`revoke` explícito o `force row level security`.
- La capa de datos en la app: `@supabase/supabase-js`, `@supabase/ssr`, tipos generados, variables de entorno, login, sesión.
- Cualquier cosa bajo `data/` o `references/`, y el resto de las 11 tablas del schema de referencia.
- La creación del usuario de Auth por script: no se agrega `service_role` al entorno ni al repo, y no se toca `auth.users` por SQL.
- Tocar `../07-DB-Schema` y limpiar las 3 migraciones de prueba del historial.

## Data model

Única estructura nueva de este spec, en el schema `public`:

```sql
create type public.user_role   as enum ('staff', 'parent', 'admin');
create type public.user_status as enum ('pending', 'active');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.users (
  id                     uuid        primary key references auth.users (id) on delete cascade,
  daycare_id             uuid        not null references public.daycares (id),
  role                   public.user_role   not null,
  status                 public.user_status not null default 'active',
  full_name              text        not null,
  avatar_url             text,
  notify_on_post         boolean     not null default true,
  daily_summary_enabled  boolean     not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index users_daycare_id_idx on public.users (daycare_id);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

alter table public.users enable row level security;  -- sin policies: deny-by-default
```

Y el seed, en su propia migración:

```sql
insert into public.users (id, daycare_id, role, status, full_name)
select
  au.id,
  (select id from public.daycares where name = 'Guardería Sala Soles'),
  'staff',
  'active',
  'Sebastián'
from auth.users au
where au.email = 'sebastian@google.com'
on conflict (id) do nothing;
```

Convenciones y desvíos deliberados:

- **Fiel a `../07-DB-Schema` §2** en nombres, tipos y defaults. Ese documento sigue siendo la fuente de verdad y no se modifica.
- **`id` sin `default gen_random_uuid()`**: es el único desvío de la convención global del schema. El id es el mismo UUID que `auth.users.id`; un default aleatorio produciría filas con FK inválida. El default se agrega solo si alguna vez hay perfiles sin cuenta de Auth.
- **`role` sin default**: si el insert no dice el rol, falla en vez de inventar `parent`. El default del día 1 lo decide la spec de auth, con la invitación como fuente de verdad.
- **`status default 'active'`** según la referencia. El estado previo al signup se modela en `invitations`, así que `pending` queda disponible pero sin uso hoy.
- **`full_name not null`**: criterio de spec 07 (`daycares.name not null`); un perfil sin nombre no sirve para ninguna pantalla.
- **`daycare_id not null`**: en la referencia el carácter nullable se marca explícitamente (ver `children.room_id`, `posts.room_id`) y aquí no está marcado. Todo usuario pertenece a exactamente una guardería: muchos usuarios por guardería, una guardería por usuario.
- **FK a `daycares` sin `on delete`** → `NO ACTION`: nadie puede borrar una guardería que todavía tiene usuarios. Descartado `cascade`: borrar una guardería no debería borrar personas de `auth.users`.
- **`on delete cascade` desde `auth.users`**: sí, es el comportamiento buscado — el perfil no sobrevive a la cuenta.
- **Índice en `daycare_id`**: toda FK indexada, según las reglas de Supabase. Acelera el listado de usuarios por guardería y el chequeo de la FK.
- **`set_updated_at()` en `public`, sin `security definer`**: es un trigger invoker que solo toca `new.updated_at`; no hay nada que exponer y no necesita `set search_path`.
- **Sin `unique` en `full_name`**: dos personas de la guardería pueden llamarse igual.
- **Sin columna `email`**: vive en `auth.users`, no se duplica.
- Los enums van dentro de `create_users`, no en una migración `create_enums` aparte: no hay tabla que los use sin `users`.

## Plan de implementación

1. **Preparatorio manual (fuera de migraciones)** — crear en el Dashboard el usuario `sebastian@google.com` en Authentication → Users → Add user, con el email confirmado y una contraseña elegida en el momento. No se escribe en ningún archivo del repo. Verificar con `select email from auth.users where email = 'sebastian@google.com'` que devuelve 1 fila. Hasta acá el sistema queda como estaba.
2. **Migración `create_users`** — `supabase_apply_migration` con el SQL de arriba; capturar la versión devuelta y escribir `supabase/migrations/<version>_create_users.sql` con el mismo texto. Verificar con `supabase_list_tables` que aparecen `users` y que `pg_class.relrowsecurity` es `true`.
3. **Migración `seed_users`** — `supabase_apply_migration` con el `insert` de arriba; escribir `supabase/migrations/<version>_seed_users.sql`. Si el paso 1 no se hizo, la migración inserta 0 filas y no falla: por eso el paso 4 es obligatorio y exige 1 fila.
4. **Verificación de datos y de seguridad** — el join `users`/`auth.users`/`daycares` devuelve 1 fila con el mismo UUID, `role = 'staff'`, `status = 'active'`, `full_name = 'Sebastián'` y `daycare_id` apuntando a `Guardería Sala Soles`; `pg_policies` sin filas para `users`; `curl` a `/rest/v1/users?select=*` con la publishable key devuelve `[]`; `supabase_get_advisors security` sin hallazgos `WARN`/`ERROR` sobre `users`; `supabase_list_migrations` muestra las 2 migraciones y `supabase/migrations/` tiene los 2 `.sql` con la misma versión.
5. **Prueba del trigger de `updated_at`** — `select updated_at from public.users;`, después `update public.users set avatar_url = avatar_url;` y volver a leer `updated_at`: el valor tiene que ser mayor. La escritura no cambia datos.
6. **Cierre** — `npm run lint` y `npm run build` pasan, y `git status` muestra únicamente los 2 archivos nuevos bajo `supabase/`.

## Criterios de aceptación

- [ ] Existen `public.user_role` (`staff`, `parent`, `admin`) y `public.user_status` (`pending`, `active`), y ningún otro tipo enum nuevo en `public`.
- [ ] `public.users` existe con exactamente las 11 columnas de `../07-DB-Schema` §2, en ese orden, con los tipos y defaults del Data model de esta spec.
- [ ] `users.id` es FK a `auth.users (id)` con `on delete cascade`, es PK, y **no** tiene default.
- [ ] `users.daycare_id` es FK a `public.daycares (id)`, `not null`, sin `on delete`, y existe el índice `users_daycare_id_idx` sobre esa columna.
- [ ] `users.role` y `users.status` son del enum correspondiente; `role` no tiene default y `status` tiene default `active`.
- [ ] `pg_class.relrowsecurity` de `users` es `true` y `pg_policies` no devuelve filas para la tabla.
- [ ] `GET https://kvisrrdefgoayoaezgti.supabase.co/rest/v1/users?select=*` con la publishable key devuelve `[]`.
- [ ] Existe el trigger `users_set_updated_at` y `update public.users set avatar_url = avatar_url` cambia `updated_at` a un valor mayor.
- [ ] La tabla tiene exactamente 1 fila: `id` igual al de `auth.users` con email `sebastian@google.com`, `role = 'staff'`, `status = 'active'`, `full_name = 'Sebastián'`, `daycare_id` igual al de `Guardería Sala Soles`.
- [ ] El SQL de las 2 migraciones no contiene ninguna contraseña ni la `service_role` key.
- [ ] `supabase_list_migrations` muestra `create_users` y `seed_users`, y `supabase/migrations/` contiene los 2 `.sql` con el mismo SQL y la misma versión que el historial remoto.
- [ ] `supabase_get_advisors security` no reporta hallazgos `WARN` ni `ERROR` sobre `users`; el único hallazgo sobre la tabla es `rls_enabled_no_policy` (nivel `INFO`), esperado por el diseño deny-by-default.
- [ ] Nada bajo `app/`, `data/`, `references/`, `package.json` ni `../07-DB-Schema` cambió; `npm run lint` y `npm run build` pasan.

## Decisiones tomadas y descartadas

- **Sí:** solo la tabla, **sin** trigger en `auth.users`. Descartado el trigger que copia `role`/`daycare_id` desde `raw_user_meta_data`: `user_metadata` es editable por el usuario, así que cualquiera que se registre podría autoasignarse `role = 'admin'` y colarse en otra guardería. El trigger va en la spec de auth, con validación.
- **Sí:** solo `user_role` y `user_status`. Descartado crear los 6 enums: 4 no los usa ninguna tabla y spec 07 ya fijó el criterio de no escribir schema especulativo.
- **Sí:** `set_updated_at()` en esta spec. Descartado diferirlo: `users` es la primera tabla con `updated_at` y sin ella la columna queda congelada.
- **Sí:** RLS habilitado sin policies. Descartado `select` de la propia fila y descartada la policy de staff sobre su guardería: la capa de datos no existe, y las policies se escriben junto con el modelo de lectura real.
- **Sí:** índice en `daycare_id`. Descartado sin índices: la regla de indexar toda FK es de aplicación inmediata, no de volumen.
- **Sí:** los enums dentro de `create_users`. Descartado una migración `create_enums` aparte: agrega un archivo al historial sin aportar un objeto que no se usa solo.
- **Sí:** `id` sin `default gen_random_uuid()`, aunque la convención global del schema lo pida. La FK a `auth.users` lo exige.
- **Sí:** `role` sin default, para que el insert falle si nadie dice el rol.
- **Sí:** `daycare_id not null` y `full_name not null`; `status default 'active'`; FK a `daycares` sin `on delete` (`NO ACTION`). Descartado `cascade` en `daycares`: no se borran personas al borrar una guardería.
- **Sí:** el usuario de Auth lo crea el usuario en el Dashboard. Descartado `curl` a `/auth/v1/admin/users` con `service_role` (metería una credencial muy poderosa en el entorno local) e insert directo en `auth.users` desde SQL (schema interno de GoTrue, sin garantía de estabilidad, requiere fila en `auth.identities`).
- **Sí:** el seed es tolerante (`insert ... select ... from auth.users` + `on conflict (id) do nothing`), con la verificación exigiendo 1 fila. Descartado el seed estricto: obliga a un orden que igual documentamos, y un fallo de FK en el seed es más confuso que un `count = 0` explícito en el paso 4.
- **Sí:** `daycare_id` resuelto por nombre con un subselect. Descartado hardcodear el UUID de `Guardería Sala Soles`, por la regla del repo de no fijar en un seed los ids generados.
- **Sí:** la contraseña se elige en el momento en el Dashboard y no se escribe en ningún archivo del repo. Solo el email aparece en el SQL del seed.
- **No:** `force row level security` — bloquearía al owner y sin policies no aporta nada.
- **No:** columna `email` en `public.users` — Supabase ya la gestiona en `auth.users`, duplicarla es una fuente de desincronización.
- **No:** tabla `staff_profiles` separada ni rol duplicado por columna: `user_role` cubre los tres roles.
- **No:** tocar `../07-DB-Schema` — la referencia ya describe esta tabla tal cual.
- **No:** variables de entorno nuevas. La publishable key se usa solo para el `curl` de verificación, no se persiste en el repo.

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| Si el usuario de Auth no existe al aplicar `seed_users`, la migración inserta 0 filas y parece exitosa | El paso 4 exige `count(*) = 1` con el join contra `auth.users` y falla explícitamente si no |
| La contraseña del usuario staff puede quedar anotada en el chat o en un archivo | Solo se documenta el email; la contraseña se elige en el Dashboard y no se escribe en el repo |
| Que alguien use `raw_user_meta_data` como fuente de `role` cuando llegue el trigger | `public.users.role` queda como única fuente de autorización; la spec de auth tiene que validar, no copiar |
| Sin policies, el usuario staff no puede leer su propia fila por la Data API aunque tenga sesión | Correcto en esta spec: la capa de datos todavía no existe; las policies llegan con ella |
| La FK a `auth.users` depende de un schema propiedad de otra extensión | Patrón estándar en Supabase; se verifica la constraint en `pg_constraint` y el login del staff en la spec de auth |
| `on delete cascade` desde `auth.users` borra filas de `public.users` sin avisar | Es el comportamiento buscado (el perfil no sobrevive a la cuenta); queda registrado acá |
| `NO ACTION` en la FK a `daycares`: nadie puede borrar una guardería con usuarios | Intencional; la baja de guarderías va en su propia spec |
| Sin trigger de creación de perfil, un signup nuevo deja un `auth.users` sin fila en `public.users` | Correcto en esta spec: el flujo de alta real (invitación + activación) es de la spec de auth |

## Lo que **no** está en este spec

- El trigger `AFTER INSERT` en `auth.users` y la función que crea el perfil desde el metadata del signup.
- Los enums `relationship_type`, `invitation_status`, `post_type` y `child_status`.
- Policies de RLS, `grant`/`revoke` y cualquier modelo de lectura de usuarios.
- La capa de datos en la app: cliente Supabase, SSR, tipos generados, variables de entorno, login y sesión.
- La creación del usuario de Auth por script, y cualquier credencial en el repo.
- `invitations`, `parent_children` y el resto de las tablas del schema de referencia.

Cada uno de esos, si llega, va en su propio spec.
