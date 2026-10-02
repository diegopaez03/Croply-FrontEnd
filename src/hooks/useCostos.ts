import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { costosService } from '@/services/costos.service';
import { CrearGastoRequest, EditarGastoRequest, GetGastosRequest, ExportarGastosRequest } from '@/types/costos.types';
import { handleFormError } from '@/utils/errorHandler';
import { showSuccessToast } from '@/utils/successHandler';

export const useGastosQuery = (id_finca: number | null, params: GetGastosRequest) => {
  return useQuery({
    queryKey: ['gastos', id_finca, params],
    queryFn: () => costosService.getGastos(id_finca!, params),
    enabled: !!id_finca,
    placeholderData: keepPreviousData,
  });
};

export const useEvolucionMensualQuery = (id_finca: number | null, params?: { fecha_desde?: string, fecha_hasta?: string }) => {
  return useQuery({
    queryKey: ['gastos', 'evolucion-mensual', id_finca, params],
    queryFn: () => costosService.getEvolucionMensual(id_finca!, params),
    enabled: !!id_finca,
    placeholderData: keepPreviousData,
  });
};

export const useExportarGastosMutation = () => {
  return useMutation({
    mutationFn: ({ id_finca, data }: { id_finca: number, data: ExportarGastosRequest }) => 
      costosService.exportarGastos(id_finca, data),
  });
};

export const useCrearGastoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id_finca, data }: { id_finca: number; data: CrearGastoRequest }) => 
      costosService.crearGasto(id_finca, data),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
    },
    onError: (error) => handleFormError(error)
  });
};

export const useEditarGastoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id_finca, id_gasto_produccion, data }: { id_finca: number; id_gasto_produccion: number; data: EditarGastoRequest }) => 
      costosService.editarGasto(id_finca, id_gasto_produccion, data),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
    },
    onError: (error) => handleFormError(error)
  });
};

export const useEliminarGastoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id_finca, id_gasto_produccion }: { id_finca: number; id_gasto_produccion: number }) => 
      costosService.eliminarGasto(id_finca, id_gasto_produccion),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
    },
    onError: (error) => handleFormError(error)
  });
};
