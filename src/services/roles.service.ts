import { apiClient } from './api';
import {
  RolSistema, RolesSistemaResponse, CreateRolSistemaRequest, UpdateRolSistemaRequest,
  RolFinca, AsignarRolSistemaRequest, AsignarRolSistemaResponse, AsignarRolFincaRequest,
  AsignarRolFincaResponse, PermisosResponse, GuardarPermisosRequest, GuardarPermisosResponse, Permiso
} from '../types/roles.types';
import { AxiosError } from 'axios';
import { usuariosService } from './usuarios.service';

// ============================================================================
// MOCKS
// ============================================================================

const mockPermisosSistema: Permiso[] = [
  { id_permiso: 1, nombre_permiso: "Gestión de finca y parcelas" },
  { id_permiso: 2, nombre_permiso: "Planificación de cultivos" },
  { id_permiso: 3, nombre_permiso: "Gestión de tareas de campo" },
  { id_permiso: 4, nombre_permiso: "Registro de agroquímicos" },
  { id_permiso: 5, nombre_permiso: "Monitoreo climático e IoT" },
  { id_permiso: 6, nombre_permiso: "Control de costos" },
  { id_permiso: 7, nombre_permiso: "Gestión de usuarios de finca" },
];

const mockPermisosFinca: Permiso[] = [
  { id_permiso: 4, nombre_permiso: "Registro de agroquímicos" },
  { id_permiso: 6, nombre_permiso: "Control de costos" },
  { id_permiso: 7, nombre_permiso: "Gestión de usuarios de finca" },
];

let mockRolesPermisos: Record<number, number[]> = {
  // id_rol -> array of id_permiso
  1: [1, 2, 3, 4, 5, 6, 7], // Admin de finca (sistema)
  2: [7] // Agente soporte
};
let mockRoles: RolSistema[] = [
  {
    id_rol: 1,
    nombre_rol: "Administrador de Finca",
    descripcion: "Rol con acceso completo a la gestión de una finca",
    cantidad_usuarios_asignados: 12
  },
  {
    id_rol: 2,
    nombre_rol: "Agente de Soporte",
    descripcion: "Asistencia técnica a usuarios",
    cantidad_usuarios_asignados: 0
  }
];

let nextId = 3;

// ============================================================================
// SERVICES
// ============================================================================

