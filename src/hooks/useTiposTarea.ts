import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tiposTareaService } from "@/services/tiposTarea.service";
import { CreateTipoTareaRequest, UpdateTipoTareaRequest } from "@/types/tiposTarea.types";
import { showSuccessToast } from "@/utils/successHandler";
import { handleFormError } from "@/utils/errorHandler";
import { UseFormSetError } from "react-hook-form";

export function useTiposTarea() {
  const query = useQuery({
    queryKey: ["tiposTarea"],
    queryFn: tiposTareaService.getTiposTarea,
  });

  return {
    query,
  };
}

export function useTiposTareaMutations(
  onSuccessCallback?: () => void,
  setError?: UseFormSetError<any>,
  setDeleteError?: (err: string | null) => void
) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateTipoTareaRequest) => tiposTareaService.createTipoTarea(data),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ["tiposTarea"] });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      if (setError) {
        handleFormError(error, setError);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTipoTareaRequest }) =>
      tiposTareaService.updateTipoTarea(id, data),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ["tiposTarea"] });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      if (setError) {
        handleFormError(error, setError);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tiposTareaService.deleteTipoTarea(id),
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.invalidateQueries({ queryKey: ["tiposTarea"] });
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
