export interface GastoProduccion {
  id_gasto_produccion: number;
  nombre_insumo_gp: string;
  monto_gp: number;
  fecha_gp: string;
  id_responsable: number;
  nombre_responsable?: string;
  id_finca?: number;
  nombre_finca?: string;
  fecha_alta_gp?: string;
  fecha_modificacion_gp?: string;
  fecha_baja_gp?: string | null;
}

export interface CrearGastoRequest {
  nombre_insumo_gp: string;
  monto_gp: number;
  id_responsable: number;
  fecha_gp: string;
}

export interface CrearGastoResponse {
  message: string;
  id_gasto_produccion: number;
  nombre_insumo_gp: string;
  monto_gp: number;
  fecha_gp: string;
  id_finca: number;
  nombre_finca: string;
  id_responsable: number;
  nombre_responsable: string;
  fecha_alta_gp: string;
}

export interface EditarGastoRequest {
  nombre_insumo_gp: string;
  monto_gp: number;
  id_responsable: number;
  fecha_gp: string;
}

export interface EditarGastoResponse {
  message: string;
  id_gasto_produccion: number;
  nombre_insumo_gp: string;
  monto_gp: number;
  fecha_gp: string;
  id_finca: number;
  nombre_finca?: string;
  id_responsable: number;
  nombre_responsable?: string;
  fecha_alta_gp: string;
  fecha_modificacion_gp: string;
}

export interface GetGastosRequest {
  page?: number;
  pageSize?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface GetGastosResponse {
  gastos: GastoProduccion[];
  total: number;
  page: number;
  pageSize: number;
  monto_total_periodo: number;
  etiqueta_periodo: 'mes_actual' | 'rango_filtrado';
}

export interface EvolucionMensualResponse {
  mes: string;
  monto: number;
}

export interface ExportarGastosRequest {
  fecha_desde?: string;
  fecha_hasta?: string;
  imagen_grafico: string;
}

