# Spec 06 — Modal crear publicación

**State:** Approved
**Depends on:** SPEC 01, SPEC 02
**Date:** 2026-09-22

**Objective:** Crear el modal "Nueva publicación" portado de `crear-publicacion.dc.html`, que se abre al presionar "Nueva publicación" en el sidebar o el composer de `/`, con Para, Tipo y Descripción obligatorios, carga de fotos por selección o drag and drop, y que al publicar agrega el post al feed en memoria sin persistencia.

## Alcance

### Sí
- Nuevo componente cliente `app/components/CreatePostModal.tsx`: overlay `fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6` + tarjeta `max-w-[580px]` `rounded-[24px]` fondo `#FBF4EC` borde `#ECE0D0` sombra del mockup, con `role="dialog" aria-modal="true"`.
- Header **Cancelar / Nueva publicación / Publicar**, replicando el mockup (Cancelar `#94887B` bold, título Fredoka 18px, Publicar `#D9583C` extrabold).
- Sección **PARA**: una pill por cada niño de `data/kids.ts` (avatar circular con inicial + `avatarBg` + nombre, incluye los niños agregados en memoria por SPEC 04) + pill **Toda la sala**. Selección única, **obligatorio**.
- Sección **TIPO**: las 7 pills **Comida / Siesta / Actividad / Logro / Ánimo / Foto / Anuncio** con los colores del mockup (fondo sólido activo, pastel inactivo). Selección única, **obligatorio**.
- Sección **DESCRIPCIÓN**: textarea placeholder "Contá cómo le fue hoy…", **obligatorio** (no vacío al recortar).
- **Validación inline en submit** en español ("Elegí a quién va dirigida la publicación.", "Elegí un tipo de publicación.", "Escribí una descripción.") bajo la sección culpable; se limpia al corregir. No cierra el modal si hay error.
- Sección **FOTOS** (opcional): grilla 96×96 + caja punteada "Agregar". **Upload real**: click abre selector de archivos (`image/*`) y drag and drop sobre la caja (con `preventDefault` en `dragover`/`drop`); preview con `URL.createObjectURL`; **máx 4 fotos**; cada thumbnail con botón **X** para quitar. Los object URLs se revocan al quitar/cerrar.
- **Publicar válido** cierra el modal, resetea el formulario y **agrega el post arriba de "PUBLICADO HOY"** en memoria: autor Caro (`user`), hora actual `HH:MM`, audiencia "Para: familia de {nombre}" o "Para: toda la sala", feedback 0/0, `kind` del tipo elegido y las fotos como object URLs.
- El post nuevo con fotos renderiza las **imágenes reales** en `PostCard`; un post nuevo sin fotos no muestra bloque de imagen (el placeholder sigue solo para los posts con `kind: activity` sin `photos` de SPEC 01).
- `app/page.tsx` pasa a cliente (`use client`) con estado `isOpen` + `extraPosts: Post[]`; el composer "Compartí un momento…" pasa de `<a href="#">` a `<button onClick>` y abre el modal.
- `Sidebar` recibe `onNewPost?: () => void` (opcional): "Nueva publicación" pasa a `<button onClick>`; en `/kids` queda inerte (sin prop). `AppLayout` enhebra la prop.
- Extensión de tipos: `PostKind` pasa a 7 valores y `PostBase` gana `photos?: string[]`.
- `PostCard` amplía `badgeStyles` a los 7 tipos con los colores del mockup.
- No se necesitan íconos nuevos: se reutilizan `PhotoIcon`, `PlusIcon` y `CloseIcon`.
- Cierre con Cancelar, `Esc` o click en el fondo; el modal se resetea en cada apertura.
- Clases Tailwind arbitrarias; no se edita nada bajo `references/`.

### No
- No hay persistencia (ni localStorage ni BD); recargar `/` elimina el post agregado y las fotos.
- No se suben archivos a ningún servidor; las fotos viven solo como object URLs en memoria.
- No hay detalle de publicación: like, comentar y editar siguen inertes (SPEC 01).
- No se cambia la data ni el render de los posts existentes de SPEC 01.
- FOTOS no es obligatorio aunque el tipo sea "Foto"; el tipo solo pinta el badge.
- No se filtra ni agrupa el feed por sala/niño; el post va siempre al feed principal.
- No se tocan `/kids`, `data/kids.ts` ni `AddKidModal`.

## Data model

Cambios en `data/mock.ts` (extender unión + campo opcional):

```ts
export type PostKind =
  | "achievement"
  | "activity"
  | "announcement"
  | "food"
  | "nap"
  | "mood"
  | "photo";

type PostBase = {
  // ...campos existentes
  photos?: string[]; // object URLs; solo lo llevan los posts creados en memoria
};
```

Los 3 posts existentes no llevan `photos` (sin cambios). El post en memoria:
- `id`: `Date.now()`; `author`: `user` (`{ name: "Caro", initial: "C" }`); `time`: hora actual `HH:MM`.
- `audience`: `"Para: familia de {kid.name}"` o `"Para: toda la sala"`.
- `kind`: valor en inglés correspondiente al tipo elegido; el label y los colores del badge son responsabilidad de `PostCard`, y los del pill del modal lo son del modal.

## Plan de implementación

