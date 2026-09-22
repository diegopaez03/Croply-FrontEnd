import { useQuery } from '@tanstack/react-query';
import { parcelasService } from '../services/parcelas.service';
import { guardarParcelasCache } from '../utils/offlineCache';
import { useEffect } from 'react';

export function useParcelasPorFinca(id_finca: number | null) {
  const query = useQuery({
    queryKey: ['parcelas', id_finca],
    queryFn: () => parcelasService.listarPorFinca(id_finca as number),
    enabled: id_finca != null,
  });

  useEffect(() => {
    if (id_finca != null && query.data) {
      guardarParcelasCache(id_finca, query.data);
    }
  }, [id_finca, query.data]);

  return query;
}
