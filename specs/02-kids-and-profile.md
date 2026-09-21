# Spec 02 — Niños y perfil

**State:** Approved
**Depends on:** SPEC 01
**Date:** 2026-09-21

**Objective:** Implementar la lista de niños (`ninos.dc.html`) como `/kids` y su perfil (`perfil-nino.dc.html`) como `/kids/{slug}`, accesibles desde el menú lateral, con estilos idénticos y data ficticia tipada, sin base de datos.

## Alcance

### Sí
- Portar `references/pantallas/ninos.dc.html` a `app/kids/page.tsx` y `references/pantallas/perfil-nino.dc.html` a `app/kids/[slug]/page.tsx`, con clases Tailwind (valores arbitrarios), igual que el spec 01.
- Refactor del sidebar a un **`AppLayout` compartido** usado por `/`, `/kids` y `/kids/{slug}`. `Sidebar` recibe prop `active: "feed" | "kids"` y navega de verdad: `Feed → /`, `Niños → /kids`; el resto queda `#`.
- Nuevo archivo `data/kids.ts`: interfaz `Kid` con los **8 niños** del mockup (colores de avatar propios, edad, padres, alergia opcional), `Parent`, `Allergy` y helper `getKidBySlug`.
- Nuevos componentes **`KidCard`** (badge derivado) y **`KidProfile`**.
- Badge de tarjeta **derivado de la data**: 0 padres → `VINCULAR`; alergia `peanut`/`lactose` → `MANÍ`/`LACTOSA`; si no → chevron.
- **8 perfiles fabricados** y coherentes (cada `slug` funciona); Mateo con los textos exactos del mockup.
- `generateStaticParams` con los 8 slugs; slug desconocido → `notFound()`.
- Buscador "Buscar niño…" **decorativo** (sin filtrado).
- Íconos nuevos en `icons.tsx`: `SearchIcon`, `ChevronRightIcon`, `ArrowLeftIcon`, `AlertIcon` (se reutilizan `PlusIcon` y `LogoIcon`).

### No
- No hay base de datos ni persistencia.
- No hay interacción (agregar, editar, vincular, resumen del día) ni filtrado de búsqueda.
- No se construyen otras pantallas (`crear-publicacion`, `agregar-nino`, `vincular-padre`, `resumen-dia`, `avisos`, `mi-cuenta`, `login`, `detalle-publicacion`, `foto`); sus enlaces quedan inertes (`href="#"`).
- No se edita nada bajo `references/`.

## Data model

Nuevo archivo `data/kids.ts`, sin dependencias:

```ts
export interface Parent {
  name: string;
  initial: string;
  avatarBg: string;                     // hex; texto blanco
  relation: "Mamá" | "Papá";
  status: "active" | "pending";         // → badge ACTIVA / PENDIENTE (verde/amarillo)
  statusText: "activa" | "invitación enviada"; // → subtítulo "Mamá · activa"
}

export type Allergy = {
  label: "peanut" | "lactose";          // → badge MANÍ / LACTOSA, mapeado en español
  note: string;                         // texto de la caja "Alergias y notas"
};

export interface Kid {
  slug: string;        // "mateo-fernandez"
  name: string;
  initial: string;
  avatarBg: string;    // hex, idéntico en tarjeta y perfil
  avatarText: string;  // hex
  age: number;
  birthdate: string;   // "12 mar 2022" (display del mockup)
  enrolled: string;    // "feb 2025"
  allergy?: Allergy;
  parents: Parent[];
}

export const kids: Kid[];                    // los 8 del mockup
export function getKidBySlug(slug: string): Kid | undefined;
```

Convenciones (igual que spec 01): valores de dominio en inglés (`slug`, `status`, `allergy.label`), textos de UI en español vía mapeo en componentes. La línea "N años · X padres vinculados" (`sin padres vinculados` con 0), el conteo y el badge se derivan de `parents.length` y `allergy`; no se guardan como texto.

## Plan de implementación

