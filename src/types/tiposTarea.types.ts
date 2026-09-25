export interface TipoTarea {
  id_tipo_tarea: number;
  nombre_tipo_tarea: string;
  protegido: boolean;
  es_tipo_agroquimico: boolean;
}

export interface ListarTiposTareaResponse {
  tipos_tarea: TipoTarea[];
}

export interface CreateTipoTareaRequest {
  nombre_tipo_tarea: string;
}

export interface CreateTipoTareaResponse extends TipoTarea {
  message: string;
  fecha_alta_tipo_tarea: string;
  fecha_baja_tipo_tarea: string | null;
}

export interface UpdateTipoTareaRequest {
  nombre_tipo_tarea: string;
}

export interface UpdateTipoTareaResponse extends TipoTarea {
  message: string;
}

export interface DeleteTipoTareaResponse {
  message: string;
  id_tipo_tarea: number;
}
