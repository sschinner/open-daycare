# Spec 03 — Login y activación de cuenta

**State:** Approved
**Depends on:** SPEC 01, SPEC 02
**Date:** 2026-09-21

**Objective:** Implementar el login (`login.dc.html`, sin la opción Personal/Familia) como `/login` y la activación de cuenta (`activar-cuenta.dc.html`) como `/activate-account`, standalone sin sidebar, con los prefills del mockup, submits que navegan a `/` y el enlace "Cerrar sesión" del sidebar conectado a `/login`, sin autenticación.

## Alcance

### Sí
- Portar `login.dc.html` a `app/login/page.tsx` **sin el bloque "INGRESO COMO"** (Personal/Familia eliminada): panel izquierdo de marca (gradiente `#F6A98E→#F2937A→#EC7E62`, esferas decorativas, `LogoIcon`, eslogan "El día de cada niño, compartido con su familia." y "🌿 Guardería Sala Soles") + columna derecha del formulario.
- Formulario: EMAIL prefill `caro@opendaycare.com`, CONTRASEÑA placeholder `••••••••`, "¿Olvidaste tu contraseña?" (`#`), botón "Iniciar sesión" → `/`, link "Activá tu cuenta" → `/activate-account`.
- Portar `activar-cuenta.dc.html` a `app/activate-account/page.tsx`: centrado `max-w-[440px]`, `LogoIcon` grande, "Bienvenida a OpenDayCare", tarjeta "Mateo · Sala Soles", CÓDIGO DE INVITACIÓN `7K4P9`, EMAIL `lucia.fernandez@gmail.com`, CREAR CONTRASEÑA, consentimiento marcado (decorativo), botón "Activar mi cuenta" → `/`, link "Iniciar sesión" → `/login`.
- **Standalone**: ambas páginas a pantalla completa sin `AppLayout`, fondo `#FBF4EC`, `min-h-screen`.
- `Sidebar.tsx`: "Cerrar sesión" (hoy `href="#"`) → `/login`.
- Reutilizar `LogoIcon` y la paleta/fuentes ya resueltos por specs anteriores; clases Tailwind arbitrarias, sin estilos inline.

### No
- No hay autenticación real, sesión, cookies ni validación de credenciales; los formularios no procesan nada.
- No hay estado de formulario: prefills fijos, consentimiento siempre marcado y no toggleable.
- No se implementa `familia-feed` ni un flujo de activación real; el submit de activación navega a `/` provisionalmente.
- "¿Olvidaste tu contraseña?" queda inerte (`#`).
- No se usa `AppLayout` en estas pantallas.
- No se introducen datos nuevos ni archivos en `data/`.
- No se edita nada bajo `references/`.

## Data model

Esta feature **no introduce estructuras de datos nuevas** ni archivos en `data/`. Los prefills (email, código, nombre del niño) son literales inline en cada página, igual que en el mockup, y solo se reutiliza `LogoIcon` de `app/components/icons.tsx` (coincide exactamente con el ícono de sol de ambos mockups).

## Plan de implementación

1. **Página login** — crear `app/login/page.tsx`: grid `grid-cols-[1.05fr_1fr]` con panel izquierdo gradiente (logo + eslogan + pie de sala) y columna derecha centrada (`max-w-[392px]`) con EMAIL, CONTRASEÑA, "¿Olvidaste tu contraseña?" (`#`) y botón `Link` → `/`. El sistema sigue compilando.
2. **Página activación** — crear `app/activate-account/page.tsx`: flex centrado `min-h-screen` (`max-w-[440px]`) con logo, título, tarjeta invitación, los 3 campos con prefills, consentimiento marcado y botón → `/`.
3. **Sidebar** — en `app/components/Sidebar.tsx` cambiar el `href="#"` del botón "Cerrar sesión" a `/login`. Sin cambios visuales; las otras rutas siguen igual.
4. **Verificación** — `npm run lint`, `npm run build`, comparación visual con `login.dc.html` y `activar-cuenta.dc.html` (Playwright / agente `spec-check`), incluyendo un viewport móvil del login.

## Criterios de aceptación

- [ ] `/login` ≥1024px replica `login.dc.html` sin "INGRESO COMO": panel de marca izquierdo (logo, eslogan, "🌿 Guardería Sala Soles") y formulario con EMAIL `caro@opendaycare.com`, CONTRASEÑA `••••••••`, "¿Olvidaste tu contraseña?", botón "Iniciar sesión" y link "Activá tu cuenta".
- [ ] No existe la opción Personal ni Familia en `/login`.
- [ ] `/activate-account` replica `activar-cuenta.dc.html`: logo, "Bienvenida a OpenDayCare", tarjeta "Mateo · Sala Soles", `7K4P9`, `lucia.fernandez@gmail.com`, CREAR CONTRASEÑA, consentimiento marcado, "Activar mi cuenta", "¿Ya tenés cuenta? Iniciar sesión".
- [ ] "Iniciar sesión" y "Activar mi cuenta" navegan a `/`.
- [ ] "Activá tu cuenta" (login) ↔ "Iniciar sesión" (activar) navegan entre sí.
- [ ] "¿Olvidaste tu contraseña?" es inerte `#`.
- [ ] "Cerrar sesión" en el sidebar navega a `/login`; el resto del sidebar no cambia.
- [ ] `/login` y `/activate-account` van standalone (sin sidebar), fondo `#FBF4EC`.
- [ ] No hay estilos inline (todo clases Tailwind arbitrarias).
- [ ] `npm run lint` y `npm run build` pasan sin errores.

## Decisiones tomadas y descartadas

- **Personal/Familia fuera** (decisión explícita del usuario): el login queda solo email + contraseña; se descarta el toggle de roles.
- **Rutas `/login` y `/activate-account`** (elegidas): rutas en inglés por convención del repo (`/kids`, `/kids/{slug}`); descartado `/activar-cuenta` (traducción literal del mockup) y `/auth/*`.
- **Standalone sin `AppLayout`** (elegida): el mockup no tiene sidebar; descartado envolver en el layout de la app.
- **Submits → `/`** (elegida): el feed es la única pantalla existente tras login/activación; descartado `#` inerte en el botón principal y el `familia-feed` (otro spec).
- **Prefills literales inline** (elegida): una pantalla estática no justifica un archivo de `data/`; descartado añadir `email` a `data/mock.ts`.
- **Consentimiento estático marcado** (elegida): sin interactividad hasta que exista un flujo real de activación.
- **Reuso de `LogoIcon`** (elegida): el ícono de sol del mockup coincide exactamente con el logo actual; descartado duplicar el SVG.

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| El mockup del login es desktop-first (2 columnas) sin versión mobile | Responsive básico: en viewports <1024px el panel de marca queda arriba y el formulario abajo; verificado manualmente (no hay screenshot de referencia) |
| Diferencias sutiles de espaciado/sombra en la traducción Tailwind | Comparación visual contra `login.dc.html` y `activar-cuenta.dc.html` |

## Lo que **no** está en este spec

- Autenticación real, sesión, cookies y validación de credenciales.
- Pantalla `familia-feed` y flujo de activación real (el submit provisional apunta a `/`).
- Toggle del consentimiento y pantalla "¿Olvidaste tu contraseña?".

Cada uno de esos, si llega, va en su propio spec.