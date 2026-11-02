import { apiClient } from './api';
import { ListadoAlertasClimaticasResponse } from '../types/alertasClimaticas.types';

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const alertaHelada: ListadoAlertasClimaticasResponse = {
  alertas: [
    {
      id_alerta: 89,
      codigo_alerta: 'ALERTA_HELADA',
      severidad: 'Alta',
      fecha_deteccion: '2026-10-23T05:00:00Z',
      descripcion:
        'Helada severa pronosticada. Temperatura mínima de -2.0°C esperada en las próximas 24 horas.',
      estado: 'Vigente',
    },
  ],
};

export const alertasClimaticasService = {
  listarVigentes: async (id_finca: number): Promise<ListadoAlertasClimaticasResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      // La finca 1 es la del contrato; la 12 es "Finca La Esperanza" del mock de Mi Finca.
      if (id_finca === 1 || id_finca === 12) {
        return delay(alertaHelada);
      }
      return delay({ alertas: [] });
    }

    const response = await apiClient.get<ListadoAlertasClimaticasResponse>(
      `/fincas/${id_finca}/alertas-climaticas`,
      { params: { estado: 'Vigente' } },
    );
    return response.data;
  },
};