1. **Data de niños** — crear `data/kids.ts` con tipos y los 8 niños (Mateo con textos exactos: nacimiento `12 mar 2022`, ingreso `feb 2025`, alergia al maní, padres Lucía activa y Diego pendiente; los otros 7 con data coherente fabricada según su edad y conteo de la tarjeta). El sistema sigue compilando.
2. **Sidebar y AppLayout** — `Sidebar.tsx`: prop `active`, hrefs reales para Feed y Niños. Crear `AppLayout.tsx` (Sidebar + `<main>` scroll). Refactor `app/page.tsx` a `<AppLayout active="feed">`. Home sin cambios visuales ni funcionales.
3. **Íconos** — agregar `SearchIcon`, `ChevronRightIcon`, `ArrowLeftIcon`, `AlertIcon` a `icons.tsx`.
4. **KidCard** — crear `app/components/KidCard.tsx`: tarjeta `Link → /kids/{slug}` con avatar (colores de la data), nombre `font-display`, línea edad·padres derivada, badge derivado o chevron; hover `border-[#F2A78E]` + `-translate-y-0.5`.
5. **Página /kids** — `app/kids/page.tsx`: header "GESTIÓN · Niños", botón "Agregar niño" (`#`), buscador decorativo, divisor "SALA SOLES · 8 niños" (count desde `kids.length`), grilla `grid-cols-2 gap-[14px]` con `kids.map(KidCard)`. Ya se navega desde el menú.
6. **KidProfile** — crear `app/components/KidProfile.tsx`: "Volver a Niños" (`/kids`), header (avatar 84px + nombre + "Editar" `#`), caja "Alergias y notas" solo si `allergy`, filas Fecha de nacimiento / Sala (`Soles`) / Ingreso, botón "Resumen del día" (`#`), tarjeta "PADRES VINCULADOS" con badge ACTIVA/PENDIENTE y "Vincular otro padre" (`#`); sin padres → se omite la lista.
7. **Ruta /kids/{slug}** — `app/kids/[slug]/page.tsx`: `generateStaticParams` con los 8 slugs, `notFound()` si `getKidBySlug` no responde, render de `KidProfile`.
8. **Verificación** — `npm run lint`, `npm run build`, comparación visual de `/kids` contra `references/screenshots/ninos.png`/`ninos2.png` y del perfil contra `perfil-nino.dc.html` (Playwright / agent `spec-check`).

## Criterios de aceptación

- [ ] `/kids` renderiza idéntico a `ninos.dc.html` ≥1024px: header GESTIÓN/Niños, botón "Agregar niño", buscador, divisor "SALA SOLES · 8 niños", grilla de 2 columnas, fondo `#F6ECDF`.
- [ ] Los 8 niños de la grilla salen desde `data/kids.ts` con avatar, nombre, "N años · X padres vinculados" (o "sin padres vinculados") exactos.
- [ ] El badge se deriva en `KidCard`: sin padres → `VINCULAR`; alergia peanut/lactose → `MANÍ`/`LACTOSA`; si no → chevron `#CBB89F`. Estilos de badge viven en el componente, no en la data.
- [ ] Hover de tarjeta: border `#F2A78E` + translateY(-2px).
- [ ] El buscador no filtra (decorativo).
- [ ] `/kids/mateo-fernandez` renderiza idéntico a `perfil-nino.dc.html`: volver, header + Editar, caja "Alergias y notas" de Mateo, filas nacimiento `12 mar 2022` / Sala `Soles` / Ingreso `feb 2025`, "Resumen del día", padres Lucía (`ACTIVA`) y Diego (`PENDIENTE`), "Vincular otro padre".
- [ ] Los 8 slugs resuelven sin 404; cualquier otro slug → página 404 (`notFound()`).
- [ ] Sidebar en las 3 rutas: "Feed" activo en `/`, "Niños" activo en `/kids` y `/kids/{slug}`; solo Feed, Niños y las tarjetas navegan de verdad; el resto es `href="#"`.
- [ ] `npm run lint` y `npm run build` pasan sin errores.
- [ ] La data de los 7 niños sin mockup de perfil es coherente (edad ↔ nacimiento, ingreso en 2025, padres consistentes con el conteo de la tarjeta).

## Decisiones tomadas y descartadas

- **AppLayout compartido** (elegida): extraer sidebar + main en un componente reutilizado; descartado route group `(app)` por reordenar archivos del spec 01 y sidebar duplicado por repetir markup.
- **`data/kids.ts` separado** (elegida): dominio propio con 8 niños y helpers; descartado extender `data/mock.ts` para no mezclar feed y guardería.
- **Buscador decorativo** (elegida): solo estilo; descartado filtro en cliente por "solo necesito el estilo" y ausencia de BD.
- **8 perfiles fabricados** (elegida): todos los slugs funcionan igual; descartado solo el de Mateo por dejar 7 rutas muertas.
- **Badge derivado** (elegida): evita duplicar información y nace del mismo dato que el perfil; descartado campo display explícito.
- **Colores de avatar en la data** (elegida): replica exacta del mockup con consistencia tarjeta↔perfil; descartada paleta determinística por riesgo de divergir.
- **`notFound()` + `generateStaticParams`** (elegida): 404 estándar de App Router; descartados redirect y perfil genérico por silenciar errores.
- **Solo 3 enlaces reales** (Feed, Niños, tarjeta); descartado habilitar cualquier otra navegación hasta que exista su spec.
- **Convención spec 01** mantenida: dominio en inglés, UI en español mapeada en componentes; `next/font` y colores ya resueltos en spec 01, no se tocan.

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| Traducción Tailwind de espaciados/sombras se desvía del mockup | Comparación visual contra `ninos.png`/`ninos2.png` y `perfil-nino.dc.html` |
| `generateStaticParams` hardcodea 8 slugs | Se genera desde `kids` (un solo lugar); crecer el mock solo requiere tocar `data/kids.ts` |
| Perfiles fabricados (fechas, padres) podrían volverse incorrectos | Son reemplazables cuando exista base de datos; la estructura se conserva |