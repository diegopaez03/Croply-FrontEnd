# Contrato de API — Épica 3: Gestionar Fincas, Parcelas y Cultivos

Propietario: Paula Rodriguez

> Este contrato no repite las convenciones transversales ya definidas en épicas anteriores (ERR-01 a ERR-05, ERR-06 a ERR-08 de Épica 4, y la convención de `message` en éxitos). Solo se detallan acá endpoints, requests, responses y errores específicos de esta épica.
> 

---

## Pendientes (Decisiones tomadas en esta 1° version - no modificar)

**1. `motivo_finalizacion` en HU-FP-06 (historial de cultivos) no tiene respaldo en el DC.** El AC pide un indicador visual que distinga si un cultivo del historial finalizó naturalmente (cosecha) o fue inactivado por la baja de la parcela, pero `PlanAccion.estado` (`EstadoPlanAccion`: `Finalizado | Iniciado | Activo`) no tiene ningún valor que distinga esos dos casos — ambos probablemente terminan en `Finalizado`. Falta definir si se necesita un nuevo valor de enum, un campo booleano adicional, o algún otro mecanismo para poder mostrar esa distinción.

**2. HU-BC-06 (Épica 4)** — implementada. El detalle de parcela lista solo planes `Activo` en `cultivos`; el historial excluye `Activo`. El cronograma y el ABM de tareas viven en `/planes-accion/:id_plan_accion`.

**3. `recomendacion_ia_resumen` en HU-FP-08 depende del contrato de `HU-NA-03`, que todavía no existe.** El campo queda en la respuesta como `null` hasta que ese contrato se escriba y se pueda definir el shape real.

---

## Nota de integración con el simulador IoT (informativa — no expone endpoints al frontend)

El frontend **nunca** se comunica con el simulador directamente, solo con la API de Croply. Se deja documentado acá para que quede claro por qué ciertas respuestas pueden tardar en reflejar datos "en vivo":

- Al crear/editar/dar de baja una parcela, **una vez confirmada la transacción en la base de Croply** (nunca antes — si la transacción de Croply falla, no se sincroniza nada), el backend sincroniza de forma **asíncrona** con el simulador (`POST /parcelas`, `PUT /parcelas/:id`, `DELETE /parcelas/:id` del lado del simulador). Esto significa que el `201`/`200` que recibe el frontend al guardar una parcela **no depende** de que la sincronización con el simulador haya terminado ni haya sido exitosa — la parcela ya quedó guardada en Croply de todas formas.
- Si la sincronización falla, Croply reintenta hasta 3 veces; si sigue fallando tras el tercer intento, el backend crea una `Notificacion` (`tipo: Evento_general`) para el Admin Croply dueño de la operación, en vez de un toast bloqueante en el momento — la sincronización ocurre en segundo plano y el usuario puede no estar ni en esa pantalla cuando falla definitivamente. **Confirmado con backend**, no requiere ningún endpoint nuevo de este lado: el frontend simplemente ve esta notificación aparecer en su centro de notificaciones existente (fuera del alcance de este contrato, ya definido en otra épica).
- El simulador nunca genera sus propios IDs — siempre usa los mismos `id_parcela`/`id_controlador_sensores`/`id_sensor` que le manda Croply. Por eso el frontend no necesita mapear ningún ID adicional.
- `Sensor.ultimo_valor` y `Sensor.fecha_ultima_lectura` quedan `null` justo después de crear un sensor — recién se completan cuando Croply consulta al simulador y este ya generó su primer ciclo de lecturas (hasta 25 minutos después, responsabilidad exclusiva del backend). El frontend simplemente los recibe `null` hasta entonces en cualquier `GET`, sin necesidad de ningún polling especial de su lado.
- `Sensor.estado_senal` arranca en `"Sin_senal"` al crear y el backend lo actualiza a `"Transmitiendo"` cuando llega la primera lectura real — mismo mecanismo, sin acción del frontend.

---

## Errores específicos que se agregan en esta Épica

