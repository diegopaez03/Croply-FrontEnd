import * as z from 'zod';

export const preguntaFrecuenteSchema = z.object({
  pregunta: z
    .string()
    .trim()
    .min(1, 'La pregunta es obligatoria.')
    .max(255, 'La pregunta no puede superar los 255 caracteres.'),
  respuesta: z
    .string()
    .trim()
    .min(1, 'La respuesta es obligatoria.')
    .max(2000, 'La respuesta no puede superar los 2000 caracteres.'),
});

export type PreguntaFrecuenteFormValues = z.infer<typeof preguntaFrecuenteSchema>;

export interface PreguntaFrecuente {
  id_pregunta_frecuente: number;
  pregunta: string;
  respuesta: string;
}

export interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ListarPreguntasFrecuentesGestionRequest {
  page?: number;
  pageSize?: number;
}

export interface ListarPreguntasFrecuentesGestionResponse {
  preguntas_frecuentes: PreguntaFrecuente[];
  pagination: PaginationMetadata;
}

export interface ConsultarPreguntasFrecuentesResponse {
  preguntas_frecuentes: PreguntaFrecuente[];
}

export interface CrearPreguntaFrecuenteRequest {
  pregunta: string;
  respuesta: string;
}

export interface CrearPreguntaFrecuenteResponse {
  message: string;
  id_pregunta_frecuente: number;
  pregunta: string;
  respuesta: string;
}

export interface EditarPreguntaFrecuenteRequest {
  pregunta: string;
  respuesta: string;
}

export interface EditarPreguntaFrecuenteResponse {
  message: string;
  id_pregunta_frecuente: number;
  pregunta: string;
  respuesta: string;
}

export interface EliminarPreguntaFrecuenteResponse {
  message: string;
  id_pregunta_frecuente: number;
}

export interface ConfiguracionSoporteResponse {
  manual_usuario_url: string | null;
  email_soporte: string | null;
}
