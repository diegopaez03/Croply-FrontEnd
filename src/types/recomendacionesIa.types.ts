export interface FactorClave {
  sensor_ui: string;
  valor: number | null;
}

export type OrigenDatos =
  | 'CACHE_VIGENTE'
  | 'CACHE_RENOVADA_SIN_LLM'
  | 'NUEVA_EVALUACION_LLM'
  | 'FALLBACK_INTA';

export interface RecomendacionIaResponse {
  id_recomendacion: number;
  id_parcela: number;
  accion_recomendada: string;
  severidad: string;
  sensor_origen_principal: string;
  factores_clave: FactorClave[];
  titulo_corto: string | null;
  texto_breve: string | null;
  texto_explicativo_extendido: string | null;
  fecha_generacion: string;
  valida_hasta: string;
  origen_datos: OrigenDatos;
}
