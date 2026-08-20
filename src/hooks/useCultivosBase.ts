import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cultivosService } from '../services/cultivos.service';
import { CrearCultivoBaseRequest, CrearVariedadRequest } from '../types/cultivos.types';

export const cultivosBaseQueryKey = ['cultivosBase'] as const;

export function cultivoBaseQueryKey(id: number | null) {
  return ['cultivoBase', id] as const;
}

export function useCultivosBase() {
  return useQuery({
    queryKey: cultivosBaseQueryKey,
    queryFn: () => cultivosService.listar(),
  });
}

export function useCultivoBase(id_cultivo_base: number | null) {
  return useQuery({
    queryKey: cultivoBaseQueryKey(id_cultivo_base),
    queryFn: () => cultivosService.obtenerDetalle(id_cultivo_base as number),
    enabled: id_cultivo_base != null,
  });
}

export function useCrearCultivoBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearCultivoBaseRequest) => cultivosService.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cultivosBaseQueryKey });
    },
  });
}

export function useActualizarCultivoBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id_cultivo_base,
      data,
    }: {
      id_cultivo_base: number;
      data: CrearCultivoBaseRequest;
    }) => cultivosService.actualizar(id_cultivo_base, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: cultivosBaseQueryKey });
      queryClient.invalidateQueries({ queryKey: cultivoBaseQueryKey(variables.id_cultivo_base) });
    },
  });
}

export function useEliminarCultivoBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id_cultivo_base: number) => cultivosService.eliminar(id_cultivo_base),
    onSuccess: (_data, id_cultivo_base) => {
      queryClient.invalidateQueries({ queryKey: cultivosBaseQueryKey });
      queryClient.removeQueries({ queryKey: cultivoBaseQueryKey(id_cultivo_base) });
    },
  });
}

export function useAgregarVariedad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id_cultivo_base,
      data,
    }: {
      id_cultivo_base: number;
      data: CrearVariedadRequest;
    }) => cultivosService.agregarVariedad(id_cultivo_base, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: cultivosBaseQueryKey });
      queryClient.invalidateQueries({ queryKey: cultivoBaseQueryKey(variables.id_cultivo_base) });
    },
  });
}

export function useActualizarVariedad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id_cultivo_base,
      id_variedad,
      data,
    }: {
      id_cultivo_base: number;
      id_variedad: number;
      data: CrearVariedadRequest;
    }) => cultivosService.actualizarVariedad(id_cultivo_base, id_variedad, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: cultivosBaseQueryKey });
      queryClient.invalidateQueries({ queryKey: cultivoBaseQueryKey(variables.id_cultivo_base) });
    },
  });
}

export function useEliminarVariedad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id_cultivo_base,
      id_variedad,
    }: {
      id_cultivo_base: number;
      id_variedad: number;
    }) => cultivosService.eliminarVariedad(id_cultivo_base, id_variedad),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: cultivosBaseQueryKey });
      queryClient.invalidateQueries({ queryKey: cultivoBaseQueryKey(variables.id_cultivo_base) });
    },
  });
}