Reutilizar siempre que aplique: `REQUIRED_FIELD` (ERR-01), `DUPLICATE_VALUE` (ERR-02), `RESOURCE_IN_USE` (ERR-04), `RESOURCE_NOT_FOUND` (ERR-05). Los "[ERR-01]" que las HU mencionan en su propio texto para nombres duplicados de finca/parcela son **`DUPLICATE_VALUE` (ERR-02) transversal**, no un código nuevo.

**ERR-09 — Superficie insuficiente (HU-FP-04)**

```json
{
  "statusCode": 400,
  "errorCode": "INSUFFICIENT_AREA",
  "field": "superficie_asignada",
  "message": "La superficie ingresada excede la superficie disponible en la parcela."
}
```

**ERR-10 — Finca no disponible (HU-FP-08)**

```json
{
  "statusCode": 403,
  "errorCode": "FINCA_NOT_AVAILABLE",
  "message": "La finca seleccionada no está disponible."
}
```

---

## HU-FP-01. ABM de fincas

- **Autenticación:** Requerida (Rol: Administrador Croply)

> `Finca` (DC) real: `id_finca`, `nombre_finca`, `superficie_finca`, `descripcion_finca`, `fecha_alta_finca`, `fecha_baja_finca`, `longitud`, `latitud`, `provincia`, `departamento`. No tiene `estado` como columna propia (se deriva de `fecha_baja_finca` — `null` = Activo), ni `cantidad_sensores` ni `nombre_propietario` (se calculan vía relaciones, no se guardan como texto plano redundante). Estos campos derivados sí viajan en las respuestas de la API como conveniencia para el frontend, solo que no son columnas físicas de `Finca`.
> 

### Métricas de agregación (cards del listado — solo las que no se pueden derivar de la paginación)

`GET /api/v1/fincas/stats`

```json
{  
"sensores_totales": 1452,  
"superficie_gestionada_total": 8240.0
}
```

> Solo estos dos valores — `total_fincas` y `fincas_activas` **no** necesitan este endpoint: se obtienen reutilizando `GET /fincas?page=1&pageSize=1` (sin filtro para el total, con `?estado=Activo` para las activas) y leyendo `pagination.totalItems`, mismo patrón ya usado en `GestionClientesPage`. Este endpoint existe únicamente porque `sensores_totales`/`superficie_gestionada_total` son sumas de un atributo anidado a través de todas las fincas, algo que ningún truco de paginación puede resolver. `superficie_gestionada_total`/`sensores_totales` excluyen las fincas inactivas.
>

### Listar fincas

`GET /api/v1/fincas?page=1&pageSize=10`

```json
{
  "fincas": [
    {
      "id_finca": 12,
      "nombre_finca": "Finca La Esperanza",
      "propietario": { "id_usuario": 55, "id_usuario_finca": 201, "nombre": "Roberto", "apellido": "Sánchez","email": "roberto@mail.com", "estado": "Activo"},
      "provincia": "Mendoza",
      "departamento": "Capital",
      "longitud": "-68.8272",
      "latitud": "-32.8908",
      "cantidad_sensores": 4,
      "estado": "Activo"
    }
  ],
  "pagination": { "page": 1, "pageSize": 10, "totalItems": 8, "totalPages": 1 }
}
```

> `propietario`: `null` si todavía no tiene Administrador de Finca asignado (ver HU-FP-02).
> 

### Crear finca

`POST /api/v1/fincas`

```json
{
  "nombre_finca": "Finca La Esperanza",
  "provincia": "Mendoza",
  "departamento": "Capital",
  "longitud": "-68.8272",
  "latitud": "-32.8908",
  "superficie_finca": 150.5,
  "descripcion_finca": "Finca dedicada al cultivo de maíz.",
  "id_usuario_propietario": null,
  "parcelas": []
}
```

