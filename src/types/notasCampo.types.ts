export interface NotaCampoPayload {
  id_finca: number;
  id_parcela?: number | null;
  contenido_nota_campo: string;
  fecha_captura_nc?: string;
}

export interface NotaCampoResponse {
  message: string;
  id_nota_campo: number;
  contenido_nota_campo: string;
  fecha_captura_nc: string;
  estado: string;
  id_finca: number;
  id_parcela?: number | null;
  id_usuario_finca: number;
  nombre_usuario: string;
  nombre_rol_finca: string;
}

export interface NotaCampoListado {
  id_nota_campo: number;
  contenido_nota_campo: string;
  fecha_captura_nc: string;
  estado: string;
  id_parcela?: number | null;
  nombre_parcela?: string | null;
  nombre_usuario: string;
  nombre_rol_finca: string;
}

export interface ConvertirNotaPayload {
  id_parcela: number;
  id_hito_real: number;
  nombre_tarea: string;
  descripcion_tarea: string;
  fecha_planificada_tarea: string;
  id_tipo_tarea: number;
  nombre_producto_aa?: string;
  dosis_aa?: string;
  id_responsable?: number;
  fecha_hora_aplicacion_aa?: string;
}

