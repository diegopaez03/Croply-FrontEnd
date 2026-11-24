import { useQuery } from '@tanstack/react-query';
import { alertasClimaticasService } from '@/services/alertasClimaticas.service';
import { ListadoAlertasClimaticasResponse } from '@/types/alertasClimaticas.types';

const TREINTA_MINUTOS_MS = 1_800_000;

export function useAlertasClimaticas(id_finca: number | null) {
  return useQuery<ListadoAlertasClimaticasResponse>({
    queryKey: ['alertas-climaticas', id_finca, 'Vigente'],
    queryFn: () => alertasClimaticasService.listarVigentes(id_finca as number),
    enabled: id_finca != null,
    refetchInterval: TREINTA_MINUTOS_MS,
    retry: false,
  });
}
