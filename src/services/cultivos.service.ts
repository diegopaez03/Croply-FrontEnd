import { AxiosError } from 'axios';
import { apiClient } from './api';
import {
  CrearCultivoBaseRequest,
  CrearCultivoBaseResponse,
  CrearVariedadRequest,
  CultivoBaseDetalle,
  ListarCultivosBaseQuery,
  ListarCultivosBaseResponse,
  MensajeCultivoResponse,
  VariedadDetalle,
  VariedadMutacionResponse,
} from '../types/cultivos.types';
import { formatCicloProductivo } from '../utils/formatters';

interface CultivoMock extends CultivoBaseDetalle {
  en_uso: boolean;
}

function mockError(status: number, data: Record<string, unknown>): AxiosError {
  const err = new AxiosError(String(data.message ?? 'Error'));
  err.response = {
    data,
    status,
    statusText: status === 409 ? 'Conflict' : status === 404 ? 'Not Found' : 'Error',
    headers: {},
    config: {} as never,
  };
  return err;
}

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function delayReject(error: AxiosError, ms = 400): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(error), ms));
}

function recalcularCiclo(variedades: VariedadDetalle[]): string | null {
  if (variedades.length === 0) return null;
  const dias = variedades.map((v) => v.dias_a_cosecha);
  return formatCicloProductivo(Math.min(...dias), Math.max(...dias));
}

function toListado(cultivo: CultivoMock) {
  return {
    id_cultivo_base: cultivo.id_cultivo_base,
    nombre_cultivo_base: cultivo.nombre_cultivo_base,
    descripcion_cb: cultivo.descripcion_cb,
    epoca_cultivo: cultivo.epoca_cultivo,
    mes_siembra: cultivo.mes_siembra,
    ciclo_productivo_cb: cultivo.ciclo_productivo_cb,
    forma_siembra: cultivo.forma_siembra,
    cantidad_variedades: cultivo.variedades.length,
  };
}

function toDetalle(cultivo: CultivoMock): CultivoBaseDetalle {
  return {
    id_cultivo_base: cultivo.id_cultivo_base,
    nombre_cultivo_base: cultivo.nombre_cultivo_base,
    descripcion_cb: cultivo.descripcion_cb,
    epoca_cultivo: cultivo.epoca_cultivo,
    mes_siembra: cultivo.mes_siembra,
    ciclo_productivo_cb: cultivo.ciclo_productivo_cb,
    forma_siembra: cultivo.forma_siembra,
    id_plantilla_general: cultivo.id_plantilla_general,
    variedades: cultivo.variedades,
  };
}

const mockCultivos: CultivoMock[] = [
  {
    id_cultivo_base: 1,
    nombre_cultivo_base: 'Tomate',
    descripcion_cb: 'Fruto nacional premium',
    epoca_cultivo: 'Primavera_verano',
    mes_siembra: 'Sep-Oct',
    ciclo_productivo_cb: '68-75 días',
    forma_siembra: 'Almacigo',
    id_plantilla_general: 3,
    en_uso: true,
    variedades: [
      {
        id_variedad: 12,
        nombre_variedad: 'Perita',
        distancia_plantacion: '30x60cm',
        observaciones: 'Mas dulce, con menos semillas.',
        dias_a_cosecha: 75,
        fecha_alta: '2026-03-10',
        en_uso: true,
        id_plantilla_especifica: 8,
      },
      {
        id_variedad: 13,
        nombre_variedad: 'Redondo',
        distancia_plantacion: '40x70cm',
        observaciones: null,
        dias_a_cosecha: 68,
        fecha_alta: '2026-03-10',
        en_uso: false,
        id_plantilla_especifica: null,
      },
    ],
  },
  {
    id_cultivo_base: 2,
    nombre_cultivo_base: 'Ajo',
    descripcion_cb: 'Bulbo de ciclo invernal',
    epoca_cultivo: 'Otonio_invierno',
    mes_siembra: 'Mar-Abr',
    ciclo_productivo_cb: '180-210 días',
    forma_siembra: 'Directa',
    id_plantilla_general: null,
    en_uso: false,
    variedades: [
      {
        id_variedad: 21,
        nombre_variedad: 'Blanco criollo',
        distancia_plantacion: '10x20cm',
        observaciones: null,
        dias_a_cosecha: 210,
        fecha_alta: '2026-02-01',
        en_uso: false,
        id_plantilla_especifica: null,
      },
    ],
  },
  {
    id_cultivo_base: 3,
    nombre_cultivo_base: 'Lechuga',
    descripcion_cb: 'Hoja de ciclo corto',
    epoca_cultivo: 'Todo_el_anio',
    mes_siembra: 'Ene-Dic',
    ciclo_productivo_cb: '50-80 días',
    forma_siembra: 'Almacigo',
    id_plantilla_general: null,
    en_uso: false,
    variedades: [],
  },
];

