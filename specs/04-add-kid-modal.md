# Spec 04 — Modal agregar niño

**State:** Approved
**Depends on:** SPEC 02
**Date:** 2026-09-21

**Objective:** Agregar al botón "Agregar niño" de `/kids` un modal con los campos de `agregar-nino.dc.html` (Nombre Completo, Fecha de Nacimiento y Sala obligatorios, el resto opcional), validación inline en español y alta del niño en la grilla en memoria al guardar, sin persistencia.

## Alcance

### Sí
- Modal centrado (`max-w-[520px]`, `rounded-[24px]`, fondo `#FBF4EC`, borde `#ECE0D0`) replicando `agregar-nino.dc.html`: header "Cancelar / Agregar niño / Guardar" y los 5 campos con labels y placeholders del mockup.
- **Nuevo componente cliente `app/components/AddKidModal.tsx`**: overlay de fondo + tarjeta `role="dialog" aria-modal="true"`.
- Se abre al presionar "Agregar niño" en `/kids` (botón pasa de `href="#"` a `onClick`).
- **Campos obligatorios**: NOMBRE COMPLETO (placeholder "Ej. Martina López"), FECHA DE NACIMIENTO (texto, válido solo `dd/mm/aaaa`) y SALA; opcionales: ALERGIAS (ETIQUETAS) y NOTAS MÉDICAS.
- **Validación inline en submit**: al guardar con un obligatorio inválido, mensaje en español bajo el campo + borde rojo; se limpia al corregir.
- **Alta en memoria**: Guardar con los obligatorios válidos cierra el modal y agrega el niño a la grilla de `/kids` (tarjeta con inicial, color de avatar, edad calculada, badge `VINCULAR` por falta de padres); desaparece al recargar.
- **Salas mockeadas**: `rooms` con 4 salas como `<select>` estilizado (Sala Soles + 3 nuevas), "Sala Soles" preseleccionada.
- Cierre con Cancelar, tecla `Esc` o click en el fondo; el modal **se resetea en blanco en cada apertura**.
- Grilla única: la sección sigue siendo "SALA SOLES · N niños"; la sala elegida solo se captura en el niño en memoria.
- `/kids/page.tsx` pasa a componente cliente (`use client`) para sostener estado del modal y la grilla; la data sigue en `data/kids.ts`.

### No
- No hay persistencia (ni localStorage ni BD); recargar elimina el niño agregado.
- El perfil del niño nuevo no existe: su tarjeta **no navega** (no hay perfil dinámico ni cambios en `generateStaticParams` de SPEC 02).
- No se agrupa la grilla por sala (decisión del usuario: sala solo en el select).
- No se registran edición/eliminación de niños, vínculo de padres ni resumen del día.
- Alergias y notas quedan como texto libre: **no** generan badge MANÍ/LACTOSA (el badge solo sale de `data/kids.ts`).
- No se toca el feed ni el `room` de `data/mock.ts`; no se edita nada bajo `references/`.

## Data model

Cambios en `data/kids.ts` (agregar `room?` a `Kid` y el arreglo `rooms`):

```ts
export interface Room {
  slug: string;   // "soles"
  name: string;   // "Sala Soles"
}

export const rooms: Room[] = [
  { slug: "soles", name: "Sala Soles" },
  { slug: "lunas", name: "Sala Lunas" },
  { slug: "estrellas", name: "Sala Estrellas" },
  { slug: "nubes", name: "Sala Nubes" },
];

export interface Kid {
  // ...campos existentes (spec 02)
  room?: string;             // slug de sala; lo usan solo los niños agregados en memoria
}
```

Los 8 niños existentes no llevan `room` (Sala Soles implícita, sin cambios). El niño nuevo en memoria:
- `slug`: derivado del nombre en kebab-case; `initial` = primera letra; `avatarBg`/`avatarText` de una paleta cíclica (2–4 pares de la existente).
- `age`: calculada desde la fecha `dd/mm/aaaa`; `birthdate`: fecha convertida al formato de display del repo ("12 mar 2022", meses abreviados en español).
- `enrolled: ""` (sin campo en el modal; el perfil no es navegable, no se muestra).
- `parents: []` → badge `VINCULAR` derivado automáticamente en `KidCard`.
- `allergy` sin valor (texto libre de alergias/notas no se mapea); `room`: slug de la sala elegida.

## Plan de implementación

