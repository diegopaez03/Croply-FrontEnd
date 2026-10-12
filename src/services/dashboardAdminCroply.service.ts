import { apiClient } from './api';
import { TableroGlobalResponse } from '../types/dashboardAdminCroply.types';

export const mockTableroGlobal: TableroGlobalResponse = {
  clientes: {
    total: 1482,
    crecimiento_porcentaje: 12,
    nuevos_este_mes: 45,
  },
  sensores: {
    activos: 24501,
    porcentaje_parque_total: 94,
    estado: 'Estable',
    total_activos: 23030,
    total_inactivos: 1471,
  },
  hectareas: {
    total: 842100,
    provincias: 14,
  },
  evolucion_fincas: [
    { mes: 'ENE', nuevas_fincas: 40 },
    { mes: 'FEB', nuevas_fincas: 42 },
    { mes: 'MAR', nuevas_fincas: 74 },
    { mes: 'ABR', nuevas_fincas: 50 },
    { mes: 'MAY', nuevas_fincas: 76 },
    { mes: 'JUN', nuevas_fincas: 100 },
  ],
};

export const dashboardAdminCroplyService = {
  getTableroGlobal: async (): Promise<TableroGlobalResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return mockTableroGlobal;
    }
    const response = await apiClient.get<TableroGlobalResponse>('/admin/tablero-global');
    return response.data;
  },
};
