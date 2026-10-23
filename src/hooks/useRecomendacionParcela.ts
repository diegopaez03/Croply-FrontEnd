import axios from 'axios';
import { useQueries, useQuery } from '@tanstack/react-query';
import { recomendacionesIaService } from '@/services/recomendacionesIa.service';
import { RecomendacionIaResponse } from '@/types/recomendacionesIa.types';

const ORDEN_SEVERIDAD: Record<string, number> = {
  Alta: 3,
  Media: 2,
  Baja: 1,
};

export interface ParcelaParaRecomendacion {
  id_parcela: number;
  nombre_parcela: string;
  estado_parcela?: string;
}

export interface RecomendacionDestacada {
  recomendacion: RecomendacionIaResponse;
  nombre_parcela: string;
}

export function esServicioIaNoDisponible(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const data = error.response?.data as { errorCode?: string; statusCode?: number } | undefined;
  return data?.errorCode === 'AI_SERVICE_UNAVAILABLE' || data?.statusCode === 503 || error.response?.status === 503;
}

export function useRecomendacionParcela(id_parcela: number | null) {
  return useQuery<RecomendacionIaResponse | null>({
    queryKey: ['recomendacion-ia', id_parcela],
    queryFn: () => recomendacionesIaService.obtenerRecomendacion(id_parcela as number),
    enabled: id_parcela != null,
    retry: false,
  });
}

export function useRecomendacionDestacadaFinca(parcelas: ParcelaParaRecomendacion[]) {
  const activas = parcelas.filter((parcela) => parcela.estado_parcela === 'Activa');

  const consultas = useQueries({
    queries: activas.map((parcela) => ({
      queryKey: ['recomendacion-ia', parcela.id_parcela],
      queryFn: () => recomendacionesIaService.obtenerRecomendacion(parcela.id_parcela),
      retry: false,
    })),
  });

  const isLoading = consultas.some((consulta) => consulta.isPending);

  const candidatos: RecomendacionDestacada[] = [];
  consultas.forEach((consulta, indice) => {
    const recomendacion = consulta.data;
    if (!recomendacion?.titulo_corto) return;
    candidatos.push({
      recomendacion,
      nombre_parcela: activas[indice].nombre_parcela,
    });
  });

  candidatos.sort((a, b) => {
    const severidadA = ORDEN_SEVERIDAD[a.recomendacion.severidad] ?? 0;
    const severidadB = ORDEN_SEVERIDAD[b.recomendacion.severidad] ?? 0;
    if (severidadA !== severidadB) return severidadB - severidadA;
    return (
      new Date(b.recomendacion.fecha_generacion).getTime() -
      new Date(a.recomendacion.fecha_generacion).getTime()
    );
  });

  const servicioNoDisponible =
    !isLoading &&
    candidatos.length === 0 &&
    consultas.some((consulta) => esServicioIaNoDisponible(consulta.error));

  return {
    isLoading,
    destacada: candidatos[0] ?? null,
    servicioNoDisponible,
  };
}
