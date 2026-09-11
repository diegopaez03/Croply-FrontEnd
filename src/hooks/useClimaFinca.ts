import { useQuery } from '@tanstack/react-query';
import { fincasService } from '@/services/fincas.service';
import { ClimaResponse } from '@/types/clima.types';

export function useClimaFinca(idFinca: number | null) {
  return useQuery<ClimaResponse>({
    queryKey: ['climaFinca', idFinca],
    queryFn: () => fincasService.getClimaFinca(idFinca as number),
    enabled: !!idFinca,
    refetchInterval: 1800000, // 30 minutes in milliseconds
  });
}
