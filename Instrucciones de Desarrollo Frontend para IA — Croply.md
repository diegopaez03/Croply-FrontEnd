# Instrucciones de Desarrollo Frontend para IA — Croply

Propietario: Paula Rodriguez

Este documento constituye la **fuente única de verdad** para que la asistencia de IA desarrolle el frontend de Croply. No se detallan estilos visuales ni colores; para eso, referirse exclusivamente a `design-system.md`.

## 1. Contexto Global y Stack del Frontend

- **Contexto de Negocio:** Croply es un software de gestión agrícola para monitoreo de parcelas, siembras, visualización de sensores y costos.
- **Separación de Repositorios:** Este repositorio contiene exclusivamente el Frontend. El backend (NestJS) corre en un repositorio independiente. N**o se debe generar código de backend aquí.**
- **Tecnologías:** React 18 + Vite, TypeScript (Tipado estricto), Tailwind CSS + shadcn/ui, tipografía Montserrat y HugeIcons (variante *outline*), TanStack Query, React Hook Form + Zod, Axios, React Router.
- **Gestor de paquetes:** el proyecto usa **pnpm**, no npm (`pnpm install`, `pnpm dev`, etc.). No generar ni modificar `package-lock.json`.

## 2. Protocolo de Insumos y Trabajo con la IA

Para cualquier tarea de desarrollo o maquetación, se recibirá obligatoriamente los siguientes archivos y recursos que actúan como pauta estricta:

1. **Historia de Usuario (HU):** Documento (`docs/hu/`) o bien HU enviada por chat que detalla el alcance, las reglas de negocio y los criterios de aceptación específicos de la funcionalidad.
2. **Figma o imagen de la pantalla puntual:** el diseño de interfaz visual exacto a replicar. Se comparte pantalla por pantalla, no el documento completo de maquetación — la IA no tiene acceso a pantallas que no se le compartan explícitamente en ese prompt.
3. **Design System (`docs/api/design-system.md`):** Tokens de diseño unificados (colores base, tipografía, espaciados, radios de bordes, lista de componentes).
4. **Contrato de API (`docs/api/`):** definición de rutas, métodos HTTP y estructura de datos exacta (JSON) que se intercambia con el backend.

> **Regla de comportamiento:** Describe brevemente en texto tu plan de desarrollo antes de generar cualquier archivo. Si detectas inconsistencias entre el Figma, la HU o el Contrato de API, detén el proceso y solicita aclaraciones al usuario.
> 

## 3. Estructura de Carpetas (Arquitectura Base)

El repositorio organiza el código por **tipo de archivo**, no por módulo/feature. Cada carpeta es plana a nivel raíz, y adentro se distingue por dominio de negocio (nombre de archivo o subcarpeta), no por carpetas separadas por épica:

```
src/
├── pages/                  # Pantallas completas, subcarpeta por dominio (ej:Auth,finca,etc)
│   ├── Auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── Finca/
│   └── ...
├── components/
│   ├── ui/                 # Shadcn/ui — piezas base editadas con estilo Croply (Button, Input, Card, etc.)
│   ├── layout/              # Navbar, Sidebar, AuthLayout, Footer
│   └── shared/              # Componentes de dominio reutilizables entre pantallas (ej: WeatherCard, TablaConPaginacion)
├── services/                # Un archivo por recurso de API (auth.service.ts, usuarios.service.ts, api.ts con la instancia de Axios)
├── types/                   # Interfaces de TypeScript, un archivo por entidad de dominio (usuario.types.ts, finca.types.ts, api.types.ts)
├── hooks/                   # Hooks custom, planos, prefijo "use" (useAuth.ts, useFarms.ts, useDebounce.ts)
├── context/                 # Contextos globales de React (AuthContext.tsx)
├── utils/                   # cn.ts, formatters.ts, validators.ts, constants.ts
├── assets/                  # Imágenes estáticas, logo, íconos propios que no vengan de una API
└── docs/                    # Repositorio interno de HUs y contratos de API
    ├── hu/
    └── api/
```

**Sobre `assets/`:** acá van el logo de Croply y cualquier imagen o ilustración estática que forme parte del código (ej. las ilustraciones de fondo de las pantallas de Auth). Se organiza en subcarpetas por tipo `assets/images/`, `assets/icons/` — no por módulo o pantalla.

**Importante:** Cuando una entidad, componente o service pertenece a un dominio de negocio (ej. "auth", "fincas"), esa pertenencia se expresa con el **nombre del archivo o subcarpeta dentro de la carpeta de su tipo** (`pages/Auth/`, `auth.service.ts`, `auth.types.ts`), nunca creando una carpeta contenedora nueva a nivel raíz.

## 4. Flujo de Trabajo e Insumos

Para el desarrollo de cualquier funcionalidad, se operará bajo las siguientes directivas de entrada:

