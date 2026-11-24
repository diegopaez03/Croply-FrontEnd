export interface EstadoTarea {
  id_estado_tarea: number;
  nombre_estado_tarea: string;
  protegido: boolean;
  es_estado_finalizador: boolean;
  cuenta_para_cierre_exitoso: boolean;
}

export interface ListarEstadosTareaResponse {
  estados_tarea: EstadoTarea[];
}

export interface CreateEstadoTareaRequest {
  nombre_estado_tarea: string;
}

export interface CreateEstadoTareaResponse extends EstadoTarea {
  message: string;
  fecha_alta_estado_tarea: string;
  fecha_baja_estado_tarea: string | null;
}

export interface UpdateEstadoTareaRequest {
  nombre_estado_tarea: string;
}

export interface UpdateEstadoTareaResponse extends EstadoTarea {
  message: string;
}

export interface DeleteEstadoTareaResponse {
  message: string;
  id_estado_tarea: number;
}
