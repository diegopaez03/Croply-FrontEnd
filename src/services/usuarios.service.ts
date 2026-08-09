import { apiClient } from './api';
import { AxiosError } from 'axios';
import {
  ActualizarEstadoRequest, ActualizarEstadoResponse,
  ActualizarPerfilRequest, ActualizarPerfilResponse,
  GetUsuariosRequest, GetUsuariosResponse,
  UsuarioListado, PerfilResponse
} from '../types/usuarios.types';

// ============================================================================
// MOCKS
// ============================================================================

const mockUsuariosCroply: UsuarioListado[] = [
  { id_usuario: 1, nombre: "María Eugenia", apellido: "Lopez", email: "m.lopez@estancia-sol.cl", telefono: "+54 114555-0123", rol: { id_rol: 1, nombre_rol: "Administrador de Sistema" }, estado: "Activo" },
  { id_usuario: 2, nombre: "Roberto", apellido: "Sanchez", email: "rsanchez@campo-verde.ar", telefono: "+54 114555-0123", rol: { id_rol: 1, nombre_rol: "Administrador de Sistema" }, estado: "Inactivo" },
  { id_usuario: 3, nombre: "Lucía", apellido: "Fernández", email: "lfernandez@pampa.com.ar", telefono: "+54 119988-7766", rol: { id_rol: 1, nombre_rol: "Administrador de Sistema" }, estado: "Activo" },
  { id_usuario: 4, nombre: "Carlos", apellido: "Mendoza", email: "c.mendoza@agroterra.com", telefono: "+54 114555-0123", rol: null, estado: "Pendiente" },
  { id_usuario: 5, nombre: "Juan", apellido: "Perez", email: "jperez@test.com", telefono: "+54 112233-4455", rol: { id_rol: 2, nombre_rol: "Agente de Soporte" }, estado: "Activo" },
  { id_usuario: 6, nombre: "Ana", apellido: "García", email: "agarcia@test.com", telefono: "+54 113344-5566", rol: { id_rol: 1, nombre_rol: "Administrador de Sistema" }, estado: "Inactivo" },
  { id_usuario: 7, nombre: "Luis", apellido: "Martinez", email: "lmartinez@test.com", telefono: "+54 114455-6677", rol: { id_rol: 2, nombre_rol: "Agente de Soporte" }, estado: "Activo" },
  { id_usuario: 8, nombre: "Sofía", apellido: "Rodriguez", email: "srodriguez@test.com", telefono: "+54 115566-7788", rol: { id_rol: 1, nombre_rol: "Administrador de Sistema" }, estado: "Pendiente" },
  { id_usuario: 9, nombre: "Pedro", apellido: "Gomez", email: "pgomez@test.com", telefono: "+54 116677-8899", rol: { id_rol: 1, nombre_rol: "Administrador de Sistema" }, estado: "Activo" },
  { id_usuario: 10, nombre: "Laura", apellido: "Diaz", email: "ldiaz@test.com", telefono: "+54 117788-9900", rol: { id_rol: 1, nombre_rol: "Administrador de Sistema" }, estado: "Activo" },
  { id_usuario: 11, nombre: "Diego", apellido: "Alvarez", email: "dalvarez@test.com", telefono: "+54 118899-0011", rol: { id_rol: 2, nombre_rol: "Agente de Soporte" }, estado: "Inactivo" },
  { id_usuario: 12, nombre: "Carmen", apellido: "Romero", email: "cromero@test.com", telefono: "+54 119900-1122", rol: { id_rol: 1, nombre_rol: "Administrador de Sistema" }, estado: "Activo" }
];

