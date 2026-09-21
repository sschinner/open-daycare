# Spec 01 — Feed home

**State:** Approved
**Depends on:** Ninguna
**Date:** 2026-09-21

**Objective:** Implementar el feed de `references/pantallas/feed.dc.html` como home `/` con estilo idéntico, data ficticia tipada, enlaces inertes y responsive básico, sin autenticación ni base de datos.

## Alcance

### Sí
- Portar el diseño del feed (`references/pantallas/feed.dc.html`) a `app/page.tsx` usando **clases Tailwind** (valores arbitrarios) en lugar de estilos inline.
- Estructura en **componentes separados**: `Sidebar`, `PostCard` e `icons`.
- Data ficticia tipada en `data/mock.ts` (usuario, sala y 3 posts hardcodeados: LOGRO, ACTIVIDAD con foto, ANUNCIO).
- Fuentes Fredoka + Nunito cargadas con `next/font/google` en `app/layout.tsx`; `lang="es"`; metadata `title: "OpenDayCare"`.
- **Responsive básico**: sidebar oculto en viewports < 1024px; el feed ocupa el ancho completo.
- Limpieza de `globals.css`: fondo base `#F6ECDF`, texto `#3F362E`, sin modo oscuro.

### No
- No se construyen otras pantallas (`ninos`, `avisos`, `mi-cuenta`, `login`, `crear-publicacion`, `detalle-publicacion`, `foto`); sus enlaces quedarán inertes (`href="#"`).
- No hay autenticación, base de datos ni persistencia.
- No hay interacción funcional (publicar, like, comentar); solo apariencia.
- No hay imágenes reales: el placeholder de foto (caja punteada) se replica tal cual, sin assets en `public/`.
- No se edita nada bajo `references/`.

## Data model

Único archivo `data/mock.ts`, sin dependencias:

```ts
export interface Room {
  name: string;      // "Sala Soles"
  kidCount: number;  // 12
  dateLabel: string; // "martes 17 jun"
}

export interface Author {
  name: string;     // "Mateo" | "Anuncio general"
  initial?: string; // "M"; undefined si el avatar es ícono
}

export interface Feedback {
  likes: number;
  comments: number;
}

type PostBase = {
  id: number;
  author: Author;
  kind: PostKind;
  time: string;        // "14:20"
  audience: string;    // "Para: familia de Mateo" | "Para: toda la sala"
  text: string;
  feedback: Feedback;
};

export type PostKind = "achievement" | "activity" | "announcement";

export type Post =
  | (PostBase & { kind: "achievement" })
  | (PostBase & { kind: "activity"; photoLabel: string })
  | (PostBase & { kind: "announcement" });

export const user = { name: "Caro", fullName: "Caro Giménez", role: "Maestra · Soles", initial: "C" };
export const room: Room = { name: "Sala Soles", kidCount: 12, dateLabel: "martes 17 jun" };
export const posts: Post[]; // los 3 posts del mockup
```

Los valores de `kind` son en inglés (convención de código limpio). El componente `PostCard` los mapea a las etiquetas visuales en español (LOGRO, ACTIVIDAD, ANUNCIO) junto con sus colores. Los estilos de badges son responsabilidad de `PostCard`, no de la data.

## Plan de implementación

1. **Layout y fuentes** — `app/layout.tsx`: reemplazar Geist por `Fredoka` y `Nunito` (`next/font/google`, Nunito 400–800), `lang="es"`, `metadata.title = "OpenDayCare"`. Ajustar `app/globals.css`: fondo `#F6ECDF`, color `#3F362E`, quitar modo oscuro y Arial. El sistema queda funcionando (home default intacta).
2. **Data** — crear `data/mock.ts` con los tipos y la data ficticia del mockup.
3. **Íconos** — crear `app/components/icons.tsx` con los SVGs replicados del mockup (logo, home, usuarios, campana, cuenta, logout, +, cámara, like, comentario, megáfono, editar).
4. **Sidebar** — crear `app/components/Sidebar.tsx`: logo `OpenDayCare / Sala Soles`, botón "Nueva publicación", nav (Feed activo / Niños / Avisos / Mi cuenta) y footer con perfil + cerrar sesión; `hidden lg:flex`, ancho `w-[248px]`.
5. **PostCard** — crear `app/components/PostCard.tsx`: render del header (avatar/ícono + autor + hora + badge con color según tipo), audiencia, texto, bloque foto solo para `actividad`, y fila like/comentario/editar.
6. **Home** — reescribir `app/page.tsx`: layout flex con `Sidebar` + `<main>` (`max-w-[760px]`), header "GUARDERÍA · SALA SOLES", "Buenas, Caro", "12 niños · martes 17 jun", composer "Compartí un momento…", divisor "PUBLICADO HOY" y la lista de posts desde `posts`.
7. **Verificación** — `npm run lint`, `npm run build`, comparación visual desktop contra `references/screenshots/feed.png` y check responsive en mobile.

## Criterios de aceptación

- [ ] `/` renderiza el feed idéntico al mockup a viewport ≥ 1024px: sidebar fijo a la izquierda, columna central máx. 760px, fondo `#F6ECDF`.
- [ ] Los 3 posts (LOGRO, ACTIVIDAD con placeholder de foto, ANUNCIO) se renderizan desde `data/mock.ts` con badges, textos y contadores exactos del mockup.
- [ ] En viewports < 1024px el sidebar desaparece y el feed usa el ancho completo.
- [ ] Todos los enlaces a pantallas inexistentes son `href="#"` (no navegan, se ven igual).
- [ ] `lang="es"`, metadata `title: "OpenDayCare"`; Fredoka + Nunito servidas por `next/font` sin `<link>` a Google Fonts.
- [ ] No hay modo oscuro; el fondo es siempre `#F6ECDF`.
- [ ] `npm run lint` y `npm run build` pasan sin errores.

## Decisiones tomadas y descartadas

- **Tailwind con valores arbitrarios** (elegida por el usuario) para el estilo; descartado estilos inline por menor mantenibilidad.
- **Componentes separados** (`Sidebar`, `PostCard`, `icons`) en `app/components/`; descartado todo-en-`page.tsx`.
- **Data tipada en `data/mock.ts`** con unión discriminada para los 3 tipos de post; descartado JSON (sin tipos) e inline (no reutilizable).
- **Responsive básico** (sidebar oculto en móvil); descartada réplica desktop-only.
- **Enlaces inertes `#`**; descartadas rutas futuras 404 y spans sin interactividad.
- **`next/font/google`** para Fredoka + Nunito; descartado `<link>` a Google Fonts.
- **Sin auth ni BD**: todo estático con data ficticia.

## Riesgos identificados

- La traducción a valores arbitrarios de Tailwind puede desviar sutilmente espaciados/sombras; se mitiga comparando contra `references/screenshots/feed.png`.
- Fredoka es fuente variable (300–700): cubre el `600` del mockup; verificar en build.