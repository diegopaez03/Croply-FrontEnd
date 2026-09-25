import { AxiosError } from 'axios';
import { apiClient } from './api';
import { RegistrarAplicacionRequest, AplicacionAgroquimicoDetalle, ListarAplicacionesResponse, EditarAplicacionRequest, ExportarAplicacionesParams } from '../types/agroquimicos.types';
import { mockTiposTarea } from './tiposTarea.service';
import { mockFincas } from './fincas.service';
import { _mockCrearTareaAgroquimico, mockParcelWithoutActionPlan, planesAccionService, _mockEditarTareaAgroquimico } from './planesAccion.service';
import { usuariosService } from './usuarios.service';

export function mockAgrochemicalTaskTypeUnavailable() {
  const err = new AxiosError('Agrochemical Task Type Unavailable');
  err.response = {
    data: {
      statusCode: 400,
      errorCode: 'AGROCHEMICAL_TASK_TYPE_UNAVAILABLE',
      message: 'No es posible registrar la aplicación. El tipo de tarea requerido no está disponible.',
    },
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: {} as any,
  };
  return Promise.reject(err);
}

export function mockLinkedTaskDeleted() {
  const err = new AxiosError('Linked Task Deleted');
  err.response = {
    data: {
      statusCode: 409,
      errorCode: 'LINKED_TASK_DELETED',
      message: 'No es posible editar esta aplicación. La tarea asociada fue eliminada.',
    },
    status: 409,
    statusText: 'Conflict',
    headers: {},
    config: {} as any,
  };
  return Promise.reject(err);
}

export function mockInvalidDateRange() {
  const err = new AxiosError('Invalid Date Range');
  err.response = {
    data: {
      statusCode: 400,
      errorCode: 'INVALID_DATE_RANGE',
      message: 'La fecha de fin debe ser igual o posterior a la fecha de inicio.',
    },
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: {} as any,
  };
  return Promise.reject(err);
}

export function mockEmptyExportResult() {
  const err = new AxiosError('Empty Export Result');
  err.response = {
    data: {
      statusCode: 400,
      errorCode: 'EMPTY_EXPORT_RESULT',
      message: 'No hay aplicaciones para exportar con los filtros seleccionados. Ajustá la configuración del reporte.',
    },
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: {} as any,
  };
  return Promise.reject(err);
}

let nextAplicacionId = 1;
export const mockAplicaciones: AplicacionAgroquimicoDetalle[] = [];

