import { UseFormSetError } from "react-hook-form";
import { toast } from "@/components/ui/sonner";
import axios from "axios";

export interface ApiErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string;
  field?: string;
}

/**
 * Procesa los errores de la API (Axios) y los mapea al formulario o muestra un toast global.
 * @param error El error capturado (generalmente de axios)
 * @param setError Función de react-hook-form para setear errores en campos específicos
 */
export const handleFormError = (
  error: unknown,
  setError?: UseFormSetError<any>
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

    // Cualquier otro error del servidor (401, 403, 500)
    console.log('DEBUG → llegando al toast', data.message);
    toast.error(data.message || "Ha ocurrido un error inesperado.");
  } else {
    // Errores de red o sin respuesta del servidor
    toast.error("Error de conexión. Verifique su internet e intente nuevamente.");
  }
};