let nextCultivoId = 4;
let nextVariedadId = 30;

function findCultivo(id: number): CultivoMock | undefined {
  return mockCultivos.find((c) => c.id_cultivo_base === id);
}

export const cultivosService = {
  listar: async (params: ListarCultivosBaseQuery = {}): Promise<ListarCultivosBaseResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      let cultivos = mockCultivos.map(toListado);

      if (params.search?.trim()) {
        const needle = params.search.trim().toLowerCase();
        cultivos = cultivos.filter((c) =>
          c.nombre_cultivo_base.toLowerCase().includes(needle),
        );
      }
      if (params.epoca_cultivo && params.epoca_cultivo !== 'Todo_el_anio') {
        cultivos = cultivos.filter((c) => c.epoca_cultivo === params.epoca_cultivo);
      }
      if (params.forma_siembra) {
        cultivos = cultivos.filter((c) => c.forma_siembra === params.forma_siembra);
      }

      return delay({ cultivos });
    }

    const response = await apiClient.get<ListarCultivosBaseResponse>('/cultivos/base', {
      params,
    });
    return response.data;
  },

  obtenerDetalle: async (id_cultivo_base: number): Promise<CultivoBaseDetalle> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      const cultivo = findCultivo(id_cultivo_base);
      if (!cultivo) {
        return delayReject(
          mockError(404, {
            statusCode: 404,
            errorCode: 'RESOURCE_NOT_FOUND',
            message: 'El recurso solicitado no existe o ya fue eliminado.',
          }),
        );
      }
      return delay(toDetalle(cultivo));
    }

    const response = await apiClient.get<CultivoBaseDetalle>(`/cultivos/base/${id_cultivo_base}`);
    return response.data;
  },

  crear: async (data: CrearCultivoBaseRequest): Promise<CrearCultivoBaseResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      const nombre = data.nombre_cultivo_base.trim();
      const duplicado = mockCultivos.some(
        (c) => c.nombre_cultivo_base.toLowerCase() === nombre.toLowerCase(),
      );
      if (duplicado) {
        return delayReject(
          mockError(409, {
            statusCode: 409,
            errorCode: 'DUPLICATE_VALUE',
            message: 'El valor ingresado ya existe',
            field: 'nombre_cultivo_base',
          }),
        );
      }

      const nuevo: CultivoMock = {
        id_cultivo_base: nextCultivoId++,
        nombre_cultivo_base: nombre,
        descripcion_cb: data.descripcion_cb,
        epoca_cultivo: data.epoca_cultivo,
        mes_siembra: data.mes_siembra,
        ciclo_productivo_cb: data.ciclo_productivo_cb,
        forma_siembra: data.forma_siembra,
        id_plantilla_general: null,
        en_uso: false,
        variedades: [],
      };
      mockCultivos.unshift(nuevo);

      return delay({
        message: 'Cultivo creado correctamente',
        ...toListado(nuevo),
      });
    }

    const response = await apiClient.post<CrearCultivoBaseResponse>('/cultivos/base', data);
    return response.data;
  },

  actualizar: async (
    id_cultivo_base: number,
    data: CrearCultivoBaseRequest,
  ): Promise<CrearCultivoBaseResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      const cultivo = findCultivo(id_cultivo_base);
      if (!cultivo) {
        return delayReject(
          mockError(404, {
            statusCode: 404,
            errorCode: 'RESOURCE_NOT_FOUND',
            message: 'El recurso solicitado no existe o ya fue eliminado.',
          }),
        );
      }

      const nombre = data.nombre_cultivo_base.trim();
      const duplicado = mockCultivos.some(
        (c) =>
          c.nombre_cultivo_base.toLowerCase() === nombre.toLowerCase() &&
          c.id_cultivo_base !== id_cultivo_base,
      );
      if (duplicado) {
        return delayReject(
          mockError(409, {
            statusCode: 409,
            errorCode: 'DUPLICATE_VALUE',
            message: 'El valor ingresado ya existe',
            field: 'nombre_cultivo_base',
          }),
        );
      }

      cultivo.nombre_cultivo_base = nombre;
      cultivo.descripcion_cb = data.descripcion_cb;
      cultivo.epoca_cultivo = data.epoca_cultivo;
      cultivo.mes_siembra = data.mes_siembra;
      cultivo.forma_siembra = data.forma_siembra;
      if (cultivo.variedades.length === 0) {
        cultivo.ciclo_productivo_cb = data.ciclo_productivo_cb;
      }

      return delay({
        message: 'Cultivo actualizado correctamente',
        ...toListado(cultivo),
      });
    }

    const response = await apiClient.put<CrearCultivoBaseResponse>(
      `/cultivos/base/${id_cultivo_base}`,
      data,
    );
    return response.data;
  },

  eliminar: async (id_cultivo_base: number): Promise<MensajeCultivoResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      const index = mockCultivos.findIndex((c) => c.id_cultivo_base === id_cultivo_base);
      if (index === -1) {
        return delayReject(
          mockError(404, {
            statusCode: 404,
            errorCode: 'RESOURCE_NOT_FOUND',
            message: 'El recurso solicitado no existe o ya fue eliminado.',
          }),
        );
      }

      if (mockCultivos[index].en_uso) {
        return delayReject(
          mockError(409, {
            statusCode: 409,
            errorCode: 'RESOURCE_IN_USE',
            message: 'Este cultivo no se puede eliminar porque está en uso.',
          }),
        );
      }

      mockCultivos.splice(index, 1);
      return delay({ message: 'Cultivo eliminado correctamente' });
    }

    const response = await apiClient.delete<MensajeCultivoResponse>(
      `/cultivos/base/${id_cultivo_base}`,
    );
    return response.data;
  },

  agregarVariedad: async (
    id_cultivo_base: number,
    data: CrearVariedadRequest,
  ): Promise<VariedadMutacionResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      const cultivo = findCultivo(id_cultivo_base);
      if (!cultivo) {
        return delayReject(
          mockError(404, {
            statusCode: 404,
            errorCode: 'RESOURCE_NOT_FOUND',
            message: 'El recurso solicitado no existe o ya fue eliminado.',
          }),
        );
      }

      const nombre = data.nombre_variedad.trim();
      const duplicado = cultivo.variedades.some(
        (v) => v.nombre_variedad.toLowerCase() === nombre.toLowerCase(),
      );
      if (duplicado) {
        return delayReject(
          mockError(409, {
            statusCode: 409,
            errorCode: 'DUPLICATE_VALUE',
            message: 'El valor ingresado ya existe',
            field: 'nombre_variedad',
          }),
        );
      }

      const nueva: VariedadDetalle = {
        id_variedad: nextVariedadId++,
        nombre_variedad: nombre,
        distancia_plantacion: data.distancia_plantacion,
        observaciones: data.observaciones ?? null,
        dias_a_cosecha: data.dias_a_cosecha,
        fecha_alta: hoyIso(),
        en_uso: false,
        id_plantilla_especifica: null,
      };
      cultivo.variedades.push(nueva);
      const ciclo = recalcularCiclo(cultivo.variedades);
      if (ciclo) cultivo.ciclo_productivo_cb = ciclo;

      return delay({
        message: 'Variedad agregada correctamente',
        ...nueva,
        ciclo_productivo_cb: cultivo.ciclo_productivo_cb,
      });
    }

    const response = await apiClient.post<VariedadMutacionResponse>(
      `/cultivos/base/${id_cultivo_base}/variedades`,
      data,
    );
    return response.data;
  },

  actualizarVariedad: async (
    id_cultivo_base: number,
    id_variedad: number,
    data: CrearVariedadRequest,
  ): Promise<VariedadMutacionResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      const cultivo = findCultivo(id_cultivo_base);
      const variedad = cultivo?.variedades.find((v) => v.id_variedad === id_variedad);
      if (!cultivo || !variedad) {
        return delayReject(
          mockError(404, {
            statusCode: 404,
            errorCode: 'RESOURCE_NOT_FOUND',
            message: 'El recurso solicitado no existe o ya fue eliminado.',
          }),
        );
      }

      const nombre = data.nombre_variedad.trim();
      const duplicado = cultivo.variedades.some(
        (v) =>
          v.nombre_variedad.toLowerCase() === nombre.toLowerCase() &&
          v.id_variedad !== id_variedad,
      );
      if (duplicado) {
        return delayReject(
          mockError(409, {
            statusCode: 409,
            errorCode: 'DUPLICATE_VALUE',
            message: 'El valor ingresado ya existe',
            field: 'nombre_variedad',
          }),
        );
      }

      variedad.nombre_variedad = nombre;
      variedad.distancia_plantacion = data.distancia_plantacion;
      variedad.observaciones = data.observaciones ?? null;
      variedad.dias_a_cosecha = data.dias_a_cosecha;
      const ciclo = recalcularCiclo(cultivo.variedades);
      if (ciclo) cultivo.ciclo_productivo_cb = ciclo;

      return delay({
        message: 'Variedad actualizada correctamente',
        ...variedad,
        ciclo_productivo_cb: cultivo.ciclo_productivo_cb,
      });
    }

    const response = await apiClient.put<VariedadMutacionResponse>(
      `/cultivos/base/${id_cultivo_base}/variedades/${id_variedad}`,
      data,
    );
    return response.data;
  },

  eliminarVariedad: async (
    id_cultivo_base: number,
    id_variedad: number,
  ): Promise<MensajeCultivoResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      const cultivo = findCultivo(id_cultivo_base);
      const index = cultivo?.variedades.findIndex((v) => v.id_variedad === id_variedad) ?? -1;
      if (!cultivo || index === -1) {
        return delayReject(
          mockError(404, {
            statusCode: 404,
            errorCode: 'RESOURCE_NOT_FOUND',
            message: 'El recurso solicitado no existe o ya fue eliminado.',
          }),
        );
      }

      if (cultivo.variedades[index].en_uso) {
        return delayReject(
          mockError(409, {
            statusCode: 409,
            errorCode: 'RESOURCE_IN_USE',
            message: 'Esta variedad no se puede eliminar porque está en uso.',
          }),
        );
      }

      cultivo.variedades.splice(index, 1);
      const ciclo = recalcularCiclo(cultivo.variedades);
      if (ciclo) cultivo.ciclo_productivo_cb = ciclo;

      return delay({ message: 'Variedad eliminada correctamente' });
    }

    const response = await apiClient.delete<MensajeCultivoResponse>(
      `/cultivos/base/${id_cultivo_base}/variedades/${id_variedad}`,
    );
    return response.data;
  },
};
