import { UseFormSetError } from "react-hook-form";
import { toast } from "@/components/ui/sonner";
import axios from "axios";

export interface ApiErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string;
  field?: string;
}

export interface ErrorHandlerOptions {
  /** Función a ejecutar si el recurso no existe (ERR-05), útil para redirigir en carga inicial (GET) */
  onNotFoundRedirect?: () => void;
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

    // Cualquier otro error del servidor (401, 403, 500)
    console.log('DEBUG → llegando al toast', data.message);
    toast.error(data.message || "Ha ocurrido un error inesperado.");
  } else {
    // Errores de red o sin respuesta del servidor
    toast.error("Error de conexión. Verifique su internet e intente nuevamente.");
  }
};