> `provincia`/`departamento`: se cargan a mano por pantalla, sin autocompletado desde ningún otro lado (aunque el Admin Croply pueda estar mirando una `SolicitudDigitalizacionFinca` aprobada al mismo tiempo, este request no los toma de ahí automáticamente).
`id_usuario_propietario`: el `id_usuario` (no `id_usuario_finca` — ese todavía no existe en este momento, lo crea el backend al procesar este request). Opcional, ver HU-FP-02.
`parcelas`: opcional, array vacío si no se crea ninguna parcela durante el alta de la finca — el AC confirma que ambos flujos son válidos (crear finca sola y cargar parcelas después al editar, o cargarlas en el mismo alta). Mismo shape que el `POST` de HU-FP-03 (sin `id_finca`, que en este contexto todavía no existe).
> 

`201 Created` con `message: "Finca creada correctamente"` y el detalle completo (mismo shape que "Ver detalle").

### Ver detalle de finca

`GET /api/v1/fincas/:id_finca`

```json
{
  "id_finca": 12,
  "nombre_finca": "Finca La Esperanza",
  "provincia": "Mendoza",
  "departamento": "Capital",
  "longitud": "-68.8272",
  "latitud": "-32.8908",
  "superficie_finca": 150.5,
  "descripcion_finca": "Finca dedicada al cultivo de maíz.",
  "propietario": { "id_usuario": 55, "id_usuario_finca": 201, "nombre": "Roberto", "apellido": "Sánchez","email": "roberto@mail.com", "estado": "Activo"},
  "estado": "Activo",
  "cantidad_parcelas": 3,
  "cantidad_sensores": 4,
  "parcelas": [
    {
      "id_parcela": 101,
      "nombre_parcela": "Lote Norte",
      "estado_parcela": "Activa",
      "controladores": [
        {
          "id_controlador_sensores": 7,
          "nombre_controlador": "Controlador Norte",
          "ip_controlador": "192.168.1.10",
          "estado_controlador": "Transmitiendo",
          "sensores": [
            {
              "id_sensor": 501,
              "codigo_tipo_sensor": "PH",
              "nombre_tipo_sensor": "Sensor de pH",
              "estado_senal": "Sin_senal",
              "ultimo_valor": null,
              "fecha_ultima_lectura": null
            }
          ]
        }
      ]
    }
  ]
}
```

> `propietario`: `null` si no tiene asignado. Ver la nota de integración arriba sobre `ultimo_valor`/`fecha_ultima_lectura`/`estado_senal` en `null`/`"Sin_senal"` recién creados.
> 

### Editar finca

`PUT /api/v1/fincas/:id_finca` — solo `nombre_finca`, `superficie_finca`, `descripcion_finca` son editables (confirmado). `longitud`/`latitud`/`provincia`/`departamento` **no** se editan por acá — si hace falta corregir la ubicación de una finca ya creada, queda fuera de alcance de esta HU.

```json
{
  "nombre_finca": "Finca La Esperanza",
  "superficie_finca": 150.5,
  "descripcion_finca": "Finca dedicada al cultivo de maíz."
}
```

`200 OK` con `message: "Finca actualizada correctamente"`.

### Dar de baja finca

`DELETE /api/v1/fincas/:id_finca`

> Confirmado: baja lógica en cascada — cambia estado a Inactivo, inactiva parcelas asociadas, cancela tareas pendientes de esas parcelas, conserva histórico de agroquímicos sin modificar, inactiva cultivos activos, revoca accesos de usuarios invitados sin tocar el estado de cuenta del Administrador de Finca. **Dejar este mismo párrafo como comentario para el equipo de backend en el ticket/HU correspondiente**, para que quede claro que el contrato ya definió el alcance completo de la cascada y no falta nada por especificar acá.
> 

`200 OK` con `message: "Finca dada de baja correctamente. Las parcelas y datos asociados fueron actualizados."`

### Errores

- `DUPLICATE_VALUE` (nombre de finca repetido) → ERR-02, `field: "nombre_finca"`.

---

## HU-FP-02. Asignar Administrador de Finca a una finca

- **Autenticación:** Requerida (Rol: Administrador Croply)

### Listar usuarios disponibles como propietario

