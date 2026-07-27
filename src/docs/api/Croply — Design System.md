# Croply — Design System

Propietario: Paula Rodriguez

> Sistema agrícola de gestión de fincas, parcelas y cultivos.
Stack de diseño: **shadcn/ui** + **Tailwind CSS** + React 18 + TypeScript + Vite
Fuente: **Montserrat** · Iconos: **HugeIcons** (variante stroke)
> 

---

## 1. Paleta de colores

### Colores primitivos

#### Verdes — `green-*`

| Token | Hex | Uso |
| --- | --- | --- |
| `green-50` | `#E8F5EF` | Fondos de hover, sidebar-accent, progress bar bg |
| `green-100` | `#C5EEE1` | Bordes sutiles en contextos verdes, badges borde |
| `green-200` | `#7DD4B4` | Elementos decorativos, iconografía secundaria |
| `green-300` | `#3DB88B` | Badges de estado activo claro |
| `green-400` | `#12A46E` | Estados activos, etiquetas de etapa de cultivo |
| `green-500` | `#076B45` | **Color institucional principal** |
| `green-600` | `#055534` | Hover sobre elementos primarios |
| `green-700` | `#033D25` | Estado pressed, énfasis máximo |

#### Cremas — `cream-*`

| Token | Hex | Uso |
| --- | --- | --- |
| `cream-25` | `#F5F2EC` | Fondo general de la aplicación (`background`) |
| `cream-50` | `#F7F3EB` | Fondos secundarios, inputs deshabilitados, muted |
| `cream-100` | `#EDE4D3` | Bordes de cards, inputs, sidebar-border |
| `cream-200` | `#DDD0B8` | Bordes con mayor contraste |
| `cream-original` | `#FFF8EC` | Color institucional original (en paleta, sin uso directo en UI) |

#### Estados

| Token | Hex | Uso |
| --- | --- | --- |
| `red-600` | `#DC2626` | Destructivo: eliminar, error crítico, validación fallida |
| `yellow-400` | `#FBBF24` | Advertencia: umbrales próximos, tareas pendientes, alertas IA |
| `blue-400` | `#60A5FA` | Informativo: datos IoT, pronóstico climático, sugerencias |

#### Neutros

| Token | Hex | Uso |
| --- | --- | --- |
| `neutral-950` | `#0A0A0A` | Texto principal (`foreground`) |
| `neutral-500` | `#737373` | Texto secundario, placeholders, fechas, metadatos |
| `white` | `#FFFFFF` | Cards, sidebar, popovers, superficies elevadas |

---

### Variables semánticas (shadcn/ui mode)

Estas son las variables que controlan los componentes. Apuntan a los primitivos arriba.

| Variable | Valor | Descripción |
| --- | --- | --- |
| `background` | `#F5F2EC` | Fondo general de la app |
| `foreground` | `#0A0A0A` | Texto principal |
| `card` | `#FFFFFF` | Fondo de cards y paneles |
| `card-foreground` | `#0A0A0A` | Texto dentro de cards |
| `popover` | `#FFFFFF` | Fondo de dropdowns y tooltips |
| `popover-foreground` | `#0A0A0A` | Texto en popovers |
| `primary` | `#076B45` | Botones CTA, acción principal |
| `primary-foreground` | `#FAFAFA` | Texto sobre botones primarios |
| `secondary` | `#F7F3EB` | Botones secundarios, chips neutros |
| `secondary-foreground` | `#0A0A0A` | Texto sobre elementos secundarios |
| `muted` | `#F7F3EB` | Fondos de baja jerarquía, inputs deshabilitados |
| `muted-foreground` | `#737373` | Texto secundario, placeholders, fechas |
| `accent` | `#E8F5EF` | **Hover global** — fondo al pasar el mouse sobre elementos interactivos |
| `accent-foreground` | `#076B45` | Texto en estado hover |
| `destructive` | `#DC2626` | Acciones destructivas y errores |
| `border` | `#EDE4D3` | Bordes de separación generales |
| `input` | `#EDE4D3` | Borde de campos de formulario |
| `ring` | `#076B45` | Anillo de foco (accesibilidad) |
| `sidebar` | `#FFFFFF` | Fondo del panel lateral |
| `sidebar-foreground` | `#0A0A0A` | Texto de ítems del sidebar |
| `sidebar-primary` | `#076B45` | Ítem activo del sidebar |
| `sidebar-primary-foreground` | `#FAFAFA` | Texto sobre ítem activo con fondo sólido |
| `sidebar-accent` | `#E8F5EF` | Fondo del ítem activo y hover en sidebar |
| `sidebar-accent-foreground` | `#076B45` | Texto del ítem activo y en hover |
| `sidebar-border` | `#EDE4D3` | Línea divisoria del sidebar |
| `sidebar-ring` | `#076B45` | Foco dentro del sidebar |

