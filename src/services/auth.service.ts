import { apiClient } from './api';
import { LoginRequest, LoginResponse } from '../types/auth.types';
import { AxiosError } from 'axios';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      // Simulamos latencia de red
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Lógica de mocks según HU
      if (data.email === 'error@finca.com') {
        // Simulamos error 500 genérico
        const err = new AxiosError('Unexpected Error');
        err.response = {
          data: {
            statusCode: 500,
            errorCode: 'UNEXPECTED_ERROR',
            message: 'Ha ocurrido un error, intente nuevamente',
          },
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
        };
        return Promise.reject(err);
      }

      if (data.email === 'inactivo@finca.com') {
        // Simulamos cuenta inactiva (ERR-02 de HU-AC-01)
        const err = new AxiosError('Account Not Active');
        err.response = {
          data: {
            statusCode: 403,
            errorCode: 'ACCOUNT_NOT_ACTIVE',
            message: 'Tu cuenta no se encuentra activa. Contactá al administrador.',
          },
          status: 403,
          statusText: 'Forbidden',
          headers: {},
          config: {} as any,
        };
        return Promise.reject(err);
      }

      const validUsers: Record<string, string> = {
        'usuario@finca.com': 'Password123!',
        'primeracceso@finca.com': 'Password123!',
        'admin@croply.app': 'MockAdmin123!'
      };

      if (!validUsers[data.email] || validUsers[data.email] !== data.contrasena) {
        // Simulamos credenciales inválidas (ERR-01 de HU-AC-01)
        const err = new AxiosError('Invalid Credentials');
        err.response = {
          data: {
            statusCode: 401,
            errorCode: 'INVALID_CREDENTIALS',
            message: 'Correo electrónico o contraseña incorrectos',
          },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config: {} as any,
        };
        return Promise.reject(err);
      }

      // Login exitoso mock — payload alineado con AuthJwtPayload del backend
      const debeCambiar = data.email === 'primeracceso@finca.com';
      let mockUsuario: LoginResponse['usuario'];

      if (data.email === 'admin@croply.app') {
        mockUsuario = {
          id_usuario: 1,
          email: data.email,
          nombre: 'Super',
          apellido: 'Admin',
          estado: 'Activo',
          fecha_alta: '2026-03-15T10:00:00Z',
          rol_sistema: 'ADMIN_CROPLY',
          fincas: [],
        };
      } else {
        mockUsuario = {
          id_usuario: debeCambiar ? 46 : 45,
          email: data.email,
          nombre: 'Juan',
          apellido: 'Pérez',
          estado: 'Activo',
          fecha_alta: '2026-03-15T10:00:00Z',
          rol_sistema: null,
          fincas: [
            { id_finca: 12, nombre_finca: 'La Esperanza', rol_finca: 'ADMIN_FINCA' },
          ],
        };
      }

      const mockPayload = {
        sub: mockUsuario.id_usuario,
        email: mockUsuario.email,
        debe_cambiar_contrasena: debeCambiar,
        rol_sistema: mockUsuario.rol_sistema,
        token_version: 0,
        nombre: mockUsuario.nombre,
        apellido: mockUsuario.apellido,
        estado: mockUsuario.estado,
        fecha_alta: mockUsuario.fecha_alta,
        fincas: mockUsuario.fincas,
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const b64Payload = btoa(unescape(encodeURIComponent(JSON.stringify(mockPayload))));
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${b64Payload}.mocksignature`;

      const mockResponse: LoginResponse = {
        accessToken: mockToken,
        expiresIn: 3600,
        debe_cambiar_contrasena: debeCambiar,
        usuario: mockUsuario,
      };

      return mockResponse;
    }

    // Llamada real al backend
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  registrarAdminFinca: async (data: import('../types/auth.types').RegisterAdminFincaRequest): Promise<import('../types/auth.types').RegisterAdminFincaResponse> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (data.email === 'duplicado@finca.com') {
        const err = new AxiosError('Duplicate Value');
        err.response = {
          data: {
            statusCode: 409,
            errorCode: 'DUPLICATE_VALUE',
            field: 'email',
            message: 'El valor ingresado ya existe',
          },
          status: 409,
          statusText: 'Conflict',
          headers: {},
          config: {} as any,
        };
        return Promise.reject(err);
      }

      // Registro exitoso mock
      const id_usuario = Math.floor(Math.random() * 1000) + 100;

      const mockResponse: import('../types/auth.types').RegisterAdminFincaResponse = {
        message: "Usuario registrado correctamente",
        id_usuario,
        email: data.email,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        estado: data.estado,
        id_rol: data.id_rol,
        fecha_alta: new Date().toISOString(),
        fecha_baja: null
      };

      import('./usuarios.service').then(({ usuariosService }) => {
        // En una app real, el rol se asocia con un nombre, pero por ahora simulamos que no tiene o que es ID 1 (Admin de Sistema)
        usuariosService._mockAddUsuario({
          id_usuario,
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          telefono: data.telefono,
          estado: data.estado,
          // Para que no se rompa la tabla, le agregamos el rol si lo mandó.
          // En los mocks actuales de roles, 1 es Admin de Finca. Si no viene rol, le ponemos null.
          rol: data.id_rol ? { id_rol: data.id_rol, nombre_rol: "Administrador de Finca" } : null
        });
      });
      
      return mockResponse;
    }

    const response = await apiClient.post<import('../types/auth.types').RegisterAdminFincaResponse>('/auth/registrar-admin-finca', data);
    return response.data;
  },

  validarInvitacion: async (token: string): Promise<import('../types/auth.types').ValidarInvitacionResponse> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (token === 'usado') {
        const err = new AxiosError('Invitation Already Used');
        err.response = {
          data: {
            statusCode: 410,
            errorCode: 'INVITATION_ALREADY_USED',
            message: 'Este enlace de invitación ya fue utilizado. Contactá al administrador.',
          },
          status: 410,
          statusText: 'Gone',
          headers: {},
          config: {} as any,
        };
        return Promise.reject(err);
      }

      if (token === 'expirado') {
        const err = new AxiosError('Invitation Expired');
        err.response = {
          data: {
            statusCode: 410,
            errorCode: 'INVITATION_EXPIRED',
            message: 'Este enlace de invitación no es válido o ha expirado. Contactá al administrador.',
          },
          status: 410,
          statusText: 'Gone',
          headers: {},
          config: {} as any,
        };
        return Promise.reject(err);
      }

      // Valid token mock
      return {
        valido: true,
        email_invitado: 'invitado@finca.com',
        id_invitacion_finca: 123
      };
    }

    const response = await apiClient.get<import('../types/auth.types').ValidarInvitacionResponse>(`/auth/validar-invitacion/${token}`);
    return response.data;
  },

  registrarInvitado: async (data: import('../types/auth.types').RegistrarInvitadoRequest): Promise<import('../types/auth.types').RegistrarInvitadoResponse> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock success response
      return {
        message: 'Registro completado exitosamente',
        usuario: {
          id_usuario: 99,
          email: 'invitado@finca.com',
          nombre: data.nombre,
          apellido: data.apellido,
          estado: 'Activo',
          fecha_alta: new Date().toISOString()
        }
      };
    }

    const response = await apiClient.post<import('../types/auth.types').RegistrarInvitadoResponse>('/auth/registrar-invitado', data);
    return response.data;
  },

  olvideMiContrasena: async (data: import('../types/auth.types').OlvideContrasenaRequest): Promise<import('../types/auth.types').OlvideContrasenaResponse> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      return {
        message: 'Si el correo ingresado está registrado, recibirás un enlace para restablecer tu contraseña.'
      };
    }

    const response = await apiClient.post<import('../types/auth.types').OlvideContrasenaResponse>('/auth/olvide-mi-contrasena', data);
    return response.data;
  },

  resetearContrasena: async (data: import('../types/auth.types').ResetearContrasenaRequest): Promise<import('../types/auth.types').ResetearContrasenaResponse> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (data.token_hash === 'mismatch') {
        const err = new AxiosError('Password Mismatch');
        err.response = {
          data: {
            statusCode: 400,
            errorCode: 'PASSWORD_MISMATCH',
            message: 'Las contraseñas no coinciden.',
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        };
        return Promise.reject(err);
      }

      if (data.token_hash === 'expirado') {
        const err = new AxiosError('Token Expired');
        err.response = {
          data: {
            statusCode: 410,
            errorCode: 'TOKEN_EXPIRED',
            message: 'Este enlace de recuperación no es válido o ha expirado. Solicitá uno nuevo.',
          },
          status: 410,
          statusText: 'Gone',
          headers: {},
          config: {} as any,
        };
        return Promise.reject(err);
      }

      return {
        success: true,
        message: 'Tu contraseña fue restablecida correctamente. Podés iniciar sesión.'
      };
    }

    const response = await apiClient.post<import('../types/auth.types').ResetearContrasenaResponse>('/auth/resetear-contrasena', data);
    return response.data;
  },

  cambioContrasena: async (data: import('../types/auth.types').CambioContrasenaRequest): Promise<import('../types/auth.types').CambioContrasenaResponse> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (data.contrasena_actual === 'incorrecta') {
        const err = new AxiosError('Current Password Incorrect');
        err.response = {
          data: {
            statusCode: 400,
            errorCode: 'CURRENT_PASSWORD_INCORRECT',
            message: 'La contraseña actual es incorrecta',
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        };
        return Promise.reject(err);
      }

      if (data.contrasena_actual === 'mismatch') {
        const err = new AxiosError('Password Mismatch');
        err.response = {
          data: {
            statusCode: 400,
            errorCode: 'PASSWORD_MISMATCH',
            message: 'Las contraseñas no coinciden',
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        };
        return Promise.reject(err);
      }

      return {
        message: 'Tu contraseña fue actualizada correctamente.'
      };
    }

    const response = await apiClient.put<import('../types/auth.types').CambioContrasenaResponse>('/auth/cambio-contrasena', data);
    return response.data;
  },

  contrasenaPrimerAcceso: async (data: import('../types/auth.types').ContrasenaPrimerAccesoRequest): Promise<import('../types/auth.types').ContrasenaPrimerAccesoResponse> => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      return {
        message: 'Contraseña actualizada correctamente.'
      };
    }

    const response = await apiClient.put<import('../types/auth.types').ContrasenaPrimerAccesoResponse>('/auth/contrasena-primer-acceso', data);
    return response.data;
  }
};