- **Especificación del Requerimiento (HU):** el usuario indicará explícitamente qué Historia de Usuario consultar desde `docs/hu/`, o la transcribirá directamente en el chat.
- **Interfaz Visual (Opcional):** el usuario proporcionará el diseño mediante un enlace/nodo de Figma o una captura de imagen, correspondiente **únicamente a la pantalla de esa HU puntual**.
    - *En caso de no incluirse un diseño visual:* usar de forma estratégica los componentes existentes en el repositorio y las pautas de `design-system.md` para maquetar una propuesta de interfaz lógica, la cual se pulirá e iterará en los prompts siguientes.
- **Consulta Obligatoria del Sistema de Diseño:** para cada componente o vista nueva, es mandatorio verificar los tokens de variables, colores semánticos, fuentes y radios de borde declarados en `design-system.md`.

## 5. Capa de Datos (Patrón Service) y Mock-Mode

Para poder avanzar en el frontend sin depender de que el backend de esa funcionalidad esté programado, se implementa una arquitectura de desacoplamiento:

- **Regla de oro:** ningún componente o pantalla llama a un servicio HTTP (Axios) directamente. Toda llamada pasa por un archivo de servicio intermedio en `services/` (ej. `auth.service.ts`).
- **Soporte de Mocks:** cada archivo de `services/` debe contar con un interruptor global (`VITE_USE_MOCKS`, variable de entorno).
    - Si está activo (`true`), el servicio retorna datos estáticos (*mock*) que simulan la respuesta esperada según el contrato de la API.
    - Si está inactivo (`false`), el servicio realiza la llamada real contra el backend, vía la instancia de Axios configurada en `services/api.ts`.
- **Sincronización Offline (Notas):** para el registro de anotaciones del campo, el servicio debe validar si hay conexión. Si el dispositivo está sin señal, los datos de la nota se guardan temporalmente en el navegador y se sincronizan automáticamente al recuperar la conexión con el backend.

## 6. Reutilización y Buenas Prácticas

- **Buscar antes de crear:** antes de generar un componente, hook, type o función utilitaria, revisar si ya existe algo similar en `components/shared/`, `components/ui/`, `hooks/`, `types/` o `utils/` para reutilizarlo o extenderlo, en vez de duplicarlo dentro de una pantalla.
- **Código Completo:** prohibido entregar archivos truncados o con comentarios perezosos del tipo `// ... resto del código`.
- **No resolver de más.** Implementar exactamente lo que la HU y el contrato piden, ni más ni menos. No agregar abstracciones, configuraciones o manejo de casos que no estén en los criterios de aceptación "por si a futuro se necesitan". Si la IA identifica que algo *podría* ser necesario a futuro, debe mencionarlo como sugerencia en el texto, no implementarlo sin que se lo pidan.
- **Idioma:** toda la nomenclatura técnica del código (variables, funciones, archivos) se escribe en español, usar el ingles cuando sea estrictamente necesario. Todos los textos legibles por el usuario final en pantalla se redactan estrictamente en **español**.

## 7. Control de Git Manual

- **Prohibición de comandos de Git:** como asistente de IA, no se deben generar comandos de Git, ni redactar propuestas de commits, ni sugerir flujos automáticos de control de versiones. El usuario gestiona el repositorio de forma completamente manual.

## 8. Flujo de Desarrollo por HU

Para cada Historia de Usuario a implementar, seguir este orden estricto:

1. **Insumos completos primero.** No arrancar sin: la HU, el diseño de la pantalla puntual (si existe), el contrato de API de la épica correspondiente, y el design-system. Si falta alguno, señalarlo y pedirlo antes de generar código.
2. **Plan antes que código.** Describir en texto qué se va a crear (types, services, hooks, componentes, páginas) y qué endpoints del contrato se van a usar, antes de escribir cualquier archivo.
3. **Types primero:** revisar si la entidad ya existe en `types/` (ej. `usuario.types.ts`). Reutilizar si ya existe; si no, crearla con la forma exacta de los ejemplos JSON del contrato. Los tipos de request/response específicos de un endpoint van en su propio archivo de dominio (ej. `auth.types.ts`).
4. **Chequeo de utils:** antes de escribir lógica de validación (Zod) o formateo (fechas, moneda), revisar si ya existe algo reutilizable en `utils/validators.ts` o `utils/formatters.ts`.
5. **Service:** implementar o extender el archivo correspondiente en `services/` (ej. `auth.service.ts`), con el switch `VITE_USE_MOCKS`, devolviendo datos mockeados con los types del paso 3.
6. **Hooks (si aplica):** si la pantalla necesita lógica de estado o fetching reutilizable, crear o extender el hook correspondiente en `hooks/` (ej. `useAuth.ts`), consumiendo el service del paso 5. TanStack Query es la herramienta preferida para estado de servidor.
7. Gestión e Inventario de Componentes (Evaluación Autónoma):
Se debe consultar [design-system.md](http://design-system.md/) como guía de referencia y revisar el repositorio existente para determinar qué componentes usar, extendiendo o creando según los siguientes criterios:
    
    a) Chequeo de existencia:
    
    - Verificar si el componente (o uno similar) ya existe en components/ui/, components/shared/, components/layout/ o dentro de src/pages/<Dominio>/.
    
    b) Criterio de Decisión (Reutilizar vs. Extender vs. Crear):
    
    - REUTILIZAR: Si el componente existente satisface los requerimientos con sus props actuales.
    - EXTENDER: Si se puede adaptar agregando props opcionales, eventos o variantes de estilo SIN romper su comportamiento en otras pantallas donde ya se utiliza.
    - CREAR NUEVO: Si extenderlo requeriría demasiados condicionales (if/else), rompería el principio de responsabilidad única o pondría en riesgo la estabilidad de otras pantallas.
    
    c) Reglas de Ubicación para Componentes Nuevos:
    
    - Componentes base/primitivos de UI (botones, inputs, modales base): En src/components/ui/ (vía Shadcn UI).
    - Componentes de dominio reutilizables en >1 pantalla (ej: WeatherCard, TablaConPaginacion): En src/components/shared/.
    - Estructuras envolventes o navegación global: En src/components/layout/.
    - Componentes exclusivos de la pantalla actual: Dentro de src/pages/<Dominio>/components/ (o en el mismo archivo si es muy pequeño).
    
    Nota: No es necesario imprimir una lista previa ni detenerse a pedir confirmación al usuario salvo que falte instalar una librería nueva de Shadcn/ui.
    
