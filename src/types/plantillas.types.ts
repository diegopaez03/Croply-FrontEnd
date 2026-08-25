import { EpocaCultivo } from './cultivos.types';
import { VariedadDetalle } from './cultivos.types';

export interface PlantillaListCultivo {
  id_pbcv: number;
  id_cultivo_base: number;
  id_variedad: number | null;
}

export interface PlantillaBaseListado {
  id_plantilla_base: number;
  nombre_pb: string;
  cultivos: PlantillaListCultivo[];
  cantidad_tareas: number;
}

export interface ListarPlantillasBaseQuery {
  page?: number;
  pageSize?: number;
}

export interface ListarPlantillasBaseResponse {
  plantillas: PlantillaBaseListado[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CultivoResumenPlantilla {
  id_cultivo_base: number;
  nombre_cultivo_base: string;
  epoca_cultivo: EpocaCultivo;
  mes_siembra: string;
  ciclo_productivo_cb: string;
}

export interface TareaPlantillaDetalle {
  id_tarea_plantilla: number;
  dia_relativo_tp: number;
  id_tipo_tarea: number;
  nombre_tipo_tarea: string;
  descripcion_tp: string;
  nombre_producto?: string | null;
  dosis_aa?: string | null;
}

export interface HitoPlantillaDetalle {
  id_hito_plantilla: number;
  nombre_hpb: string;
  orden_hpb: number;
  tareas: TareaPlantillaDetalle[];
}

export interface PlantillaPcvDetalle {
  id_pbcv: number;
  cultivo_base: CultivoResumenPlantilla;
  variedad: VariedadDetalle | null;
}

export interface PlantillaBaseDetalle {
  id_plantilla_base: number;
  nombre_pb: string;
  cultivos_info: CultivoResumenPlantilla[];
  cultivos: PlantillaPcvDetalle[];
  hitos: HitoPlantillaDetalle[];
}

export interface PlantillaCultivoRequest {
  id_cultivo_base: number;
  id_variedad: number | null;
}

export interface TareaPlantillaRequest {
  dia_relativo_tp: number;
  id_tipo_tarea: number;
  descripcion_tp: string;
  nombre_producto?: string | null;
  dosis_aa?: string | null;
}

export interface HitoPlantillaRequest {
  nombre_hpb: string;
  orden_hpb: number;
  tareas: TareaPlantillaRequest[];
}

export interface CrearPlantillaBaseRequest {
  nombre_pb: string;
  cultivos: PlantillaCultivoRequest[];
  hitos: HitoPlantillaRequest[];
}

export interface CrearPlantillaBaseResponse extends PlantillaBaseDetalle {
  message: string;
}

export interface MensajePlantillaResponse {
  message: string;
}

export interface TipoTareaCatalogo {
  id_tipo_tarea: number;
  nombre_tipo_tarea: string;
}
