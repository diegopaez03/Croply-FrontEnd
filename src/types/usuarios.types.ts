export interface UsuarioListado {
  id_usuario: number;
  id_usuario_finca?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: { id_rol: number; nombre_rol: string } | null;
  estado: "Pendiente" | "Activo" | "Inactivo" | "Aprobada" | "Rechazada";
  fecha_baja?: string | null;
}

/**
 * Fila de invitación pendiente que devuelve GET /fincas/:id_finca/usuarios.
 * Todavía no existe usuario, por eso los datos personales e ids vienen en null.
 */
export interface InvitacionPendienteListado {
  id_usuario: null;
  id_usuario_finca: null;
  id_invitacion_finca: number;
  nombre: null;
  apellido: null;
  telefono: null;
  email: string;
  rol: { id_rol: number; nombre_rol: string } | null;
  estado: "Pendiente";
}

/** Fila del listado de usuarios de una finca: usuario real o invitación pendiente. */
export type UsuarioFincaListado = UsuarioListado | InvitacionPendienteListado;

export function esInvitacionPendiente(u: UsuarioFincaListado): u is InvitacionPendienteListado {
  return u.id_usuario === null;
}

export function esUsuarioReal(u: UsuarioFincaListado): u is UsuarioListado {
  return u.id_usuario !== null;
}

export interface GetUsuariosRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  id_rol?: number | string;
  estado?: string;
}

export interface GetUsuariosResponse {
  usuarios: UsuarioListado[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface GetUsuariosFincaResponse {
  usuarios: UsuarioFincaListado[];
  pagination: GetUsuariosResponse['pagination'];
}

export interface ActualizarEstadoRequest {
  estado: "Activo" | "Inactivo" | "Pendiente";
}

export interface ActualizarEstadoResponse {
  message: string;
  id_usuario: number;
  estado: "Activo" | "Inactivo" | "Pendiente";
}

export interface ActualizarPerfilRequest {
  nombre: string;
  apellido: string;
  telefono?: string;
}

export interface ActualizarPerfilResponse {
  message: string;
  usuario: {
    nombre: string;
    apellido: string;
    telefono?: string;
  };
}

export interface PerfilResponse {
  id_usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  estado: string;
  rol_sistema?: string | null;
  fecha_alta: string;
}
