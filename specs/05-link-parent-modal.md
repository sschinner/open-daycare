# Spec 05 — Modal vincular padre

**State:** Approved
**Depends on:** SPEC 02
**Date:** 2026-09-22

**Objective:** Crear el modal "Vincular padre" portado de `vincular-padre.dc.html`, que se abre al presionar "Vincular otro padre" en `/kids/{slug}` con Nombre del Padre/Madre, Email y Parentesco obligatorios, y que al enviar agrega el padre en memoria al perfil con estado de invitación enviada, sin persistencia.

## Alcance

### Sí
- Nuevo componente cliente `app/components/LinkParentModal.tsx`: overlay fijo (`fixed inset-0 z-50 bg-black/40`) + tarjeta `max-w-[480px]` `rounded-[24px]` fondo `#FBF4EC` borde `#ECE0D0` sombra del mockup, con `role="dialog" aria-modal="true"`.
- Header "Vincular padre" + subtítulo "a {nombre del niño}" + botón **X** para cerrar.
- Caja de aviso azul: "Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {nombre del niño}."
- **3 campos obligatorios**: NOMBRE DEL PADRE/MADRE (placeholder "Ej. Diego Fernández"), EMAIL (placeholder "correo@ejemplo.com") y PARENTESCO como 3 pills **Mamá / Papá / Tutor/a** con Mamá preseleccionada y estilos activo/inactivo del mockup.
- Validación inline en submit en español (nombre vacío, email sin formato válido) con borde rojo; se limpia al corregir.
- Bloque **CÓDIGO DE INVITACIÓN** estático `7K4P9` + "Vence en 7 días", siempre visible dentro del modal.
- Botón full-width "Enviar invitación" con gradiente `#F4977E→#EE8164`, ícono de envío y sombra del mockup.
- **Añadir en memoria**: al enviar con los 3 válidos, el padre aparece al final de "PADRES VINCULADOS" con badge `PENDIENTE` y subtítulo "invitación enviada"; desaparece al recargar.
- `KidProfile.tsx` pasa a cliente (`use client`); **la página `/kids/{slug}` sigue en servidor** conservando `generateStaticParams` y `notFound()`.
- Cierre con X, `Esc` o click en el fondo; el modal se resetea en cada apertura.
- Íconos nuevos en `icons.tsx`: `CloseIcon`, `InfoIcon`, `SendIcon`.
- Clases Tailwind arbitrarias; no se edita nada bajo `references/`.

### No
- No hay persistencia (ni localStorage ni BD); recargar `/kids/{slug}` elimina el padre agregado.
- No hay envío de correo real ni generación de código (código `7K4P9` y "Vence en 7 días" decorativos).
- No cambia `generateStaticParams` ni se añaden rutas; el perfil es el de SPEC 02.
- El badge `VINCULAR` en la grilla `/kids` no se actualiza (deriva de `data/kids.ts`; los `extraParents` viven solo en el perfil).
- No se cambian estados de padres existentes, ni se editan ni remueven padres.
- No se tocan `/kids/page.tsx`, `AddKidModal` ni el feed.

## Data model

Cambios en `data/kids.ts` (union de parentesco extendida + email opcional en `Parent`):

```ts
export type ParentRelation = "Mamá" | "Papá" | "Tutor/a";

export interface Parent {
  name: string;
  email?: string;          // nuevo; los padres existentes no lo llevan
  initial: string;
  avatarBg: string;
  relation: ParentRelation;
  status: "active" | "pending";
  statusText: "activa" | "invitación enviada";
}
```

El padre nuevo en memoria:
- `relation` = opción elegida; `status: "pending"`, `statusText: "invitación enviada"` → badge `PENDIENTE`.
- `initial` = primera letra del nombre; `avatarBg` de una paleta cíclica local al modal (igual que `AddKidModal`).
- Se renderiza como `[...kid.parents, ...extraParents]` en `KidProfile`; el `email` se guarda pero no se muestra en el perfil.

## Plan de implementación

