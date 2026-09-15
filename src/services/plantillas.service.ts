import { AxiosError } from 'axios';
import { apiClient } from './api';
import {
  CrearPlantillaBaseRequest,
  CrearPlantillaBaseResponse,
  ListarPlantillasBaseQuery,
  ListarPlantillasBaseResponse,
  MensajePlantillaResponse,
  PlantillaBaseDetalle,
  PlantillaBaseListado,
  PlantillaPcvDetalle,
} from '../types/plantillas.types';
import { findTipoTarea } from '../utils/tipo-tarea.catalog';

function mockError(status: number, data: Record<string, unknown>): AxiosError {
  const err = new AxiosError(String(data.message ?? 'Error'));
  err.response = {
    data,
    status,
    statusText: status === 409 ? 'Conflict' : status === 404 ? 'Not Found' : status === 400 ? 'Bad Request' : 'Error',
    headers: {},
    config: {} as never,
  };
  return err;
}

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function delayReject(error: AxiosError, ms = 400): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(error), ms));
}

export const mockPlantillas: PlantillaBaseDetalle[] = [
  {
    id_plantilla_base: 3,
    nombre_pb: 'Plan de Cultivo de Ajo',
    cultivos_info: [
      {
        id_cultivo_base: 2,
        nombre_cultivo_base: 'Ajo',
        epoca_cultivo: 'Otonio_invierno',
        mes_siembra: 'Mar-Abr',
        ciclo_productivo_cb: '180-210 días',
      },
    ],
    cultivos: [
      {
        id_pbcv: 23,
        cultivo_base: {
          id_cultivo_base: 2,
          nombre_cultivo_base: 'Ajo',
          epoca_cultivo: 'Otonio_invierno',
          mes_siembra: 'Mar-Abr',
          ciclo_productivo_cb: '180-210 días',
        },
        variedad: null,
      },
    ],
    hitos: [
      {
        id_hito_plantilla: 10,
        nombre_hpb: 'Siembra',
        orden_hpb: 1,
        tareas: [
          {
            id_tarea_plantilla: 33,
            dia_relativo_tp: 0,
            id_tipo_tarea: 2,
            nombre_tipo_tarea: 'Siembra',
            descripcion_tp: 'Preparación del terreno y siembra',
          },
        ],
      },
    ],
  },
  {
    id_plantilla_base: 4,
    nombre_pb: 'Plan de Cultivos de Verdeo',
    cultivos_info: [
      {
        id_cultivo_base: 3,
        nombre_cultivo_base: 'Lechuga',
        epoca_cultivo: 'Todo_el_anio',
        mes_siembra: 'Ene-Dic',
        ciclo_productivo_cb: '50-80 días',
      },
    ],
    cultivos: [
      {
        id_pbcv: 24,
        cultivo_base: {
          id_cultivo_base: 3,
          nombre_cultivo_base: 'Lechuga',
          epoca_cultivo: 'Todo_el_anio',
          mes_siembra: 'Ene-Dic',
          ciclo_productivo_cb: '50-80 días',
        },
        variedad: null,
      },
    ],
    hitos: [
      {
        id_hito_plantilla: 11,
        nombre_hpb: 'Cosecha',
        orden_hpb: 1,
        tareas: [
          {
            id_tarea_plantilla: 34,
            dia_relativo_tp: 50,
            id_tipo_tarea: 7,
            nombre_tipo_tarea: 'Cosecha',
            descripcion_tp: 'Corte manual',
          },
        ],
      },
    ],
  },
];

let nextPlantillaId = 10;
let nextPcvId = 100;
let nextHitoId = 50;
let nextTareaId = 80;

function toListado(detalle: PlantillaBaseDetalle): PlantillaBaseListado {
  return {
    id_plantilla_base: detalle.id_plantilla_base,
    nombre_pb: detalle.nombre_pb,
    cultivos: detalle.cultivos.map((pcv) => ({
      id_pbcv: pcv.id_pbcv,
      id_cultivo_base: pcv.cultivo_base.id_cultivo_base,
      id_variedad: pcv.variedad?.id_variedad ?? null,
    })),
    cantidad_tareas: detalle.hitos.reduce((acc, hito) => acc + hito.tareas.length, 0),
  };
}

