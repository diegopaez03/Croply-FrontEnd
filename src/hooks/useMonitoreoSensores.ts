import { useQuery } from '@tanstack/react-query';
import { fincasService } from '@/services/fincas.service';
import { MonitoreoSensoresResponse } from '@/types/monitoreoSensores.types';

export function useMonitoreoSensoresQuery(id_parcela: number | null) {
  return useQuery<MonitoreoSensoresResponse>({
    queryKey: ['monitoreoSensores', id_parcela],
    queryFn: () => fincasService.getMonitoreoSensoresParcela(id_parcela as number),
    enabled: !!id_parcela,
    refetchInterval: 60000,
  });
}