1. **Salas en data** — en `data/kids.ts` agregar `Room`, `rooms` (4 salas) y `room?: string` en `Kid`. Se compila sin cambios visuales.
2. **KidCard `static`** — `app/components/KidCard.tsx` recibe `static?: boolean`; con `true` renderiza un `div` con las mismas clases en lugar de `Link` (la tarjeta de un niño en memoria no navega). El resto no cambia.
3. **AddKidModal** — crear `app/components/AddKidModal.tsx` (cliente): overlay fijo, tarjeta del mockup, los 5 campos, `<select>` desde `rooms` con chevron propio (`appearance-none`), errores inline al submit, validación de fecha (`dd/mm/aaaa` real, días según mes/año bisiesto), reset en cada apertura, cierre por Cancelar/Esc/backdrop, y `onSave(partialKid)` que devuelve el `Kid` construido (edad y badge derivados).
4. **Integrar en /kids** — `app/kids/page.tsx`: directiva `use client`, estado `isOpen` + `extraKids: Kid[]`, botón "Agregar niño" con `onClick` (mantiene el gradiente), render `[...kids, ...extraKids]` en la grilla, conteo `kids.length + extraKids.length`, tarjetas de `extraKids` con `static`, y `<AddKidModal>` montado solo cuando `isOpen`.
5. **Verificación** — `npm run lint`, `npm run build`, validación visual contra `agregar-nino.dc.html` y chequeo de flujo (abrir → error obligatorio → guardar → tarjeta en grilla → recargar y desaparece) con Playwright / agente `spec-check`.

## Criterios de aceptación

- [ ] En `/kids`, presionar "Agregar niño" abre el modal (overlay) con header Cancelar / Agregar niño / Guardar y los 5 campos con labels y placeholders del mockup (`Ej. Martina López`, `dd/mm/aaaa`, `Ej. Maní, Lactosa`, "Indicaciones, medicación, contactos…").
- [ ] Guardar con Nombre Completo vacío o Fecha inválida muestra error inline en español bajo el campo + borde rojo y no cierra el modal; el error desaparece al corregir.
- [ ] Guardar con los 3 obligatorios válidos cierra el modal y agrega la tarjeta a la grilla: inicial, color derivado, nombre, edad calculada, "0 padres → VINCULAR", sin navegar al perfil.
- [ ] El conteo al lado de "SALA SOLES · N niños" incluye los agregados en memoria.
- [ ] SALA es un `<select>` con las 4 salas de `data/kids.ts`, "Sala Soles" preseleccionada, con chevron que replica el mockup.
- [ ] Fecha de nacimiento acepta solo `dd/mm/aaaa` (días y meses reales); Alergias y Notas médicas son texto libre opcional.
- [ ] Cancelar, `Esc` o click en el fondo cierran el modal y lo dejan en blanco para la próxima apertura.
- [ ] Recargar `/kids` elimina el niño agregado (sin persistencia).
- [ ] No hay estilos inline (clases Tailwind arbitrarias) y ningún archivo bajo `references/` se modifica.
- [ ] `npm run lint` y `npm run build` pasan sin errores.

## Decisiones tomadas y descartadas

- **Alta en grilla en memoria** (elegida por el usuario): da feedback real de guardado sin BD; descartado **localStorage + perfil dinámico** (toca `generateStaticParams` de SPEC 02 → otro spec) y **modal decorativo que solo cierra** (sin feedback).
- **Tarjeta no navegable para niños nuevos** (elegida): via `KidCard static`; descartado dejar el `Link` navegando a un 404.
- **Validación inline en submit** (elegida por el usuario): señala el campo culpable; descartado botón deshabilitado (sin diagnóstico) y toast (sin ubicación del error).
- **4 salas mockeadas en `data/kids.ts`** (elegida): `<select>` real desde `rooms`; descartado valor fijo "Soles" y agrupar la grilla por sala (se deja para un futuro spec, decisión del usuario).
- **Fecha por texto + validación** (elegida por el usuario): fiel al mockup; descartado `<input type="date">` (locale del dispositivo y estilo divergente).
- **Alergias/notas como texto libre** (elegida por el usuario): sin mapeo a badge; el badge solo sale de la data existente.
- **Reset del modal en cada apertura** (elegida por el usuario); descartado preservar lo escrito al cerrar.
- **`/kids/page.tsx` como cliente** (elegida): requiere estado local para modal y grilla; descartado mantenerlo servidor con isla cliente por sobre-ingeniería.
- **Avatar y slug derivados** (inicial, paleta cíclica, kebab-case): consistencia con `KidCard` sin campos extra en el formulario.

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| El `<select>` nativo se aleja visualmente del mockup (chevron) | `appearance-none` + chevron propio replicado del mockup |
| Validación de fecha compleja (bisiesto, días por mes) | Validar con `Date` real: rango de día según mes y año |
| Convertir `/kids` a cliente cambia el modelo de carga (servidor → cliente) | No afecta SEO (data estática en `data/kids.ts`) y se mantiene `AppLayout` intacto |
| Contador de grilla inconsistente si se agrega/elimina memoria | El conteo deriva siempre de `kids.length + extraKids.length` |

## Lo que **no** está en este spec

- Persistencia (localStorage/BD) y perfil dinámico de niños cargados (otro spec si llega).
- Edición, eliminación y vínculo de padres de niños.
- Agrupar la grilla por sala y resumen del día.
- Alergias mapeadas a badges (MANÍ/LACTOSA) desde el formulario.

Cada uno de esos, si llega, va en su propio spec.