8. **Construcción de UI:**  construir la página en `pages/<Dominio>/NombrePage.tsx`, siguiendo el diseño de la pantalla puntual y los tokens del design-system, consumiendo los types, service/hook y componentes ya definidos.
9. **Lógica de interacción:** validaciones, manejo de errores (`handleFormError`) y mensajes de éxito (`showSuccessToast`), estados de carga.
10. **Verificación de Integración (Mocks y Backend)**: Verificar que la interfaz funciona correctamente en modo mock (VITE_USE_MOCKS=true) y que la integración con la API real esté correctamente mapeada para cuando el backend esté activo.
11. **Responsive:** verificar que la pantalla/componente cumple la estrategia de adaptación mobile definida en `design-system.md` antes de dar la UI por terminada:
    - Sidebar: fijo en desktop (`≥ lg`), oculto y reemplazado por `Sheet` (drawer) en mobile/tablet.
    - Grillas de cards: pasan de 2-4 columnas a 1 columna (`grid-cols-1`) en mobile.
    - Tablas: scroll horizontal (`overflow-x-auto`) y ocultar columnas de menor prioridad en mobile (`hidden md:table-cell`).
    - Modales/Dialogs: full-width con `mx-4`, o reemplazar por `Drawer` desde abajo en mobile, según lo que indique la sección 7 del design-system para ese componente puntual.
    - Formularios multi-columna: pasan a 1 columna en mobile.
    - Botones de acción en tablas: solo ícono en mobile (con tooltip en tap), ícono + texto en desktop.
12. **Auto-chequeo final:** confirmar explícitamente, uno por uno, que se cumplen todos los Criterios de Aceptación de la HU, y que el paso 11 (Responsive) fue verificado.

## 9. Componentes o enlaces que dependen de pantallas aún no construidas

Cuando la HU actual requiera agregar un elemento (botón, enlace, modal, sección) que navegue o conecte con una pantalla que no corresponde al alcance actual:

1. Detección de pantalla inexistente: La IA debe verificar si el archivo/ruta de destino ya existe en `src/pages/`. Si no existe en el proyecto, se considera una pantalla pendiente.
2. Delimitación de alcance: NO intentar construir la pantalla completa de destino ni inventar su lógica.
3. Ruta y Placeholder Mínimo: Crear únicamente el componente/botón solicitado. Si requiere navegación (URL), registrar la ruta mínima en el Router envolviendo un contenedor placeholder simple (ej: "Pantalla en construcción").
4. Trazabilidad: Dejar un comentario en el código indicando la pendiente: `// TODO: Reemplazar por la pantalla real cuando se implemente este módulo`.
5. Reutilización futura: Cuando en el futuro se implemente la pantalla real, se integrará sobre la ruta y componente ya creados.

## 10. Alcance de la Épica en curso

Al trabajar sobre una épica específica, la IA debe implementar **exclusivamente** lo definido en el contrato de esa épica y en las HU que se le vayan pasando. No debe:

- Implementar endpoints de otras épicas, aunque figuren en el diagrama de clases general.
- Agregar campos, validaciones o funcionalidades "por si se necesitan a futuro".
- Asumir funcionalidades que parezcan lógicas pero no estén explícitamente pedidas en la HU o el contrato.

Si detecta que algo debería existir pero no está definido en el contrato ni en la HU correspondiente, debe señalarlo en texto y esperar confirmación antes de programarlo.