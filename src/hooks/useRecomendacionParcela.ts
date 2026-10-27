import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { recomendacionesIaService } from '@/services/recomendacionesIa.service';
import { RecomendacionIaResponse } from '@/types/recomendacionesIa.types';

export function codigoErrorRecomendacion(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data as { errorCode?: string; statusCode?: number } | undefined;
  if (data?.errorCode) return data.errorCode;
  if (data?.statusCode === 503 || error.response?.status === 503) {
    return 'AI_SERVICE_UNAVAILABLE';
  }
  return null;
}

export function mensajeErrorRecomendacion(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data as { message?: string } | undefined;
  return typeof data?.message === 'string' ? data.message : null;
}

export function esServicioIaNoDisponible(error: unknown): boolean {
  const codigo = codigoErrorRecomendacion(error);
  return codigo === 'AI_SERVICE_UNAVAILABLE' || codigo === 'WEATHER_SERVICE_UNAVAILABLE';
}

export function useRecomendacionParcela(id_parcela: number | null, consultar = true) {
  return useQuery<RecomendacionIaResponse | null>({
    queryKey: ['recomendacion-ia', id_parcela],
    queryFn: () => recomendacionesIaService.obtenerRecomendacion(id_parcela as number),
    enabled: id_parcela != null && consultar,
    retry: false,
  });
}