export const agroquimicosService = {
  registrarAplicacion: async (id_finca: number, data: RegistrarAplicacionRequest): Promise<{ message: string, aplicacion: AplicacionAgroquimicoDetalle }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await new Promise(resolve => setTimeout(resolve, 800));

      const tipoAgroquimico = mockTiposTarea.find(t => t.es_tipo_agroquimico);
      if (!tipoAgroquimico) {
        throw mockAgrochemicalTaskTypeUnavailable();
      }

      // Find the parcel inside the farm
      let parcela: any = null;
      const finca = mockFincas.find((f: any) => f.id_finca === id_finca);
      if (finca) {
        parcela = finca.parcelas.find((p: any) => p.id_parcela === data.id_parcela);
      }
      if (!parcela) {
        const err = new AxiosError('Parcel not found');
        err.response = { data: { statusCode: 404, errorCode: 'RESOURCE_NOT_FOUND', message: 'Parcela no encontrada' }, status: 404, statusText: 'Not Found', headers: {}, config: {} as any };
        throw err;
      }

      // Check if parcel has an active action plan
      const planActivo = parcela.cultivos_asignados?.find((c: any) => c.estado === 'Activo');
      if (!planActivo) {
        throw mockParcelWithoutActionPlan();
      }

      const usuariosData = await usuariosService.getUsuariosFinca(id_finca, { page: 1, pageSize: 100, estado: 'Activo' });
      const responsable = usuariosData.usuarios.find((u: any) => u.id_usuario_finca === data.id_responsable);
      if (!responsable) {
        const err = new AxiosError('Responsable not found');
        err.response = { data: { statusCode: 404, errorCode: 'RESOURCE_NOT_FOUND', message: 'Responsable no encontrado' }, status: 404, statusText: 'Not Found', headers: {}, config: {} as any };
        throw err;
      }

      const responsableNombre = `${responsable.nombre} ${responsable.apellido}`;

      const tareaCreada = _mockCrearTareaAgroquimico(planActivo.id_plan_accion, data.id_hito_real, {
        nombre_tarea: data.nombre_producto_aa,
        descripcion_tarea: data.nombre_producto_aa,
        id_tipo_tarea: tipoAgroquimico.id_tipo_tarea,
        fecha_planificada_tarea: data.fecha_hora_aplicacion_aa,
        nombre_producto_aa: data.nombre_producto_aa,
        dosis_aa: data.dosis_aa,
        id_responsable: data.id_responsable,
        fecha_hora_aplicacion_aa: data.fecha_hora_aplicacion_aa,
      }, responsableNombre);

      const planDetalle = await planesAccionService.obtenerPlanAccion(planActivo.id_plan_accion);
      const hitoObj = planDetalle.hitos.find(h => h.id_hito_real === data.id_hito_real);
      const nombre_hito = hitoObj ? hitoObj.nombre_hito : 'Desconocido';

      const nuevaAplicacion: AplicacionAgroquimicoDetalle = {
        id_aplicacion: nextAplicacionId++,
        fecha_hora_aplicacion_aa: data.fecha_hora_aplicacion_aa,
        nombre_producto_aa: data.nombre_producto_aa,
        dosis_aa: data.dosis_aa,
        observaciones: data.observaciones,
        id_parcela: data.id_parcela,
        nombre_parcela: parcela.nombre_parcela,
        id_hito_real: data.id_hito_real,
        nombre_hito,
        id_responsable: data.id_responsable,
        nombre_responsable: responsableNombre,
        id_tarea: tareaCreada.id_tarea,
        fecha_creacion: new Date().toISOString()
      };

      mockAplicaciones.unshift(nuevaAplicacion); // Insert at the beginning so it's sorted descending

      return {
        message: 'Aplicación registrada correctamente',
        aplicacion: nuevaAplicacion
      };
    }

    const response = await apiClient.post<AplicacionAgroquimicoDetalle & { message: string }>(`/fincas/${id_finca}/agroquimicos`, data);
    return { message: response.data.message, aplicacion: response.data };
  },

  editarAplicacion: async (id_finca: number, id_aplicacion: number, data: EditarAplicacionRequest): Promise<{ message: string, aplicacion: AplicacionAgroquimicoDetalle }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await new Promise(resolve => setTimeout(resolve, 800));

      const appIndex = mockAplicaciones.findIndex(a => a.id_aplicacion === id_aplicacion);
      if (appIndex === -1) {
        const err = new AxiosError('App not found');
        err.response = { data: { statusCode: 404, errorCode: 'RESOURCE_NOT_FOUND', message: 'Aplicación no encontrada' }, status: 404, statusText: 'Not Found', headers: {}, config: {} as any };
        throw err;
      }

      const aplicacion = mockAplicaciones[appIndex];

      if (aplicacion.id_tarea === null) {
        throw mockLinkedTaskDeleted();
      }

      const usuariosData = await usuariosService.getUsuariosFinca(id_finca, { page: 1, pageSize: 100, estado: 'Activo' });
      const responsable = usuariosData.usuarios.find((u: any) => u.id_usuario_finca === data.id_responsable);
      if (!responsable) {
        const err = new AxiosError('Responsable not found');
        err.response = { data: { statusCode: 404, errorCode: 'RESOURCE_NOT_FOUND', message: 'Responsable no encontrado' }, status: 404, statusText: 'Not Found', headers: {}, config: {} as any };
        throw err;
      }
      const responsableNombre = `${responsable.nombre} ${responsable.apellido}`;

      _mockEditarTareaAgroquimico(aplicacion.id_tarea, {
        fecha_ejecucion_tarea: data.fecha_hora_aplicacion_aa,
        descripcion_tarea: data.nombre_producto_aa,
        id_responsable: data.id_responsable,
      }, responsableNombre);

      const actualizada = {
        ...aplicacion,
        fecha_hora_aplicacion_aa: data.fecha_hora_aplicacion_aa,
        nombre_producto_aa: data.nombre_producto_aa,
        dosis_aa: data.dosis_aa,
        observaciones: data.observaciones,
        id_responsable: data.id_responsable,
        nombre_responsable: responsableNombre,
        fecha_modificacion: new Date().toISOString()
      };

      mockAplicaciones[appIndex] = actualizada;

      return {
        message: 'Aplicación actualizada correctamente.',
        aplicacion: actualizada
      };
    }

    const response = await apiClient.put<AplicacionAgroquimicoDetalle & { message: string }>(`/fincas/${id_finca}/agroquimicos/${id_aplicacion}`, data);
    return { message: response.data.message, aplicacion: response.data };
  },

  listarAplicaciones: async (
    id_finca: number,
    params: {
      page: number;
      pageSize: number;
      id_parcela?: number;
      fecha_desde?: string;
      fecha_hasta?: string;
      id_responsable?: number;
    }
  ): Promise<ListarAplicacionesResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await new Promise(resolve => setTimeout(resolve, 600));

      // 1. Invalid date range check
      if (params.fecha_desde && params.fecha_hasta && params.fecha_hasta < params.fecha_desde) {
        throw mockInvalidDateRange();
      }

      // 2. Filter mock applications
      let filtradas = mockAplicaciones;

      if (params.id_parcela) {
        filtradas = filtradas.filter(a => a.id_parcela === params.id_parcela);
      }
      if (params.id_responsable) {
        filtradas = filtradas.filter(a => a.id_responsable === params.id_responsable);
      }
      if (params.fecha_desde) {
        filtradas = filtradas.filter(a => a.fecha_hora_aplicacion_aa.split('T')[0] >= params.fecha_desde!);
      }
      if (params.fecha_hasta) {
        filtradas = filtradas.filter(a => a.fecha_hora_aplicacion_aa.split('T')[0] <= params.fecha_hasta!);
      }

      const total = filtradas.length;
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      const paginadas = filtradas.slice(start, end);

      return {
        aplicaciones: paginadas,
        total,
        page: params.page,
        pageSize: params.pageSize
      };
    }

    const response = await apiClient.get<ListarAplicacionesResponse>(`/fincas/${id_finca}/agroquimicos`, { params });
    return response.data;
  },

  exportarAplicaciones: async (id_finca: number, params: ExportarAplicacionesParams): Promise<Blob> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (params.fecha_desde && params.fecha_hasta && params.fecha_hasta < params.fecha_desde) {
        throw mockInvalidDateRange();
      }

      let filtradas = mockAplicaciones;

      if (params.id_parcela) {
        filtradas = filtradas.filter(a => a.id_parcela === params.id_parcela);
      }
      if (params.fecha_desde) {
        filtradas = filtradas.filter(a => a.fecha_hora_aplicacion_aa.split('T')[0] >= params.fecha_desde!);
      }
      if (params.fecha_hasta) {
        filtradas = filtradas.filter(a => a.fecha_hora_aplicacion_aa.split('T')[0] <= params.fecha_hasta!);
      }

      if (filtradas.length === 0) {
        throw mockEmptyExportResult();
      }

      // Return a dummy PDF blob
      const pdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 0 >>\nstream\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000214 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n264\n%%EOF';
      return new Blob([pdfContent], { type: 'application/pdf' });
    }

    const response = await apiClient.get<Blob>(`/fincas/${id_finca}/agroquimicos/exportar`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};
