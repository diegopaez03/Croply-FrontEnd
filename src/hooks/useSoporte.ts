import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { UseFormSetError } from 'react-hook-form';
import { soporteService } from '@/services/soporte.service';
import {
  ListarPreguntasFrecuentesGestionRequest,
  CrearPreguntaFrecuenteRequest,
  EditarPreguntaFrecuenteRequest,
} from '@/types/soporte.types';
import { showSuccessToast } from '@/utils/successHandler';
import { handleFormError } from '@/utils/errorHandler';

export function usePreguntasFrecuentesGestion(params: ListarPreguntasFrecuentesGestionRequest = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;

  return useQuery({
    queryKey: ['preguntas-frecuentes', 'gestion', page, pageSize],
    queryFn: () => soporteService.getPreguntasFrecuentesGestion({ page, pageSize }),
    placeholderData: keepPreviousData,
  });
}

export function usePreguntasFrecuentesConsulta() {
  return useQuery({
    queryKey: ['preguntas-frecuentes', 'consulta'],
    queryFn: () => soporteService.getPreguntasFrecuentesConsulta(),
    staleTime: 0,
  });
}

export function useConfiguracionSoporte() {
  return useQuery({
    queryKey: ['soporte', 'configuracion'],
    queryFn: () => soporteService.getConfiguracionSoporte(),
  });
}

export function useSoporteMutations(options?: {
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onNotFound?: () => void;
  createSetError?: UseFormSetError<any>;
  updateSetError?: UseFormSetError<any>;
}) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CrearPreguntaFrecuenteRequest) => soporteService.crearPreguntaFrecuente(data),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ['preguntas-frecuentes'] });
      options?.onCreateSuccess?.();
    },
    onError: (error: any) => {
      if (options?.createSetError) {
        handleFormError(error, options.createSetError);
      } else {
        handleFormError(error);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditarPreguntaFrecuenteRequest }) =>
      soporteService.editarPreguntaFrecuente(id, data),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ['preguntas-frecuentes'] });
      options?.onUpdateSuccess?.();
    },
    onError: (error: any) => {
      if (error?.response?.status === 404 || error?.response?.data?.errorCode === 'RESOURCE_NOT_FOUND') {
        queryClient.invalidateQueries({ queryKey: ['preguntas-frecuentes'] });
        options?.onNotFound?.();
      }
      if (options?.updateSetError) {
        handleFormError(error, options.updateSetError);
      } else {
        handleFormError(error);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => soporteService.eliminarPreguntaFrecuente(id),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ['preguntas-frecuentes'] });
      options?.onDeleteSuccess?.();
    },
    onError: (error: any) => {
      if (error?.response?.status === 404 || error?.response?.data?.errorCode === 'RESOURCE_NOT_FOUND') {
        queryClient.invalidateQueries({ queryKey: ['preguntas-frecuentes'] });
        options?.onNotFound?.();
      }
      handleFormError(error);
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
