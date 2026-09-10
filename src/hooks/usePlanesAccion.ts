import { useMutation, useQuery } from '@tanstack/react-query';
import { planesAccionService } from '../services/planesAccion.service';
import { CrearPlanAccionRequest } from '../types/planesAccion.types';

export function usePlanPreview(id_cultivo_base: number | null, id_parcela: number | null) {
  return useQuery({
    queryKey: ['planPreview', id_cultivo_base, id_parcela],
    queryFn: () => planesAccionService.obtenerPreviewPlan(id_cultivo_base as number, id_parcela as number),
    enabled: id_cultivo_base != null && id_parcela != null,
  });
}

export function useCrearPlanAccion(
  onSuccessCallback?: (message: string) => void,
  onErrorCallback?: (error: unknown) => void
) {
  return useMutation({
    mutationFn: ({ id_parcela, data }: { id_parcela: number; data: CrearPlanAccionRequest }) =>
      planesAccionService.crearPlanAccion(id_parcela, data),
    onSuccess: (response) => {
      if (onSuccessCallback) onSuccessCallback(response.message);
    },
    onError: (error) => {
      if (onErrorCallback) onErrorCallback(error);
    },
  });
}
