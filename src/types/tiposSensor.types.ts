export interface TipoSensor {
  id_tipo_sensor: number;
  codigo_tipo_sensor: string;
  nombre_tipo_sensor: string;
  unidad_medida_ts: string;
}

export interface ListarTiposSensorResponse {
  tipos_sensor: TipoSensor[];
}

export interface ConsultarCodigosDisponiblesResponse {
  codigos_tipo_sensor: string[];
}

export interface CreateTipoSensorRequest {
  codigo_tipo_sensor: string;
  nombre_tipo_sensor: string;
  unidad_medida_ts: string;
}

export interface CreateTipoSensorResponse extends TipoSensor {
  message: string;
  fecha_alta: string;
  fecha_baja: string | null;
}

export interface UpdateTipoSensorRequest {
  codigo_tipo_sensor: string;
  nombre_tipo_sensor: string;
  unidad_medida_ts: string;
}

export interface UpdateTipoSensorResponse extends TipoSensor {
  message: string;
}

export interface DeleteTipoSensorResponse {
  message: string;
  id_tipo_sensor: number;
}
