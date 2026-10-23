import { apiClient } from './api';
import { RecomendacionIaResponse } from '../types/recomendacionesIa.types';

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const recomendacionLoteNorte: RecomendacionIaResponse = {
  id_recomendacion: 412,
  id_parcela: 101,
  accion_recomendada: 'REGAR_URGENTE',
  severidad: 'Alta',
  sensor_origen_principal: 'humedad_suelo_pct',
  factores_clave: [{ sensor_ui: 'humedad_suelo_pct', valor: 14.8 }],
  titulo_corto: 'Riego urgente recomendado',
  texto_breve: 'Humedad del suelo (14.8%) bajo umbral crítico en floración.',
  texto_explicativo_extendido:
    'El cultivo de Tomate en etapa media presenta un déficit hídrico severo detectado por humedad_suelo_pct (14.8%). Se aconseja activar inmediatamente el turno de riego para prevenir estrés irreversible y pérdida de rendimiento.',
  fecha_generacion: '2026-10-23T16:15:00Z',
  valida_hasta: '2026-10-23T17:15:00Z',
  origen_datos: 'CACHE_VIGENTE',
};

function sinTextos(recomendacion: RecomendacionIaResponse): boolean {
  return (
    !recomendacion.titulo_corto &&
    !recomendacion.texto_breve &&
    !recomendacion.texto_explicativo_extendido
  );
}

export const recomendacionesIaService = {
  obtenerRecomendacion: async (id_parcela: number): Promise<RecomendacionIaResponse | null> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      if (id_parcela === 101) {
        return delay(recomendacionLoteNorte);
      }
      return delay(null);
    }

    const response = await apiClient.get<RecomendacionIaResponse | ''>(
      `/parcelas/${id_parcela}/recomendacion-ia`,
      {
        validateStatus: (status) => status === 200 || status === 204,
      },
    );

    if (response.status === 204 || response.data == null || response.data === '') {
      return null;
    }

    if (sinTextos(response.data)) {
      return null;
    }

    return response.data;
  },
};