const mockUsuariosFincas: Record<number, UsuarioListado[]> = {
  12: [
    { id_usuario: 101, id_usuario_finca: 1001, nombre: "José", apellido: "García", email: "jgarcia@finca.com", telefono: "+54 223344-5566", rol: { id_rol: 1, nombre_rol: "Encargado de Riego" }, estado: "Activo" },
    { id_usuario: 102, id_usuario_finca: 1002, nombre: "Marta", apellido: "Lopez", email: "mlopez@finca.com", telefono: "+54 224455-6677", rol: { id_rol: 1, nombre_rol: "Encargado de Riego" }, estado: "Activo" },
    { id_usuario: 103, id_usuario_finca: 1003, nombre: "Jorge", apellido: "Fernandez", email: "jfernandez@finca.com", telefono: "+54 225566-7788", rol: { id_rol: 1, nombre_rol: "Encargado de Riego" }, estado: "Inactivo" },
    { id_usuario: 104, id_usuario_finca: 1004, nombre: "Esteban", apellido: "Quito", email: "equito@finca.com", telefono: "+54 226677-8899", rol: { id_rol: 2, nombre_rol: "Cosechador" }, estado: "Pendiente" },
    { id_usuario: 105, id_usuario_finca: 1005, nombre: "Maria", apellido: "Gomez", email: "mgomez@finca.com", telefono: "+54 227788-9900", rol: { id_rol: 2, nombre_rol: "Cosechador" }, estado: "Activo" }
  ]
};

function filterAndPaginate(data: UsuarioListado[], params: GetUsuariosRequest): GetUsuariosResponse {
  let filtered = [...data];

  // Filtro de búsqueda (nombre, apellido, email)
  if (params.search && params.search.trim() !== '') {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(u => 
      u.nombre.toLowerCase().includes(s) || 
      u.apellido.toLowerCase().includes(s) || 
      u.email.toLowerCase().includes(s)
    );
  }

  // Filtro por Rol
  if (params.id_rol && params.id_rol !== 'todos' && params.id_rol !== '') {
    filtered = filtered.filter(u => u.rol && String(u.rol.id_rol) === String(params.id_rol));
  }

  // Filtro por Estado
  if (params.estado && params.estado !== 'todos' && params.estado !== '') {
    filtered = filtered.filter(u => u.estado.toLowerCase() === params.estado?.toLowerCase());
  }

  const totalItems = filtered.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const totalPages = Math.ceil(totalItems / pageSize);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = filtered.slice(start, end);

  return {
    usuarios: paginatedData,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages
    }
  };
}

// ============================================================================
// SERVICES
// ============================================================================

/**
 * El backend valida `id_rol` como entero y `estado` como enum, así que los
 * valores centinela de la UI ("todos", "") no pueden viajar en la query.
 */
function limpiarFiltros(params: GetUsuariosRequest): GetUsuariosRequest {
  const limpio: GetUsuariosRequest = {};
  for (const [clave, valor] of Object.entries(params)) {
    if (valor === undefined || valor === null || valor === '' || valor === 'todos') {
      continue;
    }
    limpio[clave as keyof GetUsuariosRequest] = valor as never;
  }
  return limpio;
}

