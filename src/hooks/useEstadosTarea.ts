import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { estadosTareaService } from "@/services/estadosTarea.service";
import { CreateEstadoTareaRequest, UpdateEstadoTareaRequest } from "@/types/estadosTarea.types";
import { showSuccessToast } from "@/utils/successHandler";
import { handleFormError } from "@/utils/errorHandler";
import { UseFormSetError } from "react-hook-form";

export function useEstadosTarea() {
  const query = useQuery({
    queryKey: ["estadosTarea"],
    queryFn: estadosTareaService.getEstadosTarea,
  });

  return {
    query,
  };
}

export function useEstadosTareaMutations(
  onSuccessCallback?: () => void,
  setError?: UseFormSetError<any>,
  setDeleteError?: (err: string | null) => void
) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateEstadoTareaRequest) => estadosTareaService.createEstadoTarea(data),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ["estadosTarea"] });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      if (setError) {
        handleFormError(error, setError);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEstadoTareaRequest }) =>
      estadosTareaService.updateEstadoTarea(id, data),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ["estadosTarea"] });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      if (setError) {
        handleFormError(error, setError);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => estadosTareaService.deleteEstadoTarea(id),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ["estadosTarea"] });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      const errorCode = error?.response?.data?.errorCode;
      if (errorCode === "RESOURCE_IN_USE" || errorCode === "PROTECTED_CATALOG_ITEM") {
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