1. **Data** — en `data/kids.ts` agregar `ParentRelation` (con "Tutor/a") y `email?: string` en `Parent`. Compila sin cambios visuales.
2. **Íconos** — agregar `CloseIcon`, `InfoIcon` y `SendIcon` a `app/components/icons.tsx` (SVG 24px, trazo 2, estilo del resto).
3. **LinkParentModal** — crear `app/components/LinkParentModal.tsx` (cliente): overlay, tarjeta, header con X, caja de aviso con `kid.name`, los 3 campos, pills de parentesco (Mamá preseleccionada), bloque de código estático, botón "Enviar invitación", validación inline, cierre por X/Esc/backdrop, `onSave(parent: Parent)`.
4. **KidProfile** — directiva `use client`, estado `isOpen` + `extraParents`, "Vincular otro padre" pasa de `<a href="#">` a `<button onClick>`, render de `[...kid.parents, ...extraParents]` y modal montado solo cuando `isOpen`.
5. **Verificación** — `npm run lint`, `npm run build`, comparación visual contra `vincular-padre.dc.html` y flujo (abrir → errores → corregir → enviar → padre PENDIENTE → recargar y desaparece) con Playwright / agente `spec-check`.

## Criterios de aceptación

- [ ] En `/kids/{slug}`, presionar "Vincular otro padre" abre el modal con header "Vincular padre / a {nombre}", caja de aviso, los 3 campos (labels y placeholders "Ej. Diego Fernández", "correo@ejemplo.com") y el bloque `7K4P9` "Vence en 7 días".
- [ ] PARENTESCO son 3 pills Mamá/Papá/Tutor/a con Mamá preseleccionada; el estilo de la pill activa replica el mockup.
- [ ] Enviar con Nombre vacío o Email inválido muestra error inline en español + borde rojo bajo el campo culpable y no cierra el modal; el error desaparece al corregir.
- [ ] Enviar con los 3 campos válidos cierra el modal y agrega el padre al final de PADRES VINCULADOS con badge `PENDIENTE` y subtítulo "invitación enviada".
- [ ] X, `Esc` o click en el fondo cierran el modal y lo dejan en blanco en la próxima apertura.
- [ ] Recargar `/kids/{slug}` elimina el padre agregado (sin persistencia).
- [ ] `generateStaticParams` y `notFound()` de `/kids/{slug}` siguen intactos (la página permanece en servidor).
- [ ] No hay estilos inline y no se modifica nada bajo `references/`.
- [ ] `npm run lint` y `npm run build` pasan sin errores.

## Decisiones tomadas y descartadas

- **Añadir en memoria** (elegida por el usuario): feedback real de invitación sin BD, consistente con SPEC 04; descartado decorativo (sin feedback) y localStorage (persistencia fuera de alcance).
- **Mamá/Papá/Tutor/a + `ParentRelation`** (elegida por el usuario): fiel al mockup; descartado mantener solo Mamá/Papá (perdería Tutor/a) y pills sin preselección.
- **Código estático `7K4P9` siempre visible** (elegida por el usuario): réplica decorativa; descartado generación de código y bloque solo tras enviar (estado de éxito no descrito en el mockup).
- **`email?: string` en `Parent`** (elegida por el usuario): el dato del formulario se conserva en el padre en memoria aunque no se muestre; los padres existentes quedan sin email.
- **`KidProfile` cliente, página servidor intacta** (elegida): `generateStaticParams`/`notFound()` son solo-servidor; descartado volcar la página a cliente (rompería SPEC 02) y un wrapper extra (sobre-ingeniería).
- **Íconos nuevos en `icons.tsx`** (elegida): siguen la convención de SPEC 01/02; descartado SVG inline en el modal.
- **Avatar derivado para el padre nuevo** (inicial + paleta cíclica local al modal), igual que `AddKidModal`; descartado un campo de avatar en el formulario.

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| `<a href="#">` → button cambia la semántica del enlace | Mismas clases visuales en un `<button>`; solo cambia interacción |
| Extender la unión de `relation` rompe un uso que asume 2 valores | `npm run lint` / `npm run build` lo detectan; no hay usos con switch actualmente |
| Traducción Tailwind del mockup se desvía (pills, sombra, código) | Comparación con Playwright contra `vincular-padre.dc.html` |
| Hacer `KidProfile` cliente introduce estado en una página estática | Prop `kid` serializable y estado solo en cliente; sin impacto en `generateStaticParams` ni SEO |

## Lo que **no** está en este spec

- Envío de correo real y generación/expiración del código de invitación.
- Persistencia (localStorage/BD) y reenvío de invitaciones.
- Transición de invitado a activo, edición/remoción de padres y actualización del badge `VINCULAR` en `/kids`.
- Otras pantallas del mockup (mi-cuenta, avisos, resumen del día).

Cada uno de esos, si llega, va en su propio spec.