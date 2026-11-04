import { UseFormSetError } from "react-hook-form";
import { toast } from "@/components/ui/sonner";
import axios, { AxiosError } from "axios";

export interface ApiErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string;
  field?: string;
  id_variedad?: number;
}

export interface ErrorHandlerOptions {
  /** Función a ejecutar si el recurso no existe (ERR-05), útil para redirigir en carga inicial (GET) */
  onNotFoundRedirect?: () => void;
  /** HU-BC-02 ERR-07: resaltar la variedad conflictiva */
  onVarietyAlreadyAssigned?: (id_variedad?: number) => void;
}

/**
 * Determina si un error corresponde a una falla de red, timeout o servidor no disponible
 * (error de Axios sin respuesta HTTP).
 */
export function isNetworkOrTimeoutError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error) && !error.response;
}

/**
 * Procesa los errores de la API (Axios) y los mapea al formulario o muestra un toast global.
 * @param error El error capturado (generalmente de axios)
 * @param setError Función de react-hook-form para setear errores en campos específicos
 * @param options Opciones adicionales para casos específicos como redirecciones
 */
export const handleFormError = (
  error: unknown,
  setError?: UseFormSetError<any>,
  options?: ErrorHandlerOptions
) => {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data as ApiErrorResponse;

    // Errores transversales que afectan campos (ERR-01, ERR-02 u otros específicos con field)
    if (data.field && setError) {
      setError(data.field, {
        type: "server",
        message: data.message,
      });
      return;
    }

    // ERR-06 — Cronograma vacío
    if (data.errorCode === "EMPTY_SCHEDULE") {
      if (setError) {
        setError("hitos", { type: "server", message: data.message });
      }
      toast.error(data.message || "La plantilla debe tener al menos un hito con una tarea para poder guardarse.");
      return;
    }

    // ERR-07 — Variedad ya cubierta por otra plantilla específica
    if (data.errorCode === "VARIETY_ALREADY_ASSIGNED") {
      if (setError) {
        setError("cultivos", { type: "server", message: data.message });
      }
      toast.error(data.message || "Esta variedad ya tiene una plantilla específica asignada.");
      if (options?.onVarietyAlreadyAssigned) {
        options.onVarietyAlreadyAssigned(data.id_variedad);
      }
      return;
    }

    if (data.errorCode === "TASK_NOT_EDITABLE") {
      toast.error(data.message || "No se puede modificar una tarea que ya fue completada.");
      return;
    }

    if (
      data.errorCode === "INVALID_STATUS_TRANSITION" ||
      data.errorCode === "TASKS_NOT_COMPLETED"
    ) {
      toast.error(data.message || "No se puede actualizar el estado.");
      return;
    }

    // ERR-04 — Recurso en uso (409)
    if (data.errorCode === "RESOURCE_IN_USE" || data.statusCode === 409) {
      toast.error(data.message || "No se puede eliminar el recurso porque está en uso.");
      return;
    }

    // ERR-05 — Recurso no encontrado (404)
    if (data.errorCode === "RESOURCE_NOT_FOUND" || data.statusCode === 404) {
      toast.error(data.message || "El recurso solicitado no existe o ya fue eliminado.");
      if (options?.onNotFoundRedirect) {
        options.onNotFoundRedirect();
      }
      return;
    }

    toast.error(data.message || "Ha ocurrido un error inesperado.");
  } else {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      toast.error("Sin conexión a internet. Verificá tu red e intentá nuevamente.");
      return;
    }

    if (
      isNetworkOrTimeoutError(error) &&
      (error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT" ||
        error.message?.toLowerCase().includes("timeout"))
    ) {
      toast.error(
        "Tiempo de espera agotado. El servidor tardó demasiado en responder, por favor intentá nuevamente."
      );
      return;
    }

    if (isNetworkOrTimeoutError(error)) {
      toast.error(
        "No se pudo conectar con el servidor. Revisá tu conexión o intentá nuevamente más tarde."
      );
      return;
    }

    toast.error("Ha ocurrido un error inesperado.");
  }
};
