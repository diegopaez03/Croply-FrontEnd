import { useMiFincaResumenQuery } from './useFincas';

export interface ParcelaResumen {
  id_parcela: number;
  nombre_parcela: string;
  estado_parcela: string;
}

export function useParcelasPorFinca(id_finca: number | null) {
  const query = useMiFincaResumenQuery(id_finca);

  return {
    ...query,
    data: query.data?.parcelas as ParcelaResumen[] | undefined,
  };
}
