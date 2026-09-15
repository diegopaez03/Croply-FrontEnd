import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fincasService } from '../services/fincas.service';
import { FincaCreatePayload, FincaUpdatePayload } from '../types/fincas.types';
import { showSuccessToast } from '../utils/successHandler';
import { handleFormError } from '../utils/errorHandler';

export function useFincasQuery(page: number, pageSize: number, search?: string) {
  return useQuery({
    queryKey: ['fincas', page, pageSize, search],
    queryFn: () => fincasService.getFincas(page, pageSize, undefined, search),
  });
}

/** Tres queries en paralelo para las cards de métricas del listado de fincas */
export function useFincasStats() {
  const statsTotal = useQuery({
    queryKey: ['fincas', 'stats', 'total'],
    queryFn: () => fincasService.getFincas(1, 1),
  });
  const statsActivas = useQuery({
    queryKey: ['fincas', 'stats', 'activas'],
    queryFn: () => fincasService.getFincas(1, 1, 'Activo'),
  });
  const statsAggregados = useQuery({
    queryKey: ['fincas', 'stats', 'aggregados'],
    queryFn: () => fincasService.getStats(),
  });
  return { statsTotal, statsActivas, statsAggregados };
}

export function useParcelaQuery(id: number | null) {
  return useQuery({
    queryKey: ['parcela', id],
    queryFn: () => fincasService.getParcelaById(id as number),
    enabled: id != null,
  });
}

export function useFincaQuery(id: number | null) {
  return useQuery({
    queryKey: ['finca', id],
    queryFn: () => fincasService.getFincaById(id!),
    enabled: id !== null && !isNaN(id),
  });
}

export function useCreateFincaMutation(onSuccess?: (id: number) => void, setError?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FincaCreatePayload) => fincasService.createFinca(data),
    onSuccess: (res) => {
      showSuccessToast(res.message);
      queryClient.invalidateQueries({ queryKey: ['fincas'] });
      if (onSuccess) onSuccess(res.id_finca);
    },
    onError: (error) => {
      handleFormError(error, setError);
    },
  });
}

export function useUpdateFincaMutation(id: number, onSuccess?: () => void, setError?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FincaUpdatePayload) => fincasService.updateFinca(id, data),
    onSuccess: (res) => {
      showSuccessToast(res.message);
      queryClient.invalidateQueries({ queryKey: ['fincas'] });
      queryClient.invalidateQueries({ queryKey: ['finca', id] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      handleFormError(error, setError);
    },
  });
}

export function useDeleteFincaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fincasService.deleteFinca(id),
    onSuccess: (res) => {
      showSuccessToast(res.message);
      queryClient.invalidateQueries({ queryKey: ['fincas'] });
    },
    onError: (error) => {
      handleFormError(error);
    },
  });
}

export function useAdministradoresFincaDisponiblesQuery() {
  return useQuery({
    queryKey: ['administradores-finca-disponibles'],
    queryFn: () => fincasService.getAdministradoresFincaDisponibles(),
  });
}

