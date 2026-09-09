export interface HitoPlanPreview {
  id_hito_plantilla: number;
  nombre_hpb: string;
  orden_hpb: number;
  tareas: {
    id_tarea_plantilla: number;
    id_tipo_tarea: number;
    nombre_tipo_tarea: string;
    descripcion_tp: string;
    dia_relativo_tp: number;
  }[];
}

export interface VariedadPlanPreview {
  id_variedad: number;
  nombre_variedad: string;
}

export interface PlantillaPlanPreview {
  id_plantilla_base: number;
  variedades: VariedadPlanPreview[];
  hitos: HitoPlanPreview[];
}

export interface PlanPreviewResponse {
  superficie_disponible_parcela: number;
  plantillas: PlantillaPlanPreview[];
}

export interface AsignacionVariedadRequest {
  id_variedad: number;
  superficie_asignada: number;
  fecha_inicio: string;
}

export interface CrearPlanAccionRequest {
  id_cultivo_base: number;
  asignaciones: AsignacionVariedadRequest[];
}