function findPlantilla(id: number) {
  return mockPlantillas.find((p) => p.id_plantilla_base === id);
}

function validarCronograma(dto: CrearPlantillaBaseRequest) {
  if (dto.hitos.some((h) => h.tareas.length === 0) || !dto.hitos.some((h) => h.tareas.length > 0)) {
    throw mockError(400, {
      statusCode: 400,
      errorCode: 'EMPTY_SCHEDULE',
      message: 'La plantilla debe tener al menos un hito con una tarea para poder guardarse.',
    });
  }
}

function validarNombre(nombre: string, excludeId?: number) {
  const duplicado = mockPlantillas.some(
    (p) =>
      p.nombre_pb.toLowerCase() === nombre.toLowerCase() &&
      (excludeId == null || p.id_plantilla_base !== excludeId),
  );
  if (duplicado) {
    throw mockError(409, {
      statusCode: 409,
      errorCode: 'DUPLICATE_VALUE',
      message: 'El valor ingresado ya existe',
      field: 'nombre_pb',
    });
  }
}

function validarVariedadesAsignadas(dto: CrearPlantillaBaseRequest, excludeId?: number) {
  for (const fila of dto.cultivos) {
    if (fila.id_variedad == null) continue;
    const conflicto = mockPlantillas.find(
      (p) =>
        (excludeId == null || p.id_plantilla_base !== excludeId) &&
        p.cultivos.some(
          (pcv) =>
            pcv.cultivo_base.id_cultivo_base === fila.id_cultivo_base &&
            pcv.variedad?.id_variedad === fila.id_variedad,
        ),
    );
    if (conflicto) {
      throw mockError(409, {
        statusCode: 409,
        errorCode: 'VARIETY_ALREADY_ASSIGNED',
        message: 'Esta variedad ya tiene una plantilla específica asignada.',
        id_variedad: fila.id_variedad,
      });
    }
  }
}

function construirDetalle(id: number, dto: CrearPlantillaBaseRequest): PlantillaBaseDetalle {
  const cultivos: PlantillaPcvDetalle[] = dto.cultivos.map((fila) => ({
    id_pbcv: nextPcvId++,
    cultivo_base: {
      id_cultivo_base: fila.id_cultivo_base,
      nombre_cultivo_base: `Cultivo ${fila.id_cultivo_base}`,
      epoca_cultivo: 'Todo_el_anio',
      mes_siembra: 'Ene-Dic',
      ciclo_productivo_cb: '70-90 días',
    },
    variedad:
      fila.id_variedad == null
        ? null
        : {
            id_variedad: fila.id_variedad,
            nombre_variedad: `Variedad ${fila.id_variedad}`,
            distancia_plantacion: '20x20cm',
            observaciones: null,
            dias_a_cosecha: 70,
            fecha_alta: '2026-03-10',
            en_uso: true,
          },
  }));

  const seen = new Set<number>();
  const cultivos_info = cultivos
    .map((c) => c.cultivo_base)
    .filter((c) => {
      if (seen.has(c.id_cultivo_base)) return false;
      seen.add(c.id_cultivo_base);
      return true;
    });

  return {
    id_plantilla_base: id,
    nombre_pb: dto.nombre_pb.trim(),
    cultivos_info,
    cultivos,
    hitos: dto.hitos.map((hito) => ({
      id_hito_plantilla: nextHitoId++,
      nombre_hpb: hito.nombre_hpb,
      orden_hpb: hito.orden_hpb,
      tareas: hito.tareas.map((tarea) => ({
        id_tarea_plantilla: nextTareaId++,
        dia_relativo_tp: tarea.dia_relativo_tp,
        id_tipo_tarea: tarea.id_tipo_tarea,
        nombre_tipo_tarea: findTipoTarea(tarea.id_tipo_tarea)?.nombre_tipo_tarea ?? 'Desconocido',
        descripcion_tp: tarea.descripcion_tp,
        nombre_producto: tarea.nombre_producto ?? null,
        dosis_aa: tarea.dosis_aa ?? null,
      })),
    })),
  };
}

