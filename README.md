# Croply — Frontend

Frontend de Croply (software de gestión agrícola). React 18 + Vite + TypeScript + Tailwind + shadcn/ui.

## Estado actual

✅ **Épica 1 — Gestionar el Acceso a la Plataforma**: completa (HU-AC-01 a HU-AC-07).

## Requisitos previos

- Node.js 20+
- pnpm (`npm install -g pnpm` si no lo tenés)

## Instalación

```bash
git clone https://github.com/diegopaez03/Croply-FrontEnd.git
cd Croply-FrontEnd
pnpm install
```

## Configuración del entorno

Copiá el archivo de ejemplo y ajustá los valores según necesites:

```bash
cp .env.example .env
```

Variables principales:

| Variable | Valores | Descripción |
| --- | --- | --- |
| `VITE_USE_MOCKS` | `true` / `false` | Ver sección "Modo Mock" abajo |
| `VITE_API_URL` | URL | Base del backend real (ej. `http://localhost:3000/api/v1`) |

## Levantar el proyecto

```bash
pnpm dev
```

Por defecto queda disponible en `http://localhost:5173`.

## Modo Mock — cómo elegir entre datos simulados y backend real

El proyecto soporta trabajar **sin** depender de que el backend esté corriendo, mediante un interruptor global:

- **`VITE_USE_MOCKS=true`**: cada servicio (`src/services/*.service.ts`) devuelve datos estáticos simulados en vez de llamar a una API real. Útil para maquetar o probar el frontend sin backend levantado. Cada HU tiene definidos usuarios/tokens/valores "falsos" que disparan distintos casos (éxito, errores puntuales).
- **`VITE_USE_MOCKS=false`**: las llamadas van directo al backend real, definido en `VITE_API_URL`. Para esto necesitás el [repo del backend](https://github.com/diegopaez03/Croply-BackEnd) corriendo en paralelo (ver su propio README para levantarlo).

> Por defecto el `.env.example` trae `VITE_USE_MOCKS=true`, para que cualquiera pueda levantar el frontend y probarlo sin necesitar el backend andando.

## Resumen rápido de accesos:

- **Landing**: `/`
- **Login**: `/login`
- **Registro por invitación**: `/registro-invitado/:token`
- **Recuperar / resetear contraseña**: `/recuperar-contrasena`, `/resetear-contrasena/:token`
- **Solicitar digitalización de finca**: pública desde la Landing, o autenticada desde `/admin-finca/dashboard`
- **Panel Admin Croply**: `/admin-croply/dashboard`, `/admin-croply/gestion-usuarios`
- **Perfil / cambio de contraseña**: `/perfil` (autenticado)

## Estructura del proyecto

```
src/
├── pages/          # Pantallas, organizadas por dominio/rol (Auth/, Landing/, AdminCroply/, AdminFinca/)
├── components/
│   ├── ui/          # Primitivos de shadcn/ui
│   ├── layout/       # Navbar, Header, Layouts por rol
│   └── shared/        # Componentes de dominio reutilizables entre pantallas
├── services/        # Llamadas a la API, un archivo por dominio de negocio
├── types/           # Interfaces de TypeScript, un archivo por entidad
├── hooks/           # Hooks reutilizables
├── context/         # Contextos globales (AuthContext)
├── utils/           # Helpers (validators, formatters, error/success handlers)
└── docs/            # Documentación interna (HUs, contratos de API)
```
