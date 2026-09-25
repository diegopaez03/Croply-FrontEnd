export interface ExportarAplicacionesParams {
  fecha_desde?: string;
  fecha_hasta?: string;
  id_parcela?: number;
}

export interface RegistrarAplicacionRequest {
  fecha_hora_aplicacion_aa: string;
  nombre_producto_aa: string;
  dosis_aa: string;
  observaciones?: string;
  id_parcela: number;
  id_hito_real: number;
  id_responsable: number;
}

export interface EditarAplicacionRequest {
  fecha_hora_aplicacion_aa: string;
  nombre_producto_aa: string;
  dosis_aa: string;
  observaciones?: string;
  id_responsable: number;
}

export interface AplicacionAgroquimicoDetalle {
  id_aplicacion: number;
  fecha_hora_aplicacion_aa: string;
  nombre_producto_aa: string;
  dosis_aa: string;
  observaciones?: string;
  id_parcela: number;
  nombre_parcela: string;
  id_hito_real: number;
  nombre_hito: string;
  id_responsable: number;
  nombre_responsable: string;
  id_tarea: number | null;
  fecha_creacion: string;
  fecha_modificacion?: string;
}

export interface ListarAplicacionesResponse {
  aplicaciones: AplicacionAgroquimicoDetalle[];
  total: number;
  page: number;
  pageSize: number;
}