export const rolesService = {
  /**
   * Obtiene la lista de roles del sistema.
   */
  getRolesSistema: async (): Promise<RolesSistemaResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const roles = mockRoles.map(r => ({
            ...r,
            permisos: mockRolesPermisos[r.id_rol] || []
          }));
          resolve({ roles });
        }, 300);
      });
    }
    const response = await apiClient.get<RolesSistemaResponse>('/roles/sistema');
    return response.data;
  },

  /**
   * Crea un nuevo rol del sistema.
   */
  createRolSistema: async (data: CreateRolSistemaRequest): Promise<{ message: string } & RolSistema> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (mockRoles.some(r => r.nombre_rol.toLowerCase() === data.nombre_rol.toLowerCase())) {
            const err = new AxiosError("El nombre ingresado ya existe");
            err.response = {
              data: {
                statusCode: 400,
                errorCode: "DUPLICATE_VALUE",
                message: "El nombre ingresado ya existe",
                field: "nombre_rol"
              },
              status: 400,
              statusText: "Bad Request",
              headers: {},
              config: {} as any
            };
            return reject(err);
          }
          
          const newRol: RolSistema = {
            id_rol: nextId++,
            nombre_rol: data.nombre_rol,
            descripcion: data.descripcion,
            cantidad_usuarios_asignados: 0
          };
          mockRoles.push(newRol);
          
          resolve({
            message: "Rol creado correctamente",
            ...newRol
          });
        }, 500);
      });
    }
    const response = await apiClient.post<{ message: string } & RolSistema>('/roles/sistema', data);
    return response.data;
  },

  /**
   * Actualiza un rol del sistema existente.
   */
  updateRolSistema: async (id_rol: number, data: UpdateRolSistemaRequest): Promise<{ message: string }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const rolIndex = mockRoles.findIndex(r => r.id_rol === id_rol);
          if (rolIndex === -1) {
            const err = new AxiosError("Rol no encontrado");
            err.response = {
              data: {
                statusCode: 404,
                errorCode: "RESOURCE_NOT_FOUND",
                message: "El rol no existe."
              },
              status: 404,
              statusText: "Not Found",
              headers: {},
              config: {} as any
            };
            return reject(err);
          }

          if (mockRoles.some(r => r.id_rol !== id_rol && r.nombre_rol.toLowerCase() === data.nombre_rol.toLowerCase())) {
            const err = new AxiosError("El nombre ingresado ya existe");
            err.response = {
              data: {
                statusCode: 400,
                errorCode: "DUPLICATE_VALUE",
                message: "El nombre ingresado ya existe",
                field: "nombre_rol"
              },
              status: 400,
              statusText: "Bad Request",
              headers: {},
              config: {} as any
            };
            return reject(err);
          }

          mockRoles[rolIndex] = {
            ...mockRoles[rolIndex],
            nombre_rol: data.nombre_rol,
            descripcion: data.descripcion
          };
          resolve({ message: "Rol actualizado correctamente" });
        }, 500);
      });
    }
    const response = await apiClient.put<{ message: string }>(`/roles/sistema/${id_rol}`, data);
    return response.data;
  },

  /**
   * Obtiene los permisos disponibles para el ámbito de sistema.
   */
  getPermisos: async (): Promise<PermisosResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ permisos: mockPermisosSistema });
        }, 300);
      });
    }
    const response = await apiClient.get<PermisosResponse>('/roles/permisos?ambito=sistema');
    return response.data;
  },

  /**
   * Asigna permisos a un rol de sistema.
   */
  asignarPermisosSistema: async (id_rol: number, data: GuardarPermisosRequest): Promise<GuardarPermisosResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (data.permisos.length === 0) {
            const err = new AxiosError("Sin permisos seleccionados");
            err.response = {
              data: {
                statusCode: 400,
                errorCode: "ERR-01",
                message: "Un rol debe contener al menos un permiso habilitado."
              },
              status: 400,
              statusText: "Bad Request",
              headers: {},
              config: {} as any
            };
            return reject(err);
          }
          mockRolesPermisos[id_rol] = [...data.permisos];
          resolve({ message: "Rol actualizado correctamente." });
        }, 500);
      });
    }
    const response = await apiClient.put<GuardarPermisosResponse>(`/roles/sistema/${id_rol}/permisos`, data);
    return response.data;
  },

  /**
   * Da de baja lógica un rol del sistema.
   */
  deleteRolSistema: async (id_rol: number): Promise<{ message: string, id_rol: number }> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const rol = mockRoles.find(r => r.id_rol === id_rol);
          if (!rol) {
            const err = new AxiosError("Rol no encontrado");
            err.response = {
              data: {
                statusCode: 404,
                errorCode: "RESOURCE_NOT_FOUND",
                message: "El rol no existe."
              },
              status: 404,
              statusText: "Not Found",
              headers: {},
              config: {} as any
            };
            return reject(err);
          }

          mockRoles = mockRoles.filter(r => r.id_rol !== id_rol);
          
          let message = "Rol dado de baja correctamente";
          if (rol.cantidad_usuarios_asignados > 0) {
            message = "Rol dado de baja correctamente. Los usuarios afectados quedaron sin rol asignado.";
          }

          resolve({ message, id_rol });
        }, 500);
      });
    }
    const response = await apiClient.delete<{ message: string, id_rol: number }>(`/roles/sistema/${id_rol}`);
    return response.data;
  },

  /**
   * Asigna o actualiza el rol de sistema de un usuario.
   */
  asignarRolSistema: async (id_usuario: number, data: AsignarRolSistemaRequest): Promise<AsignarRolSistemaResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulamos ERR-05 si id_usuario es 999 (usuario no existe)
          if (id_usuario === 999) {
            const err = new AxiosError("Usuario no encontrado");
            err.response = {
              data: {
                statusCode: 404,
                errorCode: "RESOURCE_NOT_FOUND",
                message: "El usuario no existe."
              },
              status: 404,
              statusText: "Not Found",
              headers: {},
              config: {} as any
            };
            return reject(err);
          }

          const rol = mockRoles.find(r => r.id_rol === data.id_rol);
          if (!rol) {
            // Simulamos ERR-01: Rol no disponible (porque fue dado de baja)
            const err = new AxiosError("Rol no disponible");
            err.response = {
              data: {
                statusCode: 400, // asumiendo 400 para ERR-01 o podría ser 404/409, el msj es el clave
                errorCode: "ERR-01",
                message: "El rol seleccionado no se encuentra disponible. Actualizá la lista e intentá nuevamente."
              },
              status: 400,
              statusText: "Bad Request",
              headers: {},
              config: {} as any
            };
            return reject(err);
          }

          // Actualizamos el rol del mock de usuarios (en usuariosService)
          usuariosService._mockUpdateRol(id_usuario, { id_rol: rol.id_rol, nombre_rol: rol.nombre_rol });

          resolve({
            message: "Rol de sistema asignado correctamente.",
            id_usuario,
            id_rol: rol.id_rol,
            nombre_rol: rol.nombre_rol
          });
        }, 500);
      });
    }
    const response = await apiClient.put<AsignarRolSistemaResponse>(`/usuarios/${id_usuario}/rol-sistema`, data);
    return response.data;
  }
};