`GET /api/v1/usuarios/administradores-finca-disponibles`

```json
{
  "usuarios": [
    { "id_usuario": 55, "nombre": "Roberto", "apellido": "Sánchez", "email": "roberto@mail.com" }
  ]
}
```

> Usuarios registrados vía HU-AC-02. Devuelve `id_usuario` (no `id_usuario_finca` — todavía no existe ninguna membresía para estos usuarios, es justo lo que este flujo va a crear). Sin filtrar por si ya son propietarios de otra finca (multi-finca confirmado como válido por el AC).
> 

### Asignar/reasignar propietario

`PUT /api/v1/fincas/:id_finca/propietario`

```json
{ "id_usuario_propietario": 55 }
```

> Se manda `id_usuario` (de `Usuario`), nunca `id_usuario_finca`. Este endpoint es el que **crea** la fila de `UsuarioFinca` (con su propio `id_usuario_finca` autogenerado) vinculando ese `id_usuario` a esta finca con el rol Administrador de Finca — o la actualiza si ya existía un propietario distinto (desvincula el anterior, vincula el nuevo). `id_usuario_propietario: null` para desvincular sin asignar uno nuevo.
> 
> 
> Por qué esto importa para flujos futuros: una vez creado el `UsuarioFinca`, su `id_usuario_finca` es el identificador que se necesita para otras operaciones ya existentes de Épica 2 sobre ese usuario dentro de esa finca (ej. `rolesFincaService.asignarRol(id_finca, id_usuario_finca, ...)` si en algún momento se le cambia el rol). Por eso la respuesta de "Ver detalle de finca" siempre incluye ambos IDs (`id_usuario` e `id_usuario_finca`) una vez que el propietario está asignado.
> 

`200 OK` con `message: "Finca actualizada correctamente"`.

### Errores

Ninguno específico.

---

## HU-FP-03. ABM de parcelas asociadas a una finca (incluye Controladores y Sensores IoT)

- **Autenticación:** Requerida (Rol: Administrador Croply)

> `ControladorSensor` (DC) real: `id_controlador_sensor`, `estado_controlador` (`EstadoTransmision`), `ip_controlador`, `nombre_controlador`, `fecha_alta`, `fecha_baja`. `ip_controlador` se carga a mano por pantalla; `nombre_controlador` también.
> 
> 
> "Ubicación" de la parcela: se reutiliza `longitud`/`latitud`/`provincia`/`departamento` de la finca directamente — `Parcela` no tiene atributo propio de ubicación en el DC, y no hace falta uno: el frontend simplemente muestra la ubicación de la finca padre como referencia visual, sin persistir nada nuevo a nivel parcela.
> 

### Crear parcela (con controladores y sensores anidados)

`POST /api/v1/fincas/:id_finca/parcelas`

```json
{
  "nombre_parcela": "Lote Norte",
  "superficie_parcela": 12.5,
  "controladores": [
    {
      "nombre_controlador": "Controlador Norte",
      "ip_controlador": "192.168.1.10",
      "sensores": [
        { "id_tipo_sensor": 15 }
      ]
    }
  ]
}
```

> `controladores`: opcional, array vacío si no se asigna ningún dispositivo IoT al crear. Cada controlador puede tener cero o más `sensores` anidados. Un sensor solo necesita `id_tipo_sensor` al crearse — no tiene `ip_sensor` propia en el DC (la IP es del controlador, no del sensor individual). Al eliminar una fila de controlador en el frontend antes de guardar, simplemente se quita del array — no dispara ningún request individual.
Dispara sincronización asíncrona con el simulador IoT tras confirmarse la transacción (ver nota de integración arriba) — no afecta la respuesta de este endpoint.
> 

`201 Created` con `message: "Parcela creada correctamente"` y el detalle completo (mismo shape que aparece anidado en "Ver detalle de finca").

### Editar parcela

`PUT /api/v1/fincas/:id_finca/parcelas/:id_parcela`