export const usuariosService = {
  /**
   * Obtiene la lista paginada de usuarios de Croply (Administradores de Sistema).
   */
  getUsuariosCroply: async (params: GetUsuariosRequest): Promise<GetUsuariosResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(filterAndPaginate(mockUsuariosCroply, params));
        }, 800);
      });
    }
    const response = await apiClient.get<GetUsuariosResponse>('/usuarios', {
      params: limpiarFiltros(params),
    });
    return response.data;
  },

  /**
   * Obtiene la lista paginada de usuarios de una Finca (Empleados).
   */
  getUsuariosFinca: async (idFinca: number, params: GetUsuariosRequest): Promise<GetUsuariosResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const dataFinca = mockUsuariosFincas[idFinca] || [];
          resolve(filterAndPaginate(dataFinca, params));
        }, 800);
      });
    }
    const response = await apiClient.get<GetUsuariosResponse>(`/fincas/${idFinca}/usuarios`, {
      params: limpiarFiltros(params),
    });
    return response.data;
  },

  /**
   * Helper exclusivo de testing para actualizar el rol de un usuario en el array mock.
   */
  _mockUpdateRol: (id_usuario: number, rol: { id_rol: number; nombre_rol: string }) => {
    const user = mockUsuariosCroply.find(u => u.id_usuario === id_usuario);
    if (user) {
      user.rol = rol;
    }
  },

  /**
   * Helper exclusivo de testing para agregar un usuario al array mock.
   */
  _mockAddUsuario: (usuario: UsuarioListado) => {
    mockUsuariosCroply.unshift(usuario);
  },

  /**
   * Helper exclusivo de testing para agregar un usuario al array mock de finca.
   */
  _mockAddUsuarioFinca: (id_finca: number, usuario: UsuarioListado) => {
    if (!mockUsuariosFincas[id_finca]) {
      mockUsuariosFincas[id_finca] = [];
    }
    mockUsuariosFincas[id_finca].unshift(usuario);
  },

  /**
   * Helper exclusivo de testing para buscar un usuario por email en la finca.
   */
  _mockGetUsuarioFincaByEmail: (id_finca: number, email: string): UsuarioListado | undefined => {
    if (!mockUsuariosFincas[id_finca]) return undefined;
    return mockUsuariosFincas[id_finca].find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  /**
   * Helper exclusivo de testing para actualizar el rol de un usuario en una finca específica.
   */
  _mockUpdateRolFinca: (id_finca: number, id_usuario_finca: number, rol: { id_rol: number; nombre_rol: string }) => {
    if (!mockUsuariosFincas[id_finca]) return;
    const user = mockUsuariosFincas[id_finca].find(u => u.id_usuario === id_usuario_finca);
    if (user) {
      user.rol = rol;
    }
  },

  /**
   * Helper exclusivo de testing para actualizar el estado de un usuario globalmente en los mocks.
   */
  _mockUpdateEstado: (id_usuario: number, estado: "Activo" | "Inactivo" | "Pendiente") => {
    // Buscar en Croply
    const userCroply = mockUsuariosCroply.find(u => u.id_usuario === id_usuario);
    if (userCroply) userCroply.estado = estado;

    // Buscar en Fincas
    Object.values(mockUsuariosFincas).forEach(fincaUsers => {
      const userFinca = fincaUsers.find(u => u.id_usuario === id_usuario);
      if (userFinca) userFinca.estado = estado;
    });
  },

  /**
   * Actualiza el estado de cuenta de un usuario.
   */
  actualizarEstado: async (id_usuario: number, data: ActualizarEstadoRequest): Promise<ActualizarEstadoResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Buscamos al usuario en cualquier mock para validar su estado anterior si fuera necesario.
          let userMock = mockUsuariosCroply.find(u => u.id_usuario === id_usuario);
          if (!userMock) {
            for (const fincaUsers of Object.values(mockUsuariosFincas)) {
              const u = fincaUsers.find(u => u.id_usuario === id_usuario);
              if (u) {
                userMock = u;
                break;
              }
            }
          }

          if (!userMock) {
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

          let message = "Estado de cuenta actualizado correctamente.";
          if (userMock.estado === "Pendiente" && data.estado === "Inactivo") {
            message = "Estado de cuenta actualizado correctamente. La invitación pendiente fue cancelada.";
          }

          usuariosService._mockUpdateEstado(id_usuario, data.estado);

          resolve({
            message,
            id_usuario,
            estado: data.estado
          });
        }, 500);
      });
    }
    const response = await apiClient.put<ActualizarEstadoResponse>(`/usuarios/${id_usuario}/estado`, data);
    return response.data;
  },

  /**
   * Obtiene los datos del perfil del usuario logueado.
   */
  getPerfil: async (): Promise<PerfilResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id_usuario: 1,
            email: "admin@croply.com",
            nombre: "Admin",
            apellido: "Sistema",
            telefono: "+54 112233-4455",
            estado: "Activo",
            rol_sistema: "Administrador de Sistema",
            fecha_alta: "2026-01-01"
          });
        }, 500);
      });
    }
    const response = await apiClient.get<PerfilResponse>('/usuarios/me');
    return response.data;
  },

  /**
   * Actualiza los datos del perfil del usuario (nombre, apellido, teléfono).
   */
  actualizarPerfil: async (data: ActualizarPerfilRequest): Promise<ActualizarPerfilResponse> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            message: "Perfil actualizado correctamente.",
            usuario: {
              nombre: data.nombre,
              apellido: data.apellido,
              telefono: data.telefono
            }
          });
        }, 500);
      });
    }
    const response = await apiClient.put<ActualizarPerfilResponse>('/usuarios/me', data);
    return response.data;
  }
};