1. **Data + PostCard** — en `data/mock.ts` ampliar `PostKind` a 7 y agregar `photos?: string[]`; en `PostCard.tsx` ampliar `badgeStyles` a los 7 tipos (labels y colores del mockup) y renderar `<img>` (grid redondeado, `object-cover`) cuando `post.photos` existe. Compila y el feed actual se ve igual.
2. **CreatePostModal** — crear `app/components/CreatePostModal.tsx` (cliente): tarjeta del mockup, secciones Para (pills desde `kids` + "Toda la sala", selección única), Tipo (7 pills), textarea, FOTOS (selector + drag and drop, object URLs, máx 4, revocar al quitar/cerrar, X por thumbnail), validación inline en submit, cierre por Cancelar/Esc/backdrop, reset en cada apertura y `onSave(post: Post)` construyendo el post completo.
3. **Integrar en home y sidebar** — `app/page.tsx`: directiva `use client`, estado `isOpen` + `extraPosts`, composer con `onClick`, render `[...posts, ...extraPosts]` y modal montado solo cuando `isOpen`. `AppLayout` y `Sidebar` enhebran `onNewPost` (opcional) y "Nueva publicación" pasa a `<button onClick>`.
4. **Verificación** — `npm run lint`, `npm run build`, comparación visual contra `crear-publicacion.dc.html` / `compose.png` y chequeo de flujo (abrir por sidebar y por composer → errores obligatorios → seleccionar → subir foto por click y por drag and drop → publicar → post en feed con imagen → recargar y desaparece) con Playwright / agente `spec-check`.

## Criterios de aceptación

- [ ] En `/`, presionar "Nueva publicación" (sidebar) o "Compartí un momento…" abre el modal con header Cancelar / Nueva publicación / Publicar y las secciones PARA, TIPO, DESCRIPCIÓN y FOTOS replicando `crear-publicacion.dc.html`.
- [ ] PARA muestra una pill por cada niño de `data/kids.ts` (inicial + `avatarBg` + nombre) más "Toda la sala"; selección única, ninguna preseleccionada.
- [ ] TIPO muestra las 7 pills (Comida, Siesta, Actividad, Logro, Ánimo, Foto, Anuncio) con los colores del mockup; selección única.
- [ ] Publicar sin Para, sin Tipo o con Descripción vacía muestra error inline en español bajo la sección culpable y no cierra el modal; el error desaparece al corregir.
- [ ] FOTOS permite subir por selección de archivo y por drag and drop con preview real, hasta 4, botón X para quitar; es opcional.
- [ ] Publicar válido cierra el modal, lo deja en blanco y agrega el post arriba de "PUBLICADO HOY" con autor Caro, hora actual, audiencia "Para: familia de {nombre}" o "Para: toda la sala", badge del tipo y 0 likes/0 comentarios; con fotos, muestra las imágenes reales.
- [ ] Cancelar, `Esc` o click en el fondo cierran el modal y lo dejan en blanco en la próxima apertura.
- [ ] Recargar `/` elimina el post agregado (sin persistencia).
- [ ] Los posts existentes de SPEC 01 se renderizan igual (placeholder solo para `activity` sin fotos) y `/kids` no cambia.
- [ ] No hay estilos inline y ningún archivo bajo `references/` se modifica.
- [ ] `npm run lint` y `npm run build` pasan sin errores.

## Decisiones tomadas y descartadas

- **Post en el feed en memoria** (elegida por el usuario): feedback real de publicación sin BD, consistente con SPEC 04/05; descartado modal decorativo que solo cierra.
- **Pills "Para" desde `data/kids.ts`** (elegida por el usuario): data-driven e incluye los niños agregados por SPEC 04; descartado hardcodear los 3 del mockup.
- **Selección única para Para y Tipo** (elegida por el usuario): fiel al mockup; descartado multi-selección.
- **FOTOS como upload real** (elegida por el usuario): click + drag and drop con `URL.createObjectURL` y máx 4; descartado replicar la caja punteada estática y subir a servidor (fuera de alcance).
- **`PostKind` extendido a 7** (elegida por el usuario): cada tipo del modal tiene su badge en el feed; descartado mapear a los 3 tipos actuales.
- **Mostrar las imágenes reales en el post publicado** (elegida por el usuario); descartado mantener el placeholder punteado de SPEC 01 para posts con fotos.
- **`/` a componente cliente** (elegida por el usuario): igual que `/kids` en SPEC 04/05; descartado wrapper cliente por sobre-ingeniería (la data es estática en `data/mock.ts`, sin impacto SEO real).
- **Composer también abre el modal** (elegida por el usuario): un solo punto de entrada para redactar, y además da acceso móvil (el sidebar está oculto en `<1024px`).
- **Audiencia y pill con nombre completo** (`kid.name`): data-driven, "Para: familia de Mateo Fernández"; descartado derivar el primer nombre (más fiel al mockup pero inconsistente con la pill).
- **Íconos reutilizados** (`PhotoIcon`, `PlusIcon`, `CloseIcon`); descartado agregar íconos nuevos.
- **`onNewPost` opcional en Sidebar/AppLayout** (elegida): `/kids` no cambia; descartado levantar el estado a un layout compartido.

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| Ampliar `PostKind` rompe `badgeStyles` | Se amplía en el mismo paso; `npm run build` lo detecta |
| Object URLs huérfanas al cerrar sin publicar | `URL.revokeObjectURL` al quitar una foto y en el cleanup del modal |
| Drag and drop abre la imagen en vez de soltarla en el modal | `preventDefault` en `dragover`/`drop` |
| Post tipo "Foto" sin fotos se ve sin bloque de imagen | Aceptado: FOTOS es opcional siempre; el tipo solo pinta el badge |
| Botón del sidebar solo disponible en desktop (SPEC 01) | El composer del home lo abre también y es visible en móvil |

## Lo que **no** está en este spec

- Persistencia (localStorage/BD) y subida de archivos a servidor.
- Detalle de publicación y like/comentar/editar funcionales.
- Filtros o agrupación del feed por sala/niño.
- Cualquier pantalla del mockup (login, avisos, mi-cuenta).

Cada uno de esos, si llega, va en su propio spec.