```json
{
  "nombre_parcela": "Lote Norte",
  "superficie_parcela": 12.5,
  "controladores": [
    {
      "id_controlador_sensores": 7,
      "nombre_controlador": "Controlador Norte",
      "ip_controlador": "192.168.1.10",
      "sensores": [
        { "id_sensor": 501, "id_tipo_sensor": 15 }
      ]
    }
  ]
}
```

> El array `controladores` se reemplaza completo en cada `PUT` (mismo patrón que `permisos` en Épica 2 y `asociaciones` en Épica 4): un controlador presente en la carga inicial pero ausente en el array enviado se interpreta como dado de baja (backend le setea `fecha_baja` a él y a todos sus sensores anidados). Un controlador **sin** `id_controlador_sensores` en el array se interpreta como nuevo. Mismo criterio a nivel sensor. Cada cambio estructural (agregar/quitar controlador o sensor, o solo cambiar la config) dispara sincronización completa con el simulador (reemplazo íntegro de su lado, según lo confirmado por Rodrigo) — el frontend no necesita saber esto para nada, es transparente.
> 

`200 OK` con `message: "Parcela actualizada correctamente"`.

### Dar de baja parcela

`DELETE /api/v1/fincas/:id_finca/parcelas/:id_parcela` — baja lógica en cascada (confirmado, mismo criterio que finca: cancela tareas pendientes, inactiva cultivo activo, conserva histórico de agroquímicos). Dispara `DELETE` en cascada también del lado del simulador. `200 OK` con `message: "Parcela dada de baja correctamente. Las tareas pendientes fueron canceladas y el cultivo activo fue inactivado."`

### Errores

- `DUPLICATE_VALUE` (nombre de parcela repetido dentro de la misma finca) → ERR-02, `field: "nombre_parcela"`.

---

## HU-FP-04. Asociar plan de acción con cultivo en parcela

- **Autenticación:** Requerida (Rol: Administrador de Finca)

### Ver cronograma previo a confirmar (previsualización, sin guardar nada)

`GET /api/v1/cultivos-base/:id_cultivo_base/plan-preview?id_parcela=:id_parcela`

```json
{
  "superficie_disponible_parcela": 8.3,
  "plantillas": [
    {
      "id_plantilla_base": 3,
      "variedades": [
        { "id_variedad": 12, "nombre_variedad": "Perita" },
        { "id_variedad": 13, "nombre_variedad": "Redondo" }
      ],
      "hitos": [
        { "nombre_hpb": "Siembra", "orden_hpb": 1, "tareas": [{ "descripcion_tp": "Preparación de almácigo", "dia_relativo_tp": 0 }] }
      ]
    }
  ]
}
```

> `variedades`: array, no un único `id_variedad` — si tiene más de un elemento, esas variedades comparten la misma plantilla y el frontend las agrupa en un solo bloque visual con una única "Fecha de inicio" compartida (según AC), pero un campo de "Superficie a asignar" independiente por cada variedad del array. Si el frontend cambia la fecha de inicio, recalcula `dia_relativo_tp` + esa fecha en el cliente para la previsualización del cronograma (no hace falta volver a pegarle al backend por cada cambio de fecha, ya que `dia_relativo_tp` no cambia).
> 

### Confirmar y crear el plan de acción real

`POST /api/v1/parcelas/:id_parcela/planes-accion`

```json
{
  "id_cultivo_base": 45,
  "asignaciones": [
    { "id_variedad": 12, "superficie_asignada": 5.0, "fecha_inicio": "2026-09-15" },
    { "id_variedad": 13, "superficie_asignada": 3.0, "fecha_inicio": "2026-09-15" }
  ]
}
```

`201 Created` con `message: "Cultivo y plan de acción asignados correctamente"` y el/los `id_plan_accion` generados.

### Errores

- `INSUFFICIENT_AREA` (400) → **ERR-09**. Aplica a la superficie individual y a la suma total de todas las asignaciones.

---

## HU-FP-05. Visualizar estado actual de parcelas