---

## 2. Tipografía

**Fuente única:** Montserrat (Google Fonts)
**Sin fuente secundaria.**
La escala sigue la nomenclatura de Tailwind CSS (`text-xs` → `text-4xl`), que shadcn/ui adopta de forma nativa. Esto permite que los estilos definidos en Figma tengan correspondencia directa con las clases en el código.

| Elemento | Clase Tailwind | Tamaño Desktop | Tamaño Mobile | Peso | Peso numérico |
| --- | --- | --- | --- | --- | --- |
| Título principal | `text-4xl` / `text-2xl` | 36px | 24px | Bold | 700 |
| Título de sección | `text-2xl` / `text-xl` | 24px | 20px | SemiBold | 600 |
| Título de card | `text-xl` / `text-lg` | 20px | 18px | SemiBold | 600 |
| Subtítulos / Labels | `text-sm` | 14px | 14px | Medium | 500 |
| Texto regular / Body | `text-base` | 16px | 16px | Regular | 400 |
| Cabecera de tabla | `text-sm` / `text-xs` | 14px | 12px | Medium | 500 |
| Datos / Caption | `text-xs` | 12px | 12px | Regular | 400 |

**Regla de pesos:**

- `700 Bold` → títulos principales, anclan visualmente cada sección
- `600 SemiBold` → títulos de cards y secciones
- `500 Medium` → botones, labels, elementos interactivos
- `400 Regular` → cuerpo de texto, descripciones, metadatos

---

## 3. Espaciado

Sistema de espaciado base **8px** (múltiplos de 4px para valores pequeños). Tailwind classes correspondientes.

| Token | Valor | Clase Tailwind | Uso típico |
| --- | --- | --- | --- |
| `space-1` | 4px | `p-1` / `m-1` | Padding interno de badges y chips |
| `space-2` | 8px | `p-2` / `m-2` | Gap entre iconos y texto, padding de ítems compactos |
| `space-3` | 12px | `p-3` / `m-3` | Padding interno de botones, separación entre elementos de lista |
| `space-4` | 16px | `p-4` / `m-4` | Padding interno de cards, márgenes entre secciones menores |
| `space-5` | 20px | `p-5` / `m-5` | Separación entre grupos de componentes |
| `space-6` | 24px | `p-6` / `m-6` | Padding de secciones, márgenes entre bloques de contenido |
| `space-8` | 32px | `p-8` / `m-8` | Separación entre secciones principales de una pantalla |
| `space-10` | 40px | `p-10` / `m-10` | Márgenes de layout, separación de módulos grandes |
| `space-12` | 48px | `p-12` / `m-12` | Padding de contenedores principales |

**Regla general:** usar `space-4` (16px) como unidad base de padding de cards y `space-6` (24px) como separación entre secciones.

---

## 4. Breakpoints

| Nombre | Ancho mínimo | Clase Tailwind | Comportamiento |
| --- | --- | --- | --- |
| Mobile | < 640px | (base, sin prefijo) | Sidebar colapsado como drawer desde abajo. Layout en columna única. |
| SM | ≥ 640px | `sm:` | Ajustes menores de tipografía y padding. |
| MD (Tablet) | ≥ 768px | `md:` | Sidebar aparece como overlay lateral. Grid de parcelas pasa a 2 columnas. |
| LG (Desktop) | ≥ 1024px | `lg:` | Sidebar fijo visible. Layout principal en 2 columnas (contenido + panel derecho). |
| XL | ≥ 1280px | `xl:` | Grillas de 3-4 columnas. Paneles laterales con más información visible. |

**Comportamiento del sidebar:**

- Mobile/tablet (`< lg`): se oculta, se abre como `Sheet` (drawer lateral) al presionar el botón de menú.
- Desktop (`≥ lg`): fijo y siempre visible a la izquierda.

---

## 5. Border radius

