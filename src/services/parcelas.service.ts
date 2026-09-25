import { ParcelaListado } from '../types/parcelas.types';

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

import { apiClient } from './api';
import { mockFincas } from './fincas.service';

export const parcelasService = {
  listarPorFinca: async (id_finca: number): Promise<ParcelaListado[]> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await delay(300);
      const finca = mockFincas.find((f) => f.id_finca === id_finca);
      if (!finca) return [];
      
      return finca.parcelas.map((p) => {
        // Calculate available area if needed, mock fallback
        const ocupada = p.cultivos_asignados?.reduce((acc: number, curr: any) => acc + Number(curr.superficie_asignada || 0), 0) || 0;
        
        return {
          id_parcela: p.id_parcela,
          id_finca: id_finca,
          nombre_parcela: p.nombre_parcela,
          superficie_ha: p.superficie_parcela,
          superficie_disponible_ha: p.superficie_parcela - ocupada,
        };
      });
    }

    const response = await apiClient.get<ParcelaListado[]>(`/fincas/${id_finca}/parcelas`);
    return response.data;
  },
};