- **Autenticación:** Requerida (Rol: Administrador de Finca)

`GET /api/v1/parcelas/:id_parcela`

```json
{
  "id_parcela": 101,
  "id_finca": 12,
  "nombre_parcela": "Lote Norte",
  "estado_parcela": "Activa",
  "cultivos": [
    { "id_plan_accion": 77, "nombre_cultivo_base": "Tomate", "nombre_variedad": "Perita", "superficie_ocupada_pa": 5.0, "estado": "Activo" }
  ],
  "sensores": [
    { "id_sensor": 501, "codigo_tipo_sensor": "PH", "nombre_tipo_sensor": "Sensor de pH", "estado_senal": "Transmitiendo" }
  ]
}
```

> **El clima ya no viaja embebido acá.** El frontend, al mostrar el detalle de una parcela, hace una segunda llamada aparte a `GET /api/v1/fincas/:id_finca/clima` (Épica 7, HU-IoT-03) usando el `id_finca` que viene en esta misma respuesta. Ese endpoint ya resuelve el mensaje no bloqueante si el servicio meteorológico externo falla — no hay que reimplementar ese manejo acá.
`cultivos: []` → frontend muestra la card punteada con "Asociar cultivo".
> 

### Errores

Ninguno específico.

---

## HU-FP-06. Consultar historial de cultivos por parcela

- **Autenticación:** Requerida (Rol: Administrador de Finca)

`GET /api/v1/parcelas/:id_parcela/historial-cultivos`

```json
{
  "historial": [
    {
      "id_plan_accion": 60,
      "nombre_cultivo_base": "Ajo",
      "nombre_variedad": "Morado",
      "superficie_ocupada_pa": 4.2,
      "fecha_inicio_pa": "2025-04-01",
      "fecha_fin_pa": "2025-08-15",
      "estado": "Finalizado"
    }
  ]
}
```

> Nombres de campo corregidos según el DC real (`superficie_ocupada_pa`, `fecha_inicio_pa`, `fecha_fin_pa` de `PlanAccion`). **No incluye `motivo_finalizacion`** — ver Pendiente #2, ese campo no tiene respaldo en el DC todavía y no se puede prometer en este contrato hasta resolverlo. Ordenado por `fecha_inicio_pa` descendente. Sin historial → `historial: []`.
> 

### Errores

Ninguno específico.

---

## HU-FP-07. Generar código QR de parcela

- **Autenticación:** Requerida (Rol: Administrador de Finca)

> `CodigoQR` (DC): `id_codigo_qr`, `codigo_qr`, `url_acceso_qr`, `fecha_generacion_qr`. Decisión: el backend genera y persiste `codigo_qr` (token opaco) y arma `url_acceso_qr` a partir de él — **no genera ninguna imagen**. El frontend renderiza la imagen del QR client-side a partir de `url_acceso_qr` con una librería (ej. `qrcode.react`), evitando que el backend tenga que generar/guardar binarios.
> 
> 
> `fecha_generacion_qr` (`null` = no generado todavía, con valor = ya existe) es la única fuente de verdad para decidir el texto del botón ("Generar código QR" vs "Ver código QR") — por eso ya viaja como parte de `GET /api/v1/parcelas/:id_parcela` (HU-FP-05), sin necesidad de una llamada aparte solo para decidir qué texto mostrar. Los dos endpoints de acá abajo son las acciones explícitas que dispara cada botón.
> 

### Generar código QR (botón "Generar código QR", solo si `fecha_generacion_qr` es `null`)

`POST /api/v1/parcelas/:id_parcela/codigo-qr`

`201 Created`:

json

```json
{  
"message": "Código QR generado correctamente",  
"url_acceso_qr": "https://app.croply.com/parcelas/101?qr=a1b2c3d4",  
"fecha_generacion_qr": "2026-08-27"
}
```

> Si ya existía uno generado (doble click, o el frontend quedó desactualizado), el backend **no genera uno nuevo** — devuelve `200` con los datos del ya existente, para que la operación sea segura de repetir sin efectos secundarios raros.
> 

