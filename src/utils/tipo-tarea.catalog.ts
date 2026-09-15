/**
 * Catálogo mock de TipoTarea (Épica 4).
 * El ABM real se implementa en la Épica 5 (HU-TC-01).
 */
export const ID_TIPO_TAREA_APLICACION_AGROQUIMICO = 5;

export const TIPO_TAREA_CATALOG = [
  { id_tipo_tarea: 1, nombre_tipo_tarea: 'Preparación del terreno' },
  { id_tipo_tarea: 2, nombre_tipo_tarea: 'Siembra' },
  { id_tipo_tarea: 3, nombre_tipo_tarea: 'Riego' },
  { id_tipo_tarea: 4, nombre_tipo_tarea: 'Fertilización' },
  {
    id_tipo_tarea: ID_TIPO_TAREA_APLICACION_AGROQUIMICO,
    nombre_tipo_tarea: 'Aplicación de agroquímico',
  },
  { id_tipo_tarea: 6, nombre_tipo_tarea: 'Control de malezas' },
  { id_tipo_tarea: 7, nombre_tipo_tarea: 'Cosecha' },
] as const;

export function findTipoTarea(id_tipo_tarea: number) {
  return TIPO_TAREA_CATALOG.find((t) => t.id_tipo_tarea === id_tipo_tarea);
}

export function esAplicacionAgroquimico(id_tipo_tarea: number): boolean {
  return Number(id_tipo_tarea) === ID_TIPO_TAREA_APLICACION_AGROQUIMICO;
}
