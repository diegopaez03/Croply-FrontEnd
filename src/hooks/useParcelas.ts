import { useQuery } from '@tanstack/react-query';
import { parcelasService } from '../services/parcelas.service';

export function useParcelasPorFinca(id_finca: number | null) {
  return useQuery({
    queryKey: ['parcelas', id_finca],
    queryFn: () => parcelasService.listarPorFinca(id_finca as number),
    enabled: id_finca != null,
  });
}
