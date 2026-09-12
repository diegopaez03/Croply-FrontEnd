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

export type EstadoTareaPlan = 'Planificado' | 'En Progreso' | 'Completado';

export type EstadoPlanAccionManual =
  | 'Finalizado'
  | 'Cancelado'
  | 'FinalizadoPorContingencia';

export interface TareaPlanAccion {
  id_tarea: number;
  nombre_tarea: string;
  descripcion_tarea: string;
  fecha_planificada_tarea: string;
  fecha_ejecucion_tarea: string | null;
  fecha_creacion_tarea: string;
  id_tipo_tarea: number;
  nombre_tipo_tarea: string;
  estado: EstadoTareaPlan;
  nombre_producto_aa: string | null;
  dosis_aa: string | null;
  id_responsable: number | null;
  nombre_responsable: string | null;
  fecha_hora_aplicacion_aa: string | null;
}

export interface HitoPlanAccion {
  id_hito_real: number;
  nombre_hito: string;
  orden_hito: number;
  tareas: TareaPlanAccion[];
}

export interface PlanAccionDetalle {
  id_plan_accion: number;
  fecha_inicio_pa: string;
  fecha_fin_pa: string | null;
  superficie_ocupada_pa: number;
  estado: string;
  hitos: HitoPlanAccion[];
}

export interface TareaPlanPayload {
  nombre_tarea: string;
  descripcion_tarea: string;
  fecha_planificada_tarea: string;
  id_tipo_tarea: number;
  nombre_producto_aa?: string | null;
  dosis_aa?: string | null;
  fecha_hora_aplicacion_aa?: string | null;
  id_responsable?: number | null;
}

export interface CambiarEstadoTareaResponse {
  message: string;
  id_tarea: number;
  estado: EstadoTareaPlan;
  fecha_ejecucion_tarea: string | null;
  todas_tareas_completadas: boolean;
}
