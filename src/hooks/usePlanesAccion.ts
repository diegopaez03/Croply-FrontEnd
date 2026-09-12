import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { planesAccionService } from '../services/planesAccion.service';
import {
  CrearPlanAccionRequest,
  EstadoPlanAccionManual,
  EstadoTareaPlan,
  TareaPlanPayload,
} from '../types/planesAccion.types';
import { showSuccessToast } from '../utils/successHandler';
import { handleFormError } from '../utils/errorHandler';

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

export function usePlanAccionQuery(id_plan_accion: number | null) {
  return useQuery({
    queryKey: ['planAccion', id_plan_accion],
    queryFn: () => planesAccionService.obtenerPlanAccion(id_plan_accion as number),
    enabled: id_plan_accion != null,
  });
}

function invalidatePlan(queryClient: ReturnType<typeof useQueryClient>, id_plan_accion: number, id_parcela?: number) {
  queryClient.invalidateQueries({ queryKey: ['planAccion', id_plan_accion] });
  if (id_parcela != null) {
    queryClient.invalidateQueries({ queryKey: ['parcela', id_parcela] });
    queryClient.invalidateQueries({ queryKey: ['historialCultivos', id_parcela] });
  }
}

export function useCrearTareaPlan(
  id_plan_accion: number,
  id_parcela?: number,
  onSuccess?: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id_hito_real,
      data,
    }: {
      id_hito_real: number;
      data: TareaPlanPayload;
    }) => planesAccionService.crearTarea(id_plan_accion, id_hito_real, data),
    onSuccess: (res) => {
      showSuccessToast(res);
      invalidatePlan(queryClient, id_plan_accion, id_parcela);
      onSuccess?.();
    },
    onError: (error) => handleFormError(error),
  });
}

export function useEditarTareaPlan(
  id_plan_accion: number,
  id_parcela?: number,
  onSuccess?: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id_tarea,
      data,
    }: {
      id_tarea: number;
      data: TareaPlanPayload;
    }) => planesAccionService.editarTarea(id_plan_accion, id_tarea, data),
    onSuccess: () => {
      showSuccessToast({ message: 'Tarea actualizada correctamente' });
      invalidatePlan(queryClient, id_plan_accion, id_parcela);
      onSuccess?.();
    },
    onError: (error) => handleFormError(error),
  });
}

export function useCambiarEstadoTareaPlan(id_plan_accion: number, id_parcela?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id_tarea,
      estado,
    }: {
      id_tarea: number;
      estado: EstadoTareaPlan;
    }) => planesAccionService.cambiarEstadoTarea(id_plan_accion, id_tarea, estado),
    onSuccess: (res) => {
      showSuccessToast(res);
      invalidatePlan(queryClient, id_plan_accion, id_parcela);
    },
    onError: (error) => handleFormError(error),
  });
}

export function useEliminarTareaPlan(id_plan_accion: number, id_parcela?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id_tarea: number) =>
      planesAccionService.eliminarTarea(id_plan_accion, id_tarea),
    onSuccess: (res) => {
      showSuccessToast(res);
      invalidatePlan(queryClient, id_plan_accion, id_parcela);
    },
    onError: (error) => handleFormError(error),
  });
}

export function useCambiarEstadoPlanAccion(id_plan_accion: number, id_parcela?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (estado: EstadoPlanAccionManual) =>
      planesAccionService.cambiarEstadoPlan(id_plan_accion, estado),
    onSuccess: (res) => {
      showSuccessToast(res);
      invalidatePlan(queryClient, id_plan_accion, id_parcela);
    },
    onError: (error) => handleFormError(error),
  });
}
