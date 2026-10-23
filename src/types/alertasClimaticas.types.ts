export type EstadoAlertaClimatica = 'Vigente' | 'Resuelta';

export interface AlertaClimaticaResponse {
  id_alerta: number;
  codigo_alerta: string;
  severidad: string;
  fecha_deteccion: string;
  descripcion: string;
  estado: EstadoAlertaClimatica;
}

export interface ListadoAlertasClimaticasResponse {
  alertas: AlertaClimaticaResponse[];
}