let mockFincaRoles: Record<number, RolFinca[]> = {
  12: [ // id_finca = 12 según auth mock
    {
      id_rol: 1,
      nombre_rol: "Encargado de Riego",
      descripcion: "Personal encargado del sistema de riego",
      cantidad_usuarios_asignados: 3
    },
    {
      id_rol: 2,
      nombre_rol: "Cosechador",
      descripcion: "Personal temporal para época de cosecha",
      cantidad_usuarios_asignados: 0
    }
  ]
};
let nextFincaRolId = 3;

export const rolesFincaService = {
  getRoles: async (id_finca: number) => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const rawRoles = mockFincaRoles[id_finca] || [];
          const roles = rawRoles.map(r => ({
            ...r,
            permisos: mockRolesPermisos[r.id_rol] || []
          }));
          resolve({ roles });
        }, 300);
      });
    }
    const response = await apiClient.get(`/fincas/${id_finca}/roles`);
    return response.data;
  },

  createRol: async (id_finca: number, data: any) => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!mockFincaRoles[id_finca]) {
            mockFincaRoles[id_finca] = [];
          }
          
          if (mockFincaRoles[id_finca].some(r => r.nombre_rol.toLowerCase() === data.nombre_rol.toLowerCase())) {
            const err = new AxiosError("Ya existe un rol con este nombre en su finca");
            err.response = {
              data: {
                statusCode: 400,
                errorCode: "DUPLICATE_VALUE",
                message: "Ya existe un rol con este nombre en su finca",
                field: "nombre_rol"
              },
              status: 400,
              statusText: "Bad Request",
              headers: {},
              config: {} as any
            };
            return reject(err);
          }
          
          const newRol: RolFinca = {
            id_rol: nextFincaRolId++,
            nombre_rol: data.nombre_rol,
            descripcion: data.descripcion,
            cantidad_usuarios_asignados: 0
          };
          mockFincaRoles[id_finca].push(newRol);
          
          resolve({
            message: "Rol creado correctamente",
            ...newRol
          });
        }, 500);
      });
    }
    const response = await apiClient.post(`/fincas/${id_finca}/roles`, data);
    return response.data;
  },

  updateRol: async (id_finca: number, id_rol: number, data: any) => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const fincaRoles = mockFincaRoles[id_finca] || [];
          const rolIndex = fincaRoles.findIndex(r => r.id_rol === id_rol);
          if (rolIndex === -1) {
            const err = new AxiosError("Rol no encontrado");
            err.response = {
              data: {
                statusCode: 404,
                errorCode: "RESOURCE_NOT_FOUND",
                message: "El rol no existe."
              },
              status: 404,
              statusText: "Not Found",
              headers: {},
              config: {} as any
            };
            return reject(err);
          }

          if (fincaRoles.some(r => r.id_rol !== id_rol && r.nombre_rol.toLowerCase() === data.nombre_rol.toLowerCase())) {
            const err = new AxiosError("Ya existe un rol con este nombre en su finca");
            err.response = {
              data: {
                statusCode: 400,
                errorCode: "DUPLICATE_VALUE",
                message: "Ya existe un rol con este nombre en su finca",
                field: "nombre_rol"
              },
              status: 400,
              statusText: "Bad Request",
              headers: {},
              config: {} as any
            };
            return reject(err);
          }

          fincaRoles[rolIndex] = {
            ...fincaRoles[rolIndex],
            nombre_rol: data.nombre_rol,
            descripcion: data.descripcion
          };
          resolve({ message: "Rol actualizado correctamente" });
        }, 500);
      });
    }
    const response = await apiClient.put(`/fincas/${id_finca}/roles/${id_rol}`, data);
    return response.data;
  },

  /**
   * Obtiene los permisos disponibles para el ámbito de finca.
   */
  getPermisos: async (): Promise<PermisosResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ permisos: mockPermisosFinca });
        }, 300);
      });
    }
    const response = await apiClient.get<PermisosResponse>('/roles/permisos?ambito=finca');
    return response.data;
  },

  /**
   * Asigna permisos a un rol de finca.
   */
  asignarPermisosFinca: async (id_finca: number, id_rol: number, data: GuardarPermisosRequest): Promise<GuardarPermisosResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (data.permisos.length === 0) {
            const err = new AxiosError("Sin permisos seleccionados");
            err.response = {
              data: {
                statusCode: 400,
                errorCode: "ERR-01",
                message: "Un rol debe contener al menos un permiso habilitado."
              },
              status: 400,
              statusText: "Bad Request",
              headers: {},
              config: {} as any
            };
            return reject(err);
          }
          mockRolesPermisos[id_rol] = [...data.permisos];
          resolve({ message: "Rol actualizado correctamente." });
        }, 500);
      });
    }
    const response = await apiClient.put<GuardarPermisosResponse>(`/fincas/${id_finca}/roles/${id_rol}/permisos`, data);
    return response.data;
  },

  deleteRol: async (id_finca: number, id_rol: number) => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const fincaRoles = mockFincaRoles[id_finca] || [];
          const rol = fincaRoles.find(r => r.id_rol === id_rol);
          
          if (!rol) {
            const err = new AxiosError("Rol no encontrado");
            err.response = {
              data: {
                statusCode: 404,
                errorCode: "RESOURCE_NOT_FOUND",
                message: "El rol no existe."
              },
              status: 404,
              statusText: "Not Found",
              headers: {},
              config: {} as any
            };
            return reject(err);
          }

          if (rol.cantidad_usuarios_asignados > 0) {
            const err = new AxiosError("Rol en uso");
            err.response = {
              data: {
                statusCode: 409,
                errorCode: "RESOURCE_IN_USE",
                message: "No puede eliminar un rol que está asignado a usuarios activos. Reasigne a los trabajadores antes de continuar."
              },
              status: 409,
              statusText: "Conflict",
              headers: {},
              config: {} as any
            };
            return reject(err);
          }

          mockFincaRoles[id_finca] = fincaRoles.filter(r => r.id_rol !== id_rol);
          
          resolve({ message: "Rol dado de baja correctamente", id_rol });
        }, 500);
      });
    }
    const response = await apiClient.delete(`/fincas/${id_finca}/roles/${id_rol}`);
    return response.data;
  },

  /**
   * Asigna o actualiza el rol de un usuario dentro de una finca.
   */
  asignarRol: async (id_finca: number, id_usuario_finca: number, data: AsignarRolFincaRequest): Promise<AsignarRolFincaResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const fincaRoles = mockFincaRoles[id_finca] || [];
          const rol = fincaRoles.find(r => r.id_rol === data.id_rol);
          
          if (!rol) {
            // Simulamos ERR-01: Rol no disponible
            const err = new AxiosError("Rol no disponible");
            err.response = {
              data: {
                statusCode: 400,
                errorCode: "ERR-01",
                message: "El rol seleccionado no se encuentra disponible. Actualizá la lista e intentá nuevamente."
              },
              status: 400,
              statusText: "Bad Request",
              headers: {},
              config: {} as any
            };
            return reject(err);
          }

          // Actualizamos el rol del mock de usuarios de la finca
          usuariosService._mockUpdateRolFinca(id_finca, id_usuario_finca, { id_rol: rol.id_rol, nombre_rol: rol.nombre_rol });

          resolve({
            message: "Rol asignado correctamente.",
            id_usuario_finca,
            id_rol: rol.id_rol,
            nombre_rol: rol.nombre_rol
          });
        }, 500);
      });
    }
    const response = await apiClient.put<AsignarRolFincaResponse>(`/fincas/${id_finca}/usuarios/${id_usuario_finca}/rol`, data);
    return response.data;
  }
};

