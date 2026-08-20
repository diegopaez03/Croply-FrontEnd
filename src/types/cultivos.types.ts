export type EpocaCultivo = 'Todo_el_anio' | 'Primavera_verano' | 'Otonio_invierno';
export type FormaSiembra = 'Directa' | 'Almacigo';

export interface CultivoBaseListado {
  id_cultivo_base: number;
  nombre_cultivo_base: string;
  descripcion_cb: string;
  epoca_cultivo: EpocaCultivo;
  mes_siembra: string;
  ciclo_productivo_cb: string;
  forma_siembra: FormaSiembra;
  cantidad_variedades: number;
}

export interface ListarCultivosBaseQuery {
  search?: string;
  epoca_cultivo?: EpocaCultivo;
  forma_siembra?: FormaSiembra;
}

export interface ListarCultivosBaseResponse {
  cultivos: CultivoBaseListado[];
}

export interface VariedadDetalle {
  id_variedad: number;
  nombre_variedad: string;
  distancia_plantacion: string;
  observaciones: string | null;
  dias_a_cosecha: number;
  fecha_alta: string;
  en_uso: boolean;
  id_plantilla_especifica?: number | null;
}

export interface CultivoBaseDetalle {
  id_cultivo_base: number;
  nombre_cultivo_base: string;
  descripcion_cb: string;
  epoca_cultivo: EpocaCultivo;
  mes_siembra: string;
  ciclo_productivo_cb: string;
  forma_siembra: FormaSiembra;
  id_plantilla_general?: number | null;
  variedades: VariedadDetalle[];
}

export interface CrearCultivoBaseRequest {
  nombre_cultivo_base: string;
  descripcion_cb: string;
  epoca_cultivo: EpocaCultivo;
  mes_siembra: string;
  ciclo_productivo_cb: string;
  forma_siembra: FormaSiembra;
}

export interface CrearCultivoBaseResponse extends CultivoBaseListado {
  message: string;
}

export interface CrearVariedadRequest {
  nombre_variedad: string;
  distancia_plantacion: string;
  observaciones?: string | null;
  dias_a_cosecha: number;
}

export interface VariedadMutacionResponse {
  message: string;
  id_variedad: number;
  nombre_variedad: string;
  distancia_plantacion: string;
  observaciones: string | null;
  dias_a_cosecha: number;
  fecha_alta: string;
  en_uso: boolean;
  ciclo_productivo_cb: string;
}

export interface MensajeCultivoResponse {
  message: string;
}