### Consultar código QR existente (botón "Ver código QR", solo si `fecha_generacion_qr` ya tiene valor)

`GET /api/v1/parcelas/:id_parcela/codigo-qr`

json

```json
{  
"url_acceso_qr": "https://app.croply.com/parcelas/101?qr=a1b2c3d4",  
"fecha_generacion_qr": "2026-08-27"
}
```

> `404 RESOURCE_NOT_FOUND` (ERR-05) si todavía no fue generado — no debería pasar en un uso normal (el botón "Ver" solo aparece cuando ya existe), pero el backend lo valida igual.
"Descargar" es una operación 100% client-side sobre el QR ya renderizado en el DOM, no requiere ningún endpoint adicional.
> 

### Errores

Ninguno específico más allá de `RESOURCE_NOT_FOUND` (ERR-05) en el `GET`.

---

## HU-FP-08. Visualizar estado actual de finca

- **Autenticación:** Requerida (Rol: Administrador de Finca)

> El clima se consulta con `GET /api/v1/fincas/:id_finca/clima` (Épica 7, HU-IoT-03) — no se repite acá. `recomendacion_ia_resumen` depende de `HU-NA-03` (ver Pendiente #3), queda `null` hasta que exista ese contrato.
> 

### Listar fincas activas asignadas al usuario logueado (para el selector)

`GET /api/v1/mi-finca/fincas`

> No confundir con `/mi-perfil` (Épica 2 — datos personales del usuario, sección del ícono de usuario en el header). Esta ruta vive bajo el namespace de la sección "Mi finca", que es donde corresponde.
> 

```json
{
  "fincas": [
    { "id_finca": 12, "nombre_finca": "Finca La Esperanza" },
    { "id_finca": 18, "nombre_finca": "Finca Los Álamos" }
  ]
}
```

> Solo fincas con `estado: "Activo"` — a diferencia de `usuario.fincas[]` del JWT (que puede quedar desactualizado si la finca se inactiva después del login), este endpoint consulta el estado real al momento de cargar la pantalla. Si devuelve un único elemento, el frontend carga esa finca directo sin mostrar el selector (según AC). Si devuelve `fincas: []` (todas las fincas asignadas fueron inactivadas), el frontend cae al mismo mensaje que `ERR-10` de abajo.
> 

### Ver resumen de finca (grilla de parcelas)

`GET /api/v1/fincas/:id_finca/resumen`

```json
{
  "id_finca": 12,
  "nombre_finca": "Finca La Esperanza",
  "parcelas": [
    { "id_parcela": 101, "nombre_parcela": "Lote Norte", "estado_parcela": "Activa" }
  ]
}
```

> Si la finca fue inactivada por el Admin Croply, este endpoint devuelve `403 FINCA_NOT_AVAILABLE` (ver Errores) en vez de `200` — el frontend muestra el mensaje fijo sin cargar nada más de la pantalla, según el AC.
> 

### Ver detalle resumido de una parcela puntual (card dinámica, sin navegar)

`GET /api/v1/parcelas/:id_parcela/resumen`

```json
{
  "id_parcela": 101,
  "nombre_parcela": "Lote Norte",
  "estado_parcela": "Activa",
  "cultivo": {
    "nombre_cultivo_base": "Tomate",
    "nombre_variedad": "Perita",
    "superficie_ocupada_pa": 5.0
  },
  "recomendacion_ia_resumen": null
}
```

> `cultivo: null` si la parcela no tiene ningún cultivo asociado — el frontend muestra `"---"` en variedad/superficie/recomendación sin mensaje extendido, según el AC.
> 

### Errores

**`403 Forbidden` — Finca no disponible:**

```json
{
  "statusCode": 403,
  "errorCode": "FINCA_NOT_AVAILABLE",
  "message": "La finca seleccionada no está disponible."
}
```

Ver **ERR-10** arriba.

---

## Convención de naming

Snake_case minúscula estricta en todo el documento, sin casing crudo del DC.