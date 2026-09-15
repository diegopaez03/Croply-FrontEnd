import { toast } from "@/components/ui/sonner";

export interface ApiSuccessResponse {
  message?: string;
  [key: string]: any;
}

/**
 * Procesa las respuestas exitosas de la API y muestra un toast con el mensaje proporcionado.
 * Según el contrato, todas las respuestas exitosas que disparan una acción visual
 * incluyen un campo `message` de nivel superior.
 * 
 * @param response Data de la respuesta de la API
 * @param fallbackMessage Mensaje por defecto en caso de que la API no devuelva uno
 */
export const showSuccessToast = (
  response: ApiSuccessResponse | any,
  fallbackMessage: string = "Operación completada con éxito."
) => {
  const message = response?.message || fallbackMessage;
  toast.success(message);
};