export const plantillasService = {
  listar: async (params: ListarPlantillasBaseQuery = {}): Promise<ListarPlantillasBaseResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const totalItems = mockPlantillas.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const start = (page - 1) * pageSize;
      const plantillas = mockPlantillas.slice(start, start + pageSize).map(toListado);
      return delay({
        plantillas,
        pagination: { page, pageSize, totalItems, totalPages },
      });
    }

    const response = await apiClient.get<ListarPlantillasBaseResponse>('/cultivos/plantillas-base', {
      params,
    });
    return response.data;
  },

  obtenerDetalle: async (id_plantilla_base: number): Promise<PlantillaBaseDetalle> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      const plantilla = findPlantilla(id_plantilla_base);
      if (!plantilla) {
        return delayReject(
          mockError(404, {
            statusCode: 404,
            errorCode: 'RESOURCE_NOT_FOUND',
            message: 'El recurso solicitado no existe o ya fue eliminado.',
          }),
        );
      }
      return delay(plantilla);
    }

    const response = await apiClient.get<PlantillaBaseDetalle>(
      `/cultivos/plantillas-base/${id_plantilla_base}`,
    );
    return response.data;
  },

  crear: async (data: CrearPlantillaBaseRequest): Promise<CrearPlantillaBaseResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      try {
        validarCronograma(data);
        validarNombre(data.nombre_pb.trim());
        validarVariedadesAsignadas(data);
      } catch (error) {
        return delayReject(error as AxiosError);
      }

      const detalle = construirDetalle(nextPlantillaId++, data);
      mockPlantillas.unshift(detalle);
      return delay({ message: 'Plantilla creada correctamente', ...detalle });
    }

    const response = await apiClient.post<CrearPlantillaBaseResponse>(
      '/cultivos/plantillas-base',
      data,
    );
    return response.data;
  },

  actualizar: async (
    id_plantilla_base: number,
    data: CrearPlantillaBaseRequest,
  ): Promise<CrearPlantillaBaseResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      const index = mockPlantillas.findIndex((p) => p.id_plantilla_base === id_plantilla_base);
      if (index === -1) {
        return delayReject(
          mockError(404, {
            statusCode: 404,
            errorCode: 'RESOURCE_NOT_FOUND',
            message: 'El recurso solicitado no existe o ya fue eliminado.',
          }),
        );
      }
      try {
        validarCronograma(data);
        validarNombre(data.nombre_pb.trim(), id_plantilla_base);
        validarVariedadesAsignadas(data, id_plantilla_base);
      } catch (error) {
        return delayReject(error as AxiosError);
      }

      const detalle = construirDetalle(id_plantilla_base, data);
      mockPlantillas[index] = detalle;
      return delay({ message: 'Plantilla actualizada correctamente', ...detalle });
    }

    const response = await apiClient.put<CrearPlantillaBaseResponse>(
      `/cultivos/plantillas-base/${id_plantilla_base}`,
      data,
    );
    return response.data;
  },

  eliminar: async (id_plantilla_base: number): Promise<MensajePlantillaResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      const index = mockPlantillas.findIndex((p) => p.id_plantilla_base === id_plantilla_base);
      if (index === -1) {
        return delayReject(
          mockError(404, {
            statusCode: 404,
            errorCode: 'RESOURCE_NOT_FOUND',
            message: 'El recurso solicitado no existe o ya fue eliminado.',
          }),
        );
      }
      mockPlantillas.splice(index, 1);
      return delay({ message: 'Plantilla eliminada correctamente' });
    }

    const response = await apiClient.delete<MensajePlantillaResponse>(
      `/cultivos/plantillas-base/${id_plantilla_base}`,
    );
    return response.data;
  },
};