| Token | Valor | Clase Tailwind | Uso |
| --- | --- | --- | --- |
| `radius-sm` | 8px | `rounded-md` | Badges, chips, botones pequeños |
| `radius-base` | 10px | `rounded-lg` | Botones, inputs, tooltips |
| `radius-card` | 12px | `rounded-xl` | Cards, paneles, modales |
| `radius-full` | 9999px | `rounded-full` | Avatares, badges de estado redondos |

---

## 6. Sombras

| Token | Clase Tailwind | Uso |
| --- | --- | --- |
| `shadow-sm` | `shadow-sm` | Cards en estado normal |
| `shadow-md` | `shadow-md` | Cards en hover, popovers |
| `shadow-lg` | `shadow-lg` | Modales, dialogs, elementos flotantes |

---

## 7. Componentes principales

### 7.1 Sidebar / Navegación principal

**Sidebar (Navegación Lateral):**

- **Estructura:** Logo Croply en la cabecera superior y lista de ítems de navegación vertical con icono (`HugeIcons stroke`) + etiqueta.
- **Estados de ítem:**
    - *Default:* texto `foreground` (`#0A0A0A`), sin fondo.
    - *Hover:* fondo `sidebar-accent` (`#E8F5EF`), texto `sidebar-accent-foreground` (`#076B45`).
    - *Activo:* fondo `sidebar-accent` (`#E8F5EF`), texto `sidebar-primary` (`#076B45`), ícono verde.
- **Mobile:** Se renderiza como `Sheet` de `shadcn/ui`, desplegándose desde la izquierda con overlay.

**Header / Topbar (Barra Superior):**

- **Estructura:**
    - Acciones a la derecha: Icono de notificaciones (`Bell`), avatar/icono de perfil (`CircleUser`) y menú desplegable (`ChevronDown`).

---

### 7.2 Botones

Usar el componente `Button` de shadcn/ui con las variantes:

| Variante | Fondo | Texto | Borde | Uso |
| --- | --- | --- | --- | --- |
| `default` (primary) | `#076B45` | `#FAFAFA` | — | Acciones principales: "Agregar Finca", "Guardar", "Asociar cultivo" |
| `secondary` | `#F7F3EB` | `#0A0A0A` | — | Acciones secundarias: "Ver notas", "Cancelar" (soft) |
| `outline` | Transparente | `#0A0A0A` | `#EDE4D3` | Acciones terciarias: "Ver detalle", "Exportar" (antes del PDF) |
| `destructive` | `#DC2626` | `#FFFFFF` | — | Eliminar lote, eliminar usuario, rechazar solicitud |
| `ghost` | Transparente | `#076B45` | — | Acciones dentro de cards o tablas: "Ver más", links |

