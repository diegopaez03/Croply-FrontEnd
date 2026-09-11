export interface SensorMonitoreo {
  id_sensor: number;
  nombre_tipo_sensor: string;
  unidad_medida_ts: string;
  ultimo_valor: number | null;
  fecha_ultima_lectura: string | null;
  estado_senal: 'Transmitiendo' | 'Sin_senal';
}

export interface MonitoreoSensoresResponse {
  estado_general: 'Transmitiendo' | 'Sin_senal' | null;
  sensores: SensorMonitoreo[];
}
