export interface SolicitudDigitalizacionRequest {
  nombre_completo: string;
  correo_electronico: string;
  telefono_contacto: string;
  provincia: string;
  departamento: string;
  localidad: string;
  numero_parcelas: number;
  superficie_total_hectareas: number;
  comentario_adicional?: string;
}

export interface SolicitudDigitalizacionResponse {
  message: string;
  id_solicitud_df: number;
  nombre_completo: string;
  correo_electronico: string;
  estado: string;
  fecha_solicitud: string;
}
