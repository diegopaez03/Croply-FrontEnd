import { apiClient } from './api';
import { AxiosError } from 'axios';
import { SolicitudDigitalizacionRequest, SolicitudDigitalizacionResponse } from '../types/solicitudes.types';

export const solicitudesService = {
  solicitarDigitalizacion: async (data: SolicitudDigitalizacionRequest): Promise<SolicitudDigitalizacionResponse> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Simulamos error de negocio (ej. validación fallida por algún motivo exótico, o 500)
      if (data.correo_electronico === 'error@finca.com') {
        const err = new AxiosError('Unexpected Error');
        err.response = {
          data: {
            statusCode: 500,
            errorCode: 'UNEXPECTED_ERROR',
            message: 'Ha ocurrido un error al procesar su solicitud, intente nuevamente',
          },
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
        };
        return Promise.reject(err);
      }

      // Respuesta de éxito (201 Created mock)
      return {
        message: '¡Solicitud enviada con éxito! Nuestro equipo se pondrá en contacto a la brevedad.',
        id_solicitud_df: Math.floor(Math.random() * 1000) + 1,
        nombre_completo: data.nombre_completo,
        correo_electronico: data.correo_electronico,
        estado: 'Pendiente',
        fecha_solicitud: new Date().toISOString(),
      };
    }

    const response = await apiClient.post<SolicitudDigitalizacionResponse>('/solicitudes-digitalizacion', data);
    return response.data;
  }
};
