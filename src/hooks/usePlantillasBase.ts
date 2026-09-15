import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { plantillasService } from '../services/plantillas.service';
import { CrearPlantillaBaseRequest, ListarPlantillasBaseQuery } from '../types/plantillas.types';

export const plantillasBaseQueryKey = ['plantillasBase'] as const;

export function plantillaBaseQueryKey(id: number | null) {
  return ['plantillaBase', id] as const;
}

export function usePlantillasBase(params: ListarPlantillasBaseQuery) {
  return useQuery({
    queryKey: [...plantillasBaseQueryKey, params],
    queryFn: () => plantillasService.listar(params),
  });
}

export function usePlantillaBase(id_plantilla_base: number | null) {
  return useQuery({
    queryKey: plantillaBaseQueryKey(id_plantilla_base),
    queryFn: () => plantillasService.obtenerDetalle(id_plantilla_base as number),
    enabled: id_plantilla_base != null,
  });
}

export function useCrearPlantillaBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearPlantillaBaseRequest) => plantillasService.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plantillasBaseQueryKey });
    },
  });
}

export function useActualizarPlantillaBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id_plantilla_base,
      data,
    }: {
      id_plantilla_base: number;
      data: CrearPlantillaBaseRequest;
    }) => plantillasService.actualizar(id_plantilla_base, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: plantillasBaseQueryKey });
      queryClient.invalidateQueries({
        queryKey: plantillaBaseQueryKey(variables.id_plantilla_base),
      });
    },
  });
}

export function useEliminarPlantillaBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id_plantilla_base: number) => plantillasService.eliminar(id_plantilla_base),
    onSuccess: (_data, id_plantilla_base) => {
      queryClient.invalidateQueries({ queryKey: plantillasBaseQueryKey });
      queryClient.removeQueries({ queryKey: plantillaBaseQueryKey(id_plantilla_base) });
    },
  });
}