**Con ícono:** agregar ícono HugeIcons a la izquierda del label. Tamaño del ícono: 16px.
**Tamaño de texto:** `text-sm` (14px), peso Medium (500).
**Hover:** oscurecer fondo 10% (usar `green-600` #055534 para hover de primary).
**Transición:** `transition-colors duration-150`

---

### 7.3 Cards

**Card base (parcelas, cultivos, información):**

- Fondo: `#FFFFFF`
- Borde: `1px solid #EDE4D3`
- Border radius: `rounded-xl` (12px)
- Sombra: `shadow-sm`
- Padding interno: `p-4` (16px)
- Hover: `shadow-md`, transición `duration-200`

**Card de recomendación IA:**

- Header: fondo `#076B45`, texto blanco, ícono ✦
- Alerta interna: fondo `#FFFBEB`, borde `#FDE68A` (amarillo warning)
- Cuerpo: título bold + descripción en `muted-foreground`
- Datos de contexto: label en gris + valor en bold
- Botón de acción al pie: variante `default` (primary verde)

**Card de métricas (dashboard admin):**

- Número grande: `text-4xl` Bold
- Label: `text-sm` `muted-foreground`
- Ícono decorativo: HugeIcons 24px, color `green-400`
- Indicador de tendencia: texto `text-xs` con color verde (positivo) o rojo (negativo)

---

### 7.4 Badges / Chips de estado

Usar el componente `Badge` de shadcn/ui.

| Tipo | Fondo | Texto | Borde | Cuándo usarlo |
| --- | --- | --- | --- | --- |
| Activo / Éxito | `#E8F5EF` | `#076B45` | `#C5EEE1` | Parcela activa, sensor OK, tarea completada |
| Etapa cultivo | `#076B45` | `#FFFFFF` | — | Vegetativo, Siembra, Floración, Cosecha |
| Advertencia | `#FFFBEB` | `#92400E` | `#FDE68A` | Pendiente, umbral próximo |
| Error / Crítico | `#FEF2F2` | `#991B1B` | `#FECACA` | Sensor crítico, error, rechazado |
| Inactivo / Neutro | `#F7F3EB` | `#737373` | `#EDE4D3` | Parcela inactiva, sin cultivo asignado |
| Informativo | `#EFF6FF` | `#1E40AF` | `#BFDBFE` | Transmitiendo, en monitoreo |

**Tamaño de texto:** `text-xs` (12px), peso Medium (500).
**Border radius:** `rounded-full`

---

### 7.5 Inputs y formularios

Usar componentes `Input`, `Select`, `Textarea` de shadcn/ui.

**Input default:**

- Borde: `1px solid #EDE4D3`
- Fondo: `#FFFFFF`
- Texto: `#0A0A0A`
- Placeholder: `#737373`
- Border radius: `rounded-lg` (10px)
- Padding: `px-3 py-2`

**Input focus:**

- Borde: `#076B45`
- Ring: `ring-2 ring-green-500/20`

**Input error:**

- Borde: `#DC2626`
- Mensaje de error debajo: `text-xs` color `#DC2626`

**Input disabled:**

- Fondo: `#F7F3EB`
- Texto: `#737373`
- Cursor: `not-allowed`

**Label:** `text-sm` Medium (500), color `#0A0A0A`, `mb-1.5` sobre el input.

---

### 7.6 Tablas de datos

Usar el componente `Table` de shadcn/ui.

**Cabecera (`thead`):**

- Fondo: `#F7F3EB`
- Texto: `text-sm` Medium (500), color `#737373`
- Borde inferior: `1px solid #EDE4D3`

**Filas (`tbody tr`):**

- Fondo default: `#FFFFFF`
- Hover: fondo `#E8F5EF`
- Borde inferior: `1px solid #EDE4D3`
- Texto: `text-sm` Regular (400), color `#0A0A0A`

**Columna de acciones:** íconos HugeIcons 16px — ojo (ver), lápiz (editar), papelera (eliminar). Color `#737373`, hover `#076B45`.

**Paginación:** componente `Pagination` de shadcn/ui, alineado a la derecha.

---

### 7.7 Modales / Dialogs

Usar `Dialog` o `AlertDialog` de shadcn/ui.

**Dialog (formularios):**

- Fondo: `#FFFFFF`
- Border radius: `rounded-xl`
- Sombra: `shadow-lg`
- Overlay: `rgba(0,0,0,0.4)`
- Header: título `text-xl` SemiBold + botón ✕ para cerrar
- Footer: botones alineados a la derecha (`Cancelar` outline + `Guardar` primary)

**AlertDialog (confirmaciones destructivas):**

- Mismo estilo que Dialog
- Título en `text-lg` SemiBold
- Descripción en `muted-foreground`
- Footer: `Cancelar` outline + `Eliminar` destructive

---

### 7.8 Alerts / Notificaciones

**Alert inline (dentro de pantalla):**
Usar componente `Alert` de shadcn/ui.

| Variante | Fondo | Borde | Ícono | Texto |
| --- | --- | --- | --- | --- |
| Éxito | `#E8F5EF` | `#C5EEE1` | ✓ verde | `#076B45` |
| Advertencia | `#FFFBEB` | `#FDE68A` | ! amarillo | `#92400E` |
| Error | `#FEF2F2` | `#FECACA` | ! rojo | `#991B1B` |
| Info | `#EFF6FF` | `#BFDBFE` | i azul | `#1E40AF` |

**Toast / Sonner (notificaciones flotantes):**
Usar `Sonner` de shadcn/ui. Aparece en esquina inferior derecha.

- Duración: 4000ms
- Posición: `bottom-right`
- Variantes: success (verde), warning (amarillo), error (rojo), info (azul)

---

### 7.9 Skeleton / Estados de carga

Usar `Skeleton` de shadcn/ui.

- Color: `#EDE4D3` con animación pulse
- Usar para: cards de parcelas, filas de tabla, datos de sensores IoT mientras cargan
- Mostrar la misma estructura del componente que va a aparecer (mismo alto, mismo ancho)

---

### 7.10 Empty states

Cuando una sección no tiene datos (ej. parcela sin cultivo asignado):

- Ícono HugeIcons grande centrado, color `#EDE4D3`
- Título: `text-lg` SemiBold, color `#0A0A0A`
- Descripción: `text-sm` Regular, color `#737373`
- Botón de acción primaria debajo (si aplica): variante `default`

---

### 7.11 Progress / Timeline de etapas

Usar para mostrar la evolución del cultivo (Preparación → Siembra → Crecimiento → Cosecha).

- Track: `#E8F5EF`, height `4px`, `rounded-full`
- Fill activo: `#076B45`
- Nodo completado: círculo `#076B45` relleno
- Nodo activo: círculo `#076B45` con ring exterior `#C5EEE1`
- Nodo futuro: círculo `#EDE4D3` vacío
- Label debajo de cada nodo: `text-xs` Regular, color `#737373`

---

### 7.12 Avatar

Usar `Avatar` de shadcn/ui.

- Tamaño default: 32px × 32px
- Tamaño grande (perfil): 40px × 40px
- Fallback (sin foto): iniciales en `text-sm` Medium, fondo `#076B45`, texto `#FFFFFF`
- Border radius: `rounded-full`

---

## 8. Animaciones y transiciones

| Elemento | Propiedad animada | Duración | Easing |
| --- | --- | --- | --- |
| Hover en botones | `background-color` | 150ms | `ease-in-out` |
| Hover en cards | `box-shadow` | 200ms | `ease-in-out` |
| Hover en ítems de sidebar | `background-color` | 150ms | `ease-in-out` |
| Hover en filas de tabla | `background-color` | 100ms | `ease-in-out` |
| Apertura de modal/dialog | `opacity` + `scale` (0.95 → 1) | 200ms | `ease-out` |
| Cierre de modal/dialog | `opacity` + `scale` (1 → 0.95) | 150ms | `ease-in` |
| Drawer/Sheet (mobile) | `transform: translateX` | 300ms | `ease-in-out` |
| Toast/Sonner entrada | `translateY` + `opacity` | 350ms | `ease-out` |
| Skeleton pulse | `opacity` (0.5 → 1 → 0.5) | 1500ms | `ease-in-out` infinite |

**No usar:** scale en hover de cards (mantener layout estable para datos agrícolas). Preferir cambio de sombra sobre escala.

Clase Tailwind para transiciones base: `transition-colors duration-150 ease-in-out`

---

## 9. Iconografía

**Librería:** HugeIcons (reemplaza Lucide Icons de shadcn/ui por defecto)
**Variante:** Stroke (trazo, no relleno)
**Tamaños:**

| Contexto | Tamaño |
| --- | --- |
| Ícono dentro de botón | 16px |
| Ícono en sidebar | 18px |
| Ícono en cabecera de card | 20px |
| Ícono decorativo / empty state | 48px |
| Ícono de métrica en dashboard | 24px |

**Color default:** heredar del contexto (`currentColor`)
**Color en sidebar activo:** `#076B45`**Color en muted/secundario:** `#737373`

---

## 10. Layout general

```
┌─────────────────────────────────────────────────────┐
│ TOPBAR (solo mobile: logo + hamburger)              │
├──────────────┬──────────────────────────────────────┤
│              │  HEADER DE SECCIÓN                   │
│   SIDEBAR    │  (título + descripción + CTA)        │
│   260px      ├──────────────────────────────────────┤
│   fijo       │                                      │
│   desktop    │   CONTENIDO PRINCIPAL                │
│              │   (grid de cards / tabla / detalle)  │
│              │                                      │
│              ├──────────────────────────────────────┤
│              │  PANEL DERECHO (clima, recomend. IA) │
│              │  ~320px · solo en pantallas ≥ lg     │
└──────────────┴──────────────────────────────────────┘
```

**Ancho del sidebar:** 260px (desktop), collapsible a 64px (icono only) en algunos layouts.
**Contenido principal:** `max-w-screen-xl`, centrado, con `px-6` lateral.
**Panel derecho:** columna fija de ~320px en desktop, colapsa debajo del contenido en mobile.

---

## 11. Pantallas definidas

> Columna "Reutiliza": si un componente ya aparece en otra fila de esta tabla, se marca acá con el ID de esa pantalla — es señal directa de que ese componente va a `components/shared/` o `components/layout/`, no se reconstruye de cero.
> 

### Landing y Acceso Público

| ID | Pantalla | Componentes clave | Reutiliza |
| --- | --- | --- | --- |
| PAN-GA-01 | Landing | Hero, cards de features (x3), stats grid, CTA final | — |
| PAN-GA-02 | Solicitar Digitalización de Finca | Formulario público (datos personales + finca) | — |
| PAN-GA-03 | Inicio de sesión | Formulario login, layout con ilustración de fondo | Layout compartido con PAN-GA-04 → `AuthLayout` (`components/layout/`) |
| PAN-GA-04 | Registro de usuario | Formulario registro, layout con ilustración de fondo | Layout compartido con PAN-GA-03 → `AuthLayout` (`components/layout/`) |

### Usuario Administrador de Finca

| ID | Pantalla | Componentes clave | Reutiliza |
| --- | --- | --- | --- |
| PAN-AF-01 | Mi Finca — Dashboard principal | Grid de parcelas, card de clima, card recomendación IA, resumen de costos, widget de notas | — |
| PAN-AF-02 | Detalle de parcela sin cultivo | Sensores IoT, empty state con CTA "Asignar Cultivo", notas | Card de clima → PAN-AF-01, PAN-AF-03. Card recomendación IA → PAN-AF-01, PAN-AF-03. Widget de notas → PAN-AF-01, PAN-AF-03 |
| PAN-AF-03 | Detalle de parcela con cultivo | Sensores IoT, timeline de etapas, lista de tareas del día, recomendación IA | Card de clima → PAN-AF-01, PAN-AF-02. Card recomendación IA → PAN-AF-01, PAN-AF-02. Grid sensores IoT → PAN-AF-02 |
| PAN-AF-04 | Biblioteca de cultivos | Grid de cards de cultivo con imagen, filtros por temporada, buscador | — |
| PAN-AF-05 | Detalle de cultivo | Ficha técnica, variedades disponibles, cronograma teórico, CTA asociar | — |
| PAN-AF-06 | Generar plan de acción | Formulario de configuración de siembra + vista mensual del plan | — |
| PAN-AF-07 | Agroquímicos | Tabla paginada con filtros, botón "Registrar Aplicación" | Tabla+paginación → PAN-AF-09, PAN-AF-10, PAN-AC-02, PAN-AC-03, PAN-AC-04, PAN-AC-05 |
| PAN-AF-08 | Modal registrar agroquímico | Formulario en dialog: parcela, finca, producto, dosis, fecha, responsable | — |
| PAN-AF-09 | Costos | Tabla de gastos + card total del mes + gráfico de barras por mes | Tabla+paginación → PAN-AF-07 (y otras). Gráfico de barras → PAN-AC-01, PAN-RS-02 |
| PAN-AF-10 | Gestión de usuarios | Lista de personal, estados de cuenta (Pendiente/Activo/Inactivo), roles | Tabla+paginación → PAN-AF-07, PAN-AF-09 (y otras). Badge de estado → PAN-AC-02, PAN-AC-03, PAN-AC-04, PAN-AC-05 |

### Usuario Administrador Croply (SuperAdmin)

| ID | Pantalla | Componentes clave | Reutiliza |
| --- | --- | --- | --- |
| PAN-AC-01 | Dashboard global | Métricas: clientes, sensores IoT activos, hectáreas. Gráfico de barras + donut | Card de métrica → PAN-AC-04. Gráfico de barras → PAN-AF-09, PAN-RS-02 |
| PAN-AC-02 | Gestión de clientes — Administradores | Tabla de admins con estados, CTA "Agregar Cliente" | Tabla+paginación y Badge de estado → PAN-AC-03, PAN-AC-04, PAN-AC-05, PAN-AF-10 |
| PAN-AC-03 | Gestión de clientes — Solicitudes | Tabla de solicitudes, badges: Pendiente/Aprobada/Rechazada/Contactada | Tabla+paginación y Badge de estado → PAN-AC-02, PAN-AC-04, PAN-AC-05, PAN-AF-10 |
| PAN-AC-04 | Fincas e Infraestructura | Tabla de fincas con métricas globales (totales, activas, alertas, hectáreas) | Tabla+paginación → PAN-AC-02, PAN-AC-03, PAN-AC-05, PAN-AF-10. Card de métrica → PAN-AC-01 |
| PAN-AC-05 | Detalle de finca | Info de finca + tabla de parcelas/sensores con estado (Activo/Crítico/Mantenimiento) | Tabla+paginación y Badge de estado → PAN-AC-02, PAN-AC-03, PAN-AC-04, PAN-AF-10 |
| PAN-AC-06 | Crear finca | Formulario multi-paso: datos de finca → asignación de cliente | — |
| PAN-AC-07 | Crear parcela | Formulario: nombre, superficie, controladores IoT y sensores vinculados | — |
| PAN-AC-08 | Catálogos base | Gestión de cultivos, plantillas de acción, roles, estados de tarea, tipos de sensor | Patrón "lista + botón agregar" repetido internamente entre catálogos — evaluar si se extrae un componente propio al implementarla |
| PAN-AC-09 | Soporte / FAQ | Editor de preguntas frecuentes para el Centro de Ayuda | — |

### Reportes

| ID | Pantalla | Componentes clave | Reutiliza |
| --- | --- | --- | --- |
| PAN-RS-01 | Exportar reporte de agroquímicos | Dialog con filtros (fechas, finca, parcela) + vista previa + descarga PDF | Estructura de dialog+filtros+preview → PAN-RS-02 |
| PAN-RS-02 | Exportar reporte de costos | Dialog con filtros + vista previa con gráfico + descarga PDF | Estructura de dialog+filtros+preview → PAN-RS-01. Gráfico de barras → PAN-AF-09, PAN-AC-01 |

---

## 12. Mobile — estrategia de adaptación

Las pantallas fueron diseñadas en desktop. La estrategia para mobile es **responsive progresivo** usando los breakpoints de Tailwind, sin rediseñar pantallas desde cero.

### Reglas generales

| Elemento | Desktop | Mobile |
| --- | --- | --- |
| Sidebar | Fijo 260px a la izquierda | Oculto, se abre como `Sheet` con botón hamburger |
| Grillas de cards | 2-4 columnas (`grid-cols-2` / `grid-cols-4`) | 1 columna (`grid-cols-1`) |
| Panel derecho (clima, IA) | Columna fija ~320px | Colapsa debajo del contenido principal |
| Tablas de datos | Todas las columnas visibles | Scroll horizontal (`overflow-x-auto`) + columnas prioritarias visibles |
| Modales / Dialogs | Centrado en pantalla, ancho fijo | Full-width con `mx-4`, o usar `Drawer` desde abajo |
| Formularios multi-columna | 2 columnas | 1 columna |
| Botones de acción en tablas | Íconos con texto | Solo íconos (tooltip en tap) |

### Pantallas de Admin Croply en mobile

Las pantallas PAN-AC-* tienen mucho contenido tabular. Se adaptan con scroll horizontal en tablas y ocultando columnas de menor prioridad en mobile (`hidden md:table-cell`). No se diseñaron versiones mobile específicas para el rol SuperAdmin — se acepta experiencia reducida en pantallas pequeñas para ese rol.

### Topbar mobile

Visible solo en mobile (`lg:hidden`):

- Logo Croply a la izquierda
- Ícono hamburger a la derecha para abrir el sidebar como Sheet
- Campana de notificaciones entre ambos

## 13. Reglas para generación con IA

Al generar código o pantallas para Croply, seguir estas reglas en orden de prioridad:

1. **Usar shadcn/ui como base** para todos los componentes. Nunca inventar reemplazos custom cuando existe un componente shadcn equivalente.
2. **Usar Tailwind CSS** para todos los estilos. Sin CSS inline ni clases custom innecesarias.
3. **Usar tokens, nunca valores hardcodeados**. Escribir `bg-primary` no `bg-[#076B45]`. Excepciones solo para colores fuera del sistema (ej. charts).
4. **Montserrat para toda la tipografía**. Sin excepciones.
5. **HugeIcons outline** para todos los iconos. Stroke-width 1. Tamaño según contexto (nav: 20px, inline: 16px).
6. **Radio `rounded-lg`** por defecto en todos los componentes interactivos.
7. **Cards sobre fondo crema**. `bg-card` sobre `bg-background`. Nunca card sobre card sin separación.
8. **Mantener la jerarquía tipográfica**: un `text-4xl` por pantalla, luego `text-2xl` para secciones, etc.
9. **No introducir nuevas librerías, paletas o componentes** sin documentarlos primero en este archivo.
10. **Las acciones destructivas siempre requieren confirmación** via `<Dialog />` antes de ejecutarse.