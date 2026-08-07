import { apiClient } from './api';
import { CrearInvitacionRequest, InvitacionResponse } from '../types/invitaciones.types';
import { AxiosError } from 'axios';
import { usuariosService } from './usuarios.service';

export const invitacionesService = {
  crearInvitacion: async (idFinca: number, data: CrearInvitacionRequest): Promise<InvitacionResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const existingUser = usuariosService._mockGetUsuarioFincaByEmail(idFinca, data.email_invitado);
      const isHardcodedLinked = data.email_invitado === 'activo@finca.com';
      const isHardcodedPending = data.email_invitado === 'pendiente@finca.com';

      if (isHardcodedLinked || (existingUser && existingUser.estado !== 'Pendiente')) {
        const err = new AxiosError('USER_ALREADY_LINKED');
        err.response = {
          data: {
            statusCode: 400,
            errorCode: 'ERR-01',
            message: 'Este usuario ya se encuentra vinculado a tu establecimiento.',
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        };
        return Promise.reject(err);
      }

      if (isHardcodedPending || (existingUser && existingUser.estado === 'Pendiente')) {
        const err = new AxiosError('PENDING_INVITATION_EXISTS');
        err.response = {
          data: {
            statusCode: 409,
            errorCode: 'PENDING_INVITATION_EXISTS',
            message: 'El usuario ya tiene una invitación pendiente para esta finca.',
            id_invitacion_finca: existingUser ? existingUser.id_usuario_finca : 999
          },
          status: 409,
          statusText: 'Conflict',
          headers: {},
          config: {} as any,
        };
        return Promise.reject(err);
      }

      // Add to mock array to reflect in UI
      usuariosService._mockAddUsuarioFinca(idFinca, {
        id_usuario: Math.floor(Math.random() * 10000) + 1000,
        id_usuario_finca: Math.floor(Math.random() * 10000) + 5000,
        nombre: "Usuario",
        apellido: "Invitado",
        email: data.email_invitado,
        telefono: "",
        estado: "Pendiente",
        rol: {
          id_rol: data.id_rol,
          nombre_rol: "Rol asignado" // Placeholder for mock
        }
      });

      return {
        message: 'Invitación enviada correctamente'
      };
    }
    const response = await apiClient.post<InvitacionResponse>(`/api/v1/fincas/${idFinca}/invitaciones`, data);
    return response.data;
  },

  reenviarInvitacion: async (idInvitacionFinca: number): Promise<InvitacionResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        message: 'Invitación reenviada correctamente.'
      };
    }
    const response = await apiClient.post<InvitacionResponse>(`/api/v1/invitaciones/${idInvitacionFinca}/reenviar`);
    return response.data;
  }
};
