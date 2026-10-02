import { AxiosError } from 'axios';
import { apiClient } from './api';
import { 
  CrearGastoRequest, 
  CrearGastoResponse, 
  EditarGastoRequest, 
  EditarGastoResponse,
  GastoProduccion,
  GetGastosRequest,
  GetGastosResponse,
  EvolucionMensualResponse,
  ExportarGastosRequest
} from '../types/costos.types';

export const throwInvalidDateRangeError = () => {
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
};

export const throwEmptyExportResultError = () => {
  const err = new AxiosError('Empty Export Result');
  err.response = {
    data: {
      statusCode: 400,
      errorCode: 'EMPTY_EXPORT_RESULT',
      message: 'No hay gastos para exportar con los filtros seleccionados. Ajustá la configuración del reporte.',
    },
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: {} as any,
  };
  return Promise.reject(err);
};

import { usuariosService } from './usuarios.service';

// Mock DB en memoria
let mockGastos: GastoProduccion[] = [];
let nextId = 2;

export const costosService = {
  getGastos: async (id_finca: number, params: GetGastosRequest): Promise<GetGastosResponse> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise(resolve => setTimeout(resolve, 800));

      const { page = 1, pageSize = 10, fecha_desde, fecha_hasta } = params;
      let filtered = mockGastos.filter(g => g.id_finca === id_finca && !g.fecha_baja_gp);

      if (fecha_desde || fecha_hasta) {
        if (fecha_desde) filtered = filtered.filter(g => g.fecha_gp >= fecha_desde);
        if (fecha_hasta) filtered = filtered.filter(g => g.fecha_gp <= fecha_hasta);
      }

      // Ordenar por fecha_gp descendente, luego fecha_alta_gp descendente
      filtered.sort((a, b) => {
        if (a.fecha_gp !== b.fecha_gp) {
          return new Date(b.fecha_gp).getTime() - new Date(a.fecha_gp).getTime();
        }
        return new Date(b.fecha_alta_gp || 0).getTime() - new Date(a.fecha_alta_gp || 0).getTime();
      });

      const total = filtered.length;
      
      let monto_total_periodo = 0;
      let etiqueta_periodo: 'mes_actual' | 'rango_filtrado';

      if (fecha_desde || fecha_hasta) {
        etiqueta_periodo = 'rango_filtrado';
        monto_total_periodo = filtered.reduce((sum, g) => sum + g.monto_gp, 0);
      } else {
        etiqueta_periodo = 'mes_actual';
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentMonthGastos = filtered.filter(g => {
          const [yearStr, monthStr] = g.fecha_gp.split('-');
          return parseInt(yearStr, 10) === currentYear && (parseInt(monthStr, 10) - 1) === currentMonth;
        });
        monto_total_periodo = currentMonthGastos.reduce((sum, g) => sum + g.monto_gp, 0);
      }

      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        gastos: paginated,
        total,
        page,
        pageSize,
        monto_total_periodo,
        etiqueta_periodo
      };
    }

    const response = await apiClient.get<GetGastosResponse>(`/fincas/${id_finca}/gastos`, { params });
    return response.data;
  },

  getEvolucionMensual: async (id_finca: number, params?: { fecha_desde?: string, fecha_hasta?: string }): Promise<EvolucionMensualResponse[]> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise(resolve => setTimeout(resolve, 800));

      const now = new Date();
      let start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      let end = new Date(now.getFullYear(), now.getMonth(), 1);

      if (params?.fecha_desde) {
        const [y, m] = params.fecha_desde.split('-');
        start = new Date(Number(y), Number(m) - 1, 1);
      }
      if (params?.fecha_hasta) {
        const [y, m] = params.fecha_hasta.split('-');
        end = new Date(Number(y), Number(m) - 1, 1);
      }

      const tieneGastosGlobales = mockGastos.some(g => g.id_finca === id_finca && !g.fecha_baja_gp);
      if (!tieneGastosGlobales) {
        return [];
      }

      const result: EvolucionMensualResponse[] = [];
      let current = new Date(start);
      // Evitar loop infinito si las fechas están invertidas
      if (current > end) {
        current = new Date(end);
        end = new Date(start);
      }

      while (current <= end) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const mesStr = `${year}-${month}`;

        const monthGastos = mockGastos.filter(g => 
          g.id_finca === id_finca && 
          !g.fecha_baja_gp &&
          g.fecha_gp.startsWith(mesStr)
        );
        const monto = monthGastos.reduce((sum, g) => sum + g.monto_gp, 0);

        result.push({ mes: mesStr, monto });

        current.setMonth(current.getMonth() + 1);
      }

      return result;
    }

    const response = await apiClient.get<EvolucionMensualResponse[]>(`/fincas/${id_finca}/gastos/evolucion-mensual`, { params });
    return response.data;
  },

  exportarGastos: async (id_finca: number, data: ExportarGastosRequest): Promise<Blob> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (data.fecha_desde && data.fecha_hasta && data.fecha_desde > data.fecha_hasta) {
        return throwInvalidDateRangeError();
      }

      let filtered = mockGastos.filter(g => g.id_finca === id_finca && !g.fecha_baja_gp);
      if (data.fecha_desde) filtered = filtered.filter(g => g.fecha_gp >= data.fecha_desde!);
      if (data.fecha_hasta) filtered = filtered.filter(g => g.fecha_gp <= data.fecha_hasta!);

      if (filtered.length === 0) {
        return throwEmptyExportResultError();
      }

      const content = 'Mock PDF Content para Costos';
      return new Blob([content], { type: 'application/pdf' });
    }

    const response = await apiClient.post<Blob>(`/fincas/${id_finca}/gastos/exportar`, data, {
      responseType: 'blob',
    });
    return response.data;
  },

  crearGasto: async (id_finca: number, data: CrearGastoRequest): Promise<CrearGastoResponse> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise(resolve => setTimeout(resolve, 800));

      const res = await usuariosService.getUsuariosFinca(id_finca, { page: 1, pageSize: 100 });
      const usuario = res.usuarios.find(u => 
        (u.id_usuario_finca && u.id_usuario_finca === data.id_responsable) || 
        u.id_usuario === data.id_responsable
      );
      const nombre_responsable = usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Responsable Mock';

      const nuevoGasto: GastoProduccion = {
        id_gasto_produccion: nextId++,
        nombre_insumo_gp: data.nombre_insumo_gp,
        monto_gp: data.monto_gp,
        fecha_gp: data.fecha_gp,
        id_responsable: data.id_responsable,
        nombre_responsable,
        id_finca,
        nombre_finca: "Finca Mock",
        fecha_alta_gp: new Date().toISOString()
      };

      mockGastos.unshift(nuevoGasto);

      return {
        message: "Gasto registrado correctamente",
        ...nuevoGasto
      } as CrearGastoResponse;
    }

    const response = await apiClient.post<CrearGastoResponse>(`/fincas/${id_finca}/gastos`, data);
    return response.data;
  },

  editarGasto: async (id_finca: number, id_gasto_produccion: number, data: EditarGastoRequest): Promise<EditarGastoResponse> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise(resolve => setTimeout(resolve, 800));

      const index = mockGastos.findIndex(g => g.id_gasto_produccion === id_gasto_produccion && g.id_finca === id_finca);
      if (index === -1) {
        const err = new AxiosError('Resource Not Found');
        err.response = {
          data: { statusCode: 404, errorCode: 'RESOURCE_NOT_FOUND', message: 'El gasto no existe.' },
          status: 404, statusText: 'Not Found', headers: {}, config: {} as any
        };
        return Promise.reject(err);
      }

      const res = await usuariosService.getUsuariosFinca(id_finca, { page: 1, pageSize: 100 });
      const usuario = res.usuarios.find(u => 
        (u.id_usuario_finca && u.id_usuario_finca === data.id_responsable) || 
        u.id_usuario === data.id_responsable
      );
      const nombre_responsable = usuario ? `${usuario.nombre} ${usuario.apellido}` : mockGastos[index].nombre_responsable;

      mockGastos[index] = {
        ...mockGastos[index],
        ...data,
        nombre_responsable,
        fecha_modificacion_gp: new Date().toISOString()
      };

      return {
        message: "Gasto actualizado correctamente",
        ...mockGastos[index]
      } as EditarGastoResponse;
    }

    const response = await apiClient.put<EditarGastoResponse>(`/fincas/${id_finca}/gastos/${id_gasto_produccion}`, data);
    return response.data;
  },

  eliminarGasto: async (id_finca: number, id_gasto_produccion: number): Promise<{ message: string }> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise(resolve => setTimeout(resolve, 800));

      const index = mockGastos.findIndex(g => g.id_gasto_produccion === id_gasto_produccion && g.id_finca === id_finca);
      if (index === -1) {
        const err = new AxiosError('Resource Not Found');
        err.response = {
          data: { statusCode: 404, errorCode: 'RESOURCE_NOT_FOUND', message: 'El gasto no existe.' },
          status: 404, statusText: 'Not Found', headers: {}, config: {} as any
        };
        return Promise.reject(err);
      }

      // Baja lógica
      mockGastos[index].fecha_baja_gp = new Date().toISOString();

      return { message: "Gasto eliminado correctamente" };
    }

    const response = await apiClient.delete<{ message: string }>(`/fincas/${id_finca}/gastos/${id_gasto_produccion}`);
    return response.data;
  }
};
