import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tiposSensorService } from "@/services/tiposSensor.service";
import { CreateTipoSensorRequest, UpdateTipoSensorRequest } from "@/types/tiposSensor.types";
import { showSuccessToast } from "@/utils/successHandler";
import { handleFormError } from "@/utils/errorHandler";
import { UseFormSetError } from "react-hook-form";

export function useTiposSensor() {
  const query = useQuery({
    queryKey: ["tiposSensor"],
    queryFn: tiposSensorService.getTiposSensor,
  });

  const codigosQuery = useQuery({
    queryKey: ["codigosTiposSensor"],
    queryFn: tiposSensorService.getCodigosDisponibles,
  });

  return {
    query,
    codigosQuery,
  };
}

export function useTiposSensorMutations(
  onSuccessCallback?: () => void,
  setError?: UseFormSetError<any>,
  setDeleteError?: (err: string | null) => void
) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateTipoSensorRequest) => tiposSensorService.createTipoSensor(data),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ["tiposSensor"] });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      if (setError) {
        handleFormError(error, setError);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTipoSensorRequest }) =>
      tiposSensorService.updateTipoSensor(id, data),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ["tiposSensor"] });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      if (setError) {
        handleFormError(error, setError);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tiposSensorService.deleteTipoSensor(id),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ["tiposSensor"] });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      if (error?.response?.data?.errorCode === "RESOURCE_IN_USE") {
         setDeleteError?.(error.response.data.message);
      } else {
        handleFormError(error);
      }
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