export function useUpdateFincaYPropietarioMutation(id: number, onSuccess?: () => void, setError?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { 
      fincaData: FincaUpdatePayload | null, 
      propietarioData: { id_usuario_propietario: number | null } | null 
    }) => {
      const promises: { type: 'finca' | 'propietario', promise: Promise<any> }[] = [];
      
      if (params.fincaData) {
        promises.push({ type: 'finca', promise: fincasService.updateFinca(id, params.fincaData) });
      }
      
      if (params.propietarioData) {
        promises.push({ type: 'propietario', promise: fincasService.asignarPropietario(id, params.propietarioData) });
      }
      
      if (promises.length === 0) {
        throw new Error("No hay cambios para guardar.");
      }
      
      const results = await Promise.allSettled(promises.map(p => p.promise));
      
      const successResults: any[] = [];
      const failedResults: any[] = [];
      
      results.forEach((res, index) => {
        if (res.status === 'fulfilled') {
          successResults.push({ type: promises[index].type, data: res.value });
        } else {
          failedResults.push({ type: promises[index].type, error: res.reason });
        }
      });
      
      if (failedResults.length === promises.length) {
        throw failedResults[0].error;
      }
      
      if (failedResults.length > 0 && successResults.length > 0) {
        const successType = successResults[0].type;
        const failedError = failedResults[0].error;
        let errorMsg = "ocurrió un error";
        if (failedError?.response?.data?.message) {
          errorMsg = failedError.response.data.message;
        } else if (failedError instanceof Error) {
          errorMsg = failedError.message;
        }
        
        const successActionStr = successType === 'finca' ? 'actualizar los datos generales' : 'asignar el propietario';
        throw new Error(`Se logró ${successActionStr}, pero ${errorMsg}`);
      }
      
      return successResults;
    },
    onSuccess: (res) => {
      // Usamos el mensaje del primer éxito o uno genérico si hubo ambos
      const msg = res.length > 1 ? "Finca actualizada correctamente" : res[0].data.message;
      showSuccessToast(msg);
      queryClient.invalidateQueries({ queryKey: ['fincas'] });
      queryClient.invalidateQueries({ queryKey: ['finca', id] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      handleFormError(error, setError);
    },
  });
}

export function useCreateParcelaMutation(id_finca: number, onSuccess?: () => void, setError?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fincasService.createParcela(id_finca, data),
    onSuccess: (res) => {
      showSuccessToast(res.message);
      queryClient.invalidateQueries({ queryKey: ['finca', id_finca] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      handleFormError(error, setError);
    },
  });
}

export function useUpdateParcelaMutation(id_finca: number, onSuccess?: () => void, setError?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id_parcela, data }: { id_parcela: number; data: any }) => fincasService.updateParcela(id_finca, id_parcela, data),
    onSuccess: (res) => {
      showSuccessToast(res.message);
      queryClient.invalidateQueries({ queryKey: ['finca', id_finca] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      handleFormError(error, setError);
    },
  });
}

export function useDeleteParcelaMutation(id_finca: number, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id_parcela: number) => fincasService.deleteParcela(id_finca, id_parcela),
    onSuccess: (res) => {
      showSuccessToast(res.message);
      queryClient.invalidateQueries({ queryKey: ['finca', id_finca] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      handleFormError(error);
    },
  });
}

export function useHistorialCultivosQuery(id_parcela: number | null) {
  return useQuery({
    queryKey: ['historialCultivos', id_parcela],
    queryFn: () => fincasService.getHistorialCultivosParcela(id_parcela as number),
    enabled: id_parcela != null,
  });
}

export function useGenerarQRParcela(onSuccess?: (res: any) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id_parcela: number) => fincasService.generarQRParcela(id_parcela),
    onSuccess: (res, id_parcela) => {
      showSuccessToast(res.message || 'QR generado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['parcela', id_parcela] });
      if (onSuccess) onSuccess(res);
    },
    onError: (error) => {
      handleFormError(error);
    }
  });
}

export function useConsultarQRParcela(onSuccess?: (res: any) => void) {
  return useMutation({
    mutationFn: (id_parcela: number) => fincasService.consultarQRParcela(id_parcela),
    onSuccess: (res) => {
      if (onSuccess) onSuccess(res);
    },
    onError: (error) => {
      handleFormError(error);
    }
  });
}


export function useMiFincaListQuery() {
  return useQuery({
    queryKey: ['mi-finca-list'],
    queryFn: () => fincasService.getMiFincaList(),
  });
}

export function useMiFincaResumenQuery(id_finca: number | null) {
  return useQuery({
    queryKey: ['mi-finca-resumen', id_finca],
    queryFn: () => fincasService.getMiFincaResumen(id_finca as number),
    enabled: !!id_finca,
    retry: false, // Don't retry on 403
  });
}

export function useParcelaResumenDynamicQuery(id_parcela: number | null) {
  return useQuery({
    queryKey: ['parcela-resumen-dynamic', id_parcela],
    queryFn: () => fincasService.getParcelaResumenDynamic(id_parcela as number),
    enabled: !!id_parcela,
  });
}
