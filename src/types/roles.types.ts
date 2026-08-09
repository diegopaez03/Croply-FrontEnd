/**
 * El backend devuelve los permisos como objetos; los mocks locales todavía
 * usan ids sueltos. Normalizar con `getPermisoIds` antes de consumirlos.
 */
export type PermisoAsignado = number | Permiso;

export interface RolSistema {
  id_rol: number;
  nombre_rol: string;
  descripcion?: string;
  cantidad_usuarios_asignados: number;
  permisos?: PermisoAsignado[];
}

export interface RolesSistemaResponse {
  roles: RolSistema[];
}

export interface CreateRolSistemaRequest {
  nombre_rol: string;
  descripcion?: string;
}

export interface UpdateRolSistemaRequest {
  nombre_rol: string;
  descripcion?: string;
}

export interface AsignarRolSistemaRequest {
  id_rol: number;
}

export interface AsignarRolSistemaResponse {
  message: string;
  id_usuario: number;
  id_rol: number;
  nombre_rol: string;
}

export interface RolFinca {
  id_rol: number;
  nombre_rol: string;
  descripcion?: string;
  cantidad_usuarios_asignados: number;
  permisos?: PermisoAsignado[];
}

export interface RolesFincaResponse {
  roles: RolFinca[];
}

export interface CreateRolFincaRequest {
  nombre_rol: string;
  descripcion?: string;
}

export interface UpdateRolFincaRequest {
  nombre_rol: string;
  descripcion?: string;
}

export interface AsignarRolFincaRequest {
  id_rol: number;
}

export interface AsignarRolFincaResponse {
  message: string;
  id_usuario_finca: number;
  id_rol: number;
  nombre_rol: string;
}

export interface Permiso {
  id_permiso: number;
  nombre_permiso: string;
}

export function getPermisoIds(permisos?: PermisoAsignado[]): number[] {
  return (permisos ?? []).map((p) => (typeof p === 'number' ? p : p.id_permiso));
}

export interface PermisosResponse {
  permisos: Permiso[];
}

export interface GuardarPermisosRequest {
  permisos: number[];
}

export interface GuardarPermisosResponse {
  message: string;
